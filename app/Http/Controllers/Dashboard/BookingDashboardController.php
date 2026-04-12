<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\CancelBookingRequest;
use App\Models\Booking;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Rate;
use App\Models\User;
use App\Notifications\AdminBookingConfirmedNotification;
use App\Notifications\BookingCancelledNotification;
use App\Notifications\PaymentConfirmedNotification;
use App\Services\Audit\AuditLogger;
use App\Services\Billing\InvoiceService;
use App\Services\Payments\PaymentIntentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class BookingDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $bookings = Booking::query()
            ->with(['event', 'hotel', 'rate.roomType', 'rate.mealPlan', 'payment'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(fn (Booking $booking) => [
                'id' => $booking->id,
                'event_name' => $booking->event->name,
                'hotel_name' => $booking->hotel->name,
                'check_in' => $booking->check_in->toDateString(),
                'check_out' => $booking->check_out->toDateString(),
                'room_type' => $booking->rate->roomType->name,
                'meal_plan' => $booking->rate->mealPlan->name,
                'total_price' => (float) $booking->total_price,
                'currency' => $booking->payment?->currency ?? 'EUR',
                'booking_status' => $booking->status,
                'payment_status' => $this->displayPaymentStatus($booking->payment),
                'can_delete' => $this->canDeleteBooking($booking),
            ])
            ->values();

        return Inertia::render('Dashboard/Bookings/Index', [
            'bookings' => $bookings,
        ]);
    }

    public function show(Request $request, Booking $booking): Response
    {
        abort_unless($booking->user_id === $request->user()->id, 404);

        $booking->load(['event', 'hotel', 'rate.roomType', 'rate.mealPlan', 'payment', 'supplierPayment']);
        $canCancel = $this->canCancelBookingByPolicy($booking);

        return Inertia::render('Dashboard/Bookings/Show', [
            'booking' => [
                'id' => $booking->id,
                'event_name' => $booking->event->name,
                'hotel_name' => $booking->hotel->name,
                'check_in' => $booking->check_in->toDateString(),
                'check_out' => $booking->check_out->toDateString(),
                'guests' => $booking->guests,
                'nights' => $booking->nights,
                'room_type' => $booking->rate->roomType->name,
                'meal_plan' => $booking->rate->mealPlan->name,
                'subtotal' => (float) $booking->subtotal,
                'fees_total' => (float) $booking->fees_total,
                'total_price' => (float) $booking->total_price,
                'currency' => $booking->payment?->currency ?? 'EUR',
                'booking_status' => $booking->status,
                'payment_status' => $this->displayPaymentStatus($booking->payment),
                'payment_due_date' => $booking->payment?->due_date?->toDateString(),
                'supplier_payment_status' => $booking->supplierPayment?->status,
                'supplier_due_date' => $booking->supplierPayment?->due_date?->toDateString(),
                'can_cancel' => $canCancel,
                'can_delete' => $this->canDeleteBooking($booking),
                'cancellation_policy' => $booking->rate->cancellation_policy,
                'cancellation_deadline' => $booking->rate->cancellation_deadline?->toDateTimeString(),
            ],
        ]);
    }

    public function destroy(Request $request, Booking $booking, AuditLogger $auditLogger): RedirectResponse
    {
        abort_unless($booking->user_id === $request->user()->id, 404);

        DB::transaction(function () use ($booking, $request, $auditLogger): void {
            /** @var Booking $lockedBooking */
            $lockedBooking = Booking::query()
                ->lockForUpdate()
                ->findOrFail($booking->id);

            if (! $this->canDeleteBooking($lockedBooking)) {
                throw ValidationException::withMessages([
                    'booking_delete' => 'Só é possível apagar reservas canceladas ou reservas cuja estadia já terminou.',
                ]);
            }

            $auditLogger->log(
                action: 'customer.booking.deleted',
                actor: $request->user(),
                auditableType: Booking::class,
                auditableId: (string) $lockedBooking->id,
                metadata: [
                    'booking_status' => (string) $lockedBooking->status,
                    'check_out' => $lockedBooking->check_out->toDateString(),
                ],
                request: $request
            );

            $lockedBooking->delete();
        });

        return to_route('dashboard.bookings.index')->with('success', 'Reserva apagada com sucesso.');
    }

    public function cancel(CancelBookingRequest $request, Booking $booking): RedirectResponse
    {
        abort_unless($booking->user_id === $request->user()->id, 404);

        DB::transaction(function () use ($booking, $request): void {
            /** @var Booking $lockedBooking */
            $lockedBooking = Booking::query()
                ->with(['rate', 'payment'])
                ->lockForUpdate()
                ->findOrFail($booking->id);

            if ($lockedBooking->status === 'CANCELLED') {
                throw ValidationException::withMessages([
                    'booking' => 'Esta reserva já está cancelada.',
                ]);
            }

            $policy = (string) $lockedBooking->rate->cancellation_policy;
            if (
                $policy === Rate::CANCELLATION_POLICY_FREE
                && $lockedBooking->rate->cancellation_deadline !== null
                && now()->greaterThan($lockedBooking->rate->cancellation_deadline)
            ) {
                throw ValidationException::withMessages([
                    'booking' => 'O prazo para cancelamento gratuito desta reserva já terminou.',
                ]);
            }

            $lockedBooking->update([
                'status' => 'CANCELLED',
                'cancellation_reason' => $request->string('cancellation_reason')->toString() ?: 'Cancelado pelo cliente.',
                'cancelled_at' => now(),
            ]);

            $lockedBooking->rate->increment('stock');

            if ($lockedBooking->payment !== null) {
                $hasAnyPaidInstallment = $lockedBooking->payment->paid_at !== null
                    || $lockedBooking->payment->deposit_paid_at !== null
                    || $lockedBooking->payment->balance_paid_at !== null
                    || $lockedBooking->payment->status === 'PAID';
                $nextStatus = match (true) {
                    $policy === Rate::CANCELLATION_POLICY_FREE && $hasAnyPaidInstallment => 'REFUNDED',
                    $policy !== Rate::CANCELLATION_POLICY_FREE && $hasAnyPaidInstallment => 'PAID',
                    default => 'FAILED',
                };

                $lockedBooking->payment->update([
                    'status' => $nextStatus,
                    'paid_at' => $nextStatus === 'REFUNDED' ? now() : $lockedBooking->payment->paid_at,
                ]);
            }
        });

        $booking->refresh()->loadMissing(['event', 'hotel']);
        $request->user()->notify(new BookingCancelledNotification($booking));

        return back()->with('success', 'Reserva cancelada com sucesso.');
    }

    public function payment(Request $request, Booking $booking): Response
    {
        abort_unless($booking->user_id === $request->user()->id, 404);

        $booking->load(['event', 'hotel', 'rate', 'payment', 'invoices']);
        abort_if($booking->payment === null, 404);

        return Inertia::render('Dashboard/Bookings/Payment', [
            'payment' => [
                'booking_id' => $booking->id,
                'event_name' => $booking->event->name,
                'hotel_name' => $booking->hotel->name,
                'provider' => $booking->payment->provider,
                'provider_reference' => $booking->payment->provider_reference,
                'amount' => (float) $booking->payment->amount,
                'currency' => $booking->payment->currency,
                'status' => $booking->payment->status,
                'display_status' => $this->displayPaymentStatus($booking->payment),
                'due_date' => $booking->payment->due_date?->toDateString(),
                'paid_at' => $booking->payment->paid_at?->toDateTimeString(),
                'installment_type' => $booking->payment->installment_type,
                'cancellation_policy' => $booking->rate->cancellation_policy,
                'deposit_amount' => $booking->rate->deposit_amount !== null ? (float) $booking->rate->deposit_amount : null,
                'balance_due_days_before_checkin' => $booking->rate->balance_due_days_before_checkin,
                'deposit_due_date' => $booking->payment->deposit_due_date?->toDateString(),
                'balance_due_date' => $booking->payment->balance_due_date?->toDateString(),
                'deposit_paid_at' => $booking->payment->deposit_paid_at?->toDateTimeString(),
                'balance_paid_at' => $booking->payment->balance_paid_at?->toDateTimeString(),
                'balance_amount' => $booking->payment->balance_amount !== null ? (float) $booking->payment->balance_amount : null,
                'is_stripe_provider' => $this->isStripeBackedProvider(),
                'can_confirm_test_payment' => ! $this->isStripeBackedProvider()
                    && $this->canAcceptPayment($booking->payment)
                    && $booking->status !== 'CANCELLED',
                'can_prepare_online_payment' => $this->canAcceptPayment($booking->payment)
                    && $booking->status !== 'CANCELLED',
                'billing_documents' => $booking->invoices
                    ->where('document_type', Invoice::TYPE_INVOICE)
                    ->sortByDesc('issued_at')
                    ->map(fn (Invoice $invoice) => $this->mapBillingDocument($invoice, $booking))
                    ->values()
                    ->all(),
            ],
        ]);
    }

    public function billingDocuments(Request $request): Response
    {
        $documents = Invoice::query()
            ->with(['booking.event:id,name', 'booking.hotel:id,name', 'booking.payment:id,booking_id,status'])
            ->where('document_type', Invoice::TYPE_INVOICE)
            ->whereHas('booking', fn ($query) => $query->where('user_id', $request->user()->id))
            ->orderByDesc('issued_at')
            ->orderByDesc('created_at')
            ->get()
            ->map(function (Invoice $invoice) {
                $booking = $invoice->booking;

                if ($booking === null) {
                    return null;
                }

                return [
                    ...$this->mapBillingDocument($invoice, $booking),
                    'event_name' => (string) $booking->event?->name,
                    'hotel_name' => (string) $booking->hotel?->name,
                    'booking_status' => (string) $booking->status,
                    'payment_status' => $this->displayPaymentStatus($booking->payment),
                    'booking_url' => route('dashboard.bookings.show', $booking->id),
                    'payment_url' => route('dashboard.bookings.payment', $booking->id),
                ];
            })
            ->filter()
            ->values()
            ->all();

        return Inertia::render('Dashboard/Billing/Index', [
            'documents' => $documents,
        ]);
    }

    public function downloadBillingDocument(
        Request $request,
        Booking $booking,
        Invoice $invoice,
        InvoiceService $invoiceService
    )
    {
        abort_unless($booking->user_id === $request->user()->id, 404);
        abort_unless((string) $invoice->booking_id === (string) $booking->id, 404);

        if (app()->environment('local') || $request->boolean('refresh')) {
            $invoiceService->regenerateDocumentFile($invoice);
            $invoice->refresh();
        }

        if (! filled($invoice->file_path) || ! Storage::disk('local')->exists((string) $invoice->file_path)) {
            throw ValidationException::withMessages([
                'invoice' => 'Documento indisponível para download.',
            ]);
        }

        // Evita erro 500 no header Content-Disposition quando o número da fatura
        // contém "/" ou "\" (ex.: "FT A/12").
        $safeInvoiceNumber = preg_replace('/[\\\\\/]+/', '-', (string) $invoice->invoice_number);
        $safeInvoiceNumber = trim((string) $safeInvoiceNumber);
        if ($safeInvoiceNumber === '') {
            $safeInvoiceNumber = sprintf('fatura-%s', (string) $invoice->id);
        }

        return Storage::disk('local')->download(
            (string) $invoice->file_path,
            sprintf('%s.html', $safeInvoiceNumber),
        );
    }

    public function paymentIntent(
        Request $request,
        Booking $booking,
        PaymentIntentService $paymentIntentService,
        AuditLogger $auditLogger
    ): JsonResponse {
        abort_unless($booking->user_id === $request->user()->id, 404);

        $booking->load('payment');
        if ($booking->status === 'CANCELLED' || $booking->payment === null) {
            throw ValidationException::withMessages([
                'payment' => 'Esta reserva não está elegível para pagamento.',
            ]);
        }

        if (! $this->canAcceptPayment($booking->payment)) {
            throw ValidationException::withMessages([
                'payment' => 'Este pagamento já se encontra regularizado.',
            ]);
        }

        try {
            $intent = $paymentIntentService->create(
                amount: (float) $booking->payment->amount,
                currency: (string) $booking->payment->currency
            );
        } catch (RuntimeException $exception) {
            throw ValidationException::withMessages([
                'payment' => $exception->getMessage(),
            ]);
        }

        $paymentReference = (string) $intent['payment_reference'];
        $paymentUpdate = [
            'provider' => (string) $intent['provider'],
            'provider_reference' => $paymentReference,
            'status' => 'PENDING',
            'paid_at' => null,
        ];
        if ($booking->payment->installment_type === Payment::INSTALLMENT_DEPOSIT) {
            $paymentUpdate['deposit_provider_reference'] = $paymentReference;
        } elseif ($booking->payment->installment_type === Payment::INSTALLMENT_BALANCE) {
            $paymentUpdate['balance_provider_reference'] = $paymentReference;
        }
        $booking->payment->update($paymentUpdate);

        $auditLogger->log(
            action: 'customer.payment.intent_created',
            actor: $request->user(),
            auditableType: Payment::class,
            auditableId: (string) $booking->payment->id,
            metadata: [
                'booking_id' => $booking->id,
                'provider' => (string) $intent['provider'],
                'payment_reference' => $paymentReference,
                'installment_type' => $booking->payment->installment_type,
            ],
            request: $request
        );

        return response()->json($intent, 201);
    }

    public function confirmPayment(
        Request $request,
        Booking $booking,
        AuditLogger $auditLogger,
        InvoiceService $invoiceService
    ): RedirectResponse
    {
        abort_unless($booking->user_id === $request->user()->id, 404);

        if ($this->isStripeBackedProvider()) {
            throw ValidationException::withMessages([
                'payment' => 'A confirmação manual de teste está desativada quando o pagamento online está ativo.',
            ]);
        }

        $bookingFullyPaid = false;
        $paidInstallmentType = null;
        DB::transaction(function () use ($booking, &$bookingFullyPaid, &$paidInstallmentType): void {
            /** @var Booking $lockedBooking */
            $lockedBooking = Booking::query()
                ->with(['payment'])
                ->lockForUpdate()
                ->findOrFail($booking->id);

            if ($lockedBooking->status === 'CANCELLED') {
                throw ValidationException::withMessages([
                    'payment' => 'Não é possível pagar uma reserva cancelada.',
                ]);
            }

            if ($lockedBooking->payment === null) {
                throw ValidationException::withMessages([
                    'payment' => 'Não foi encontrado um registo de pagamento para esta reserva.',
                ]);
            }

            if (! $this->canAcceptPayment($lockedBooking->payment)) {
                return;
            }

            $paidInstallmentType = (string) $lockedBooking->payment->installment_type;
            $bookingFullyPaid = $this->markCurrentInstallmentAsPaid($lockedBooking->payment);
        });

        $booking->refresh()->load(['payment', 'user', 'event', 'hotel', 'rate.roomType', 'rate.mealPlan']);
        if ($paidInstallmentType !== null && $booking->payment !== null) {
            $invoiceService->issueAndSendForInstallment($booking, $booking->payment, $paidInstallmentType);
        }

        if ($bookingFullyPaid) {
            $booking->loadMissing(['event', 'hotel']);
            $request->user()->notify(new PaymentConfirmedNotification($booking));
            $this->notifyAdminsBookingConfirmed($booking);
        }
        $auditLogger->log(
            action: 'customer.payment.confirmed',
            actor: $request->user(),
            auditableType: Payment::class,
            auditableId: $booking->payment !== null ? (string) $booking->payment->id : null,
            metadata: [
                'booking_id' => $booking->id,
                'payment_status' => $booking->payment?->status,
                'display_status' => $this->displayPaymentStatus($booking->payment),
            ],
            request: $request
        );

        return back()->with('success', 'Pagamento confirmado com sucesso.');
    }

    public function syncStripePayment(
        Request $request,
        Booking $booking,
        AuditLogger $auditLogger,
        InvoiceService $invoiceService
    ): JsonResponse
    {
        abort_unless($booking->user_id === $request->user()->id, 404);

        if (! $this->isStripeBackedProvider()) {
            throw ValidationException::withMessages([
                'payment' => 'A sincronização de pagamento só está disponível quando o provedor de pagamento online está ativo.',
            ]);
        }

        $booking->load('payment');
        if ($booking->status === 'CANCELLED' || $booking->payment === null) {
            throw ValidationException::withMessages([
                'payment' => 'Esta reserva não está elegível para sincronização de pagamento.',
            ]);
        }

        if (! $this->canAcceptPayment($booking->payment)) {
            throw ValidationException::withMessages([
                'payment' => 'Este pagamento já se encontra regularizado.',
            ]);
        }

        $reference = (string) $booking->payment->provider_reference;
        if ($reference === '') {
            throw ValidationException::withMessages([
                'payment' => 'Falta a referência de pagamento necessária para sincronizar com a Stripe.',
            ]);
        }

        $secretKey = trim((string) config('payment.stripe_secret_key', ''));
        if ($secretKey === '') {
            throw ValidationException::withMessages([
                'payment' => 'A configuração da Stripe está incompleta. Contacta o suporte.',
            ]);
        }

        $response = Http::withBasicAuth($secretKey, '')
            ->timeout(15)
            ->get(sprintf('https://api.stripe.com/v1/payment_intents/%s', $reference));

        if ($response->failed()) {
            throw ValidationException::withMessages([
                'payment' => 'De momento não foi possível sincronizar o pagamento com a Stripe. Tenta novamente em instantes.',
            ]);
        }

        $stripeStatus = (string) ($response->json('status') ?? '');
        $nextStatus = match ($stripeStatus) {
            'succeeded' => 'PAID',
            'requires_payment_method', 'canceled' => 'FAILED',
            default => 'PENDING',
        };

        $bookingFullyPaid = false;
        $paidInstallmentType = null;
        if ($nextStatus === 'PAID') {
            $paidInstallmentType = (string) $booking->payment->installment_type;
            $bookingFullyPaid = $this->markCurrentInstallmentAsPaid($booking->payment);
        } else {
            $booking->payment->update([
                'status' => $nextStatus,
                'paid_at' => null,
            ]);
        }

        if ($paidInstallmentType !== null) {
            $booking->loadMissing(['user', 'event', 'hotel', 'rate.roomType', 'rate.mealPlan']);
            $invoiceService->issueAndSendForInstallment($booking, $booking->payment, $paidInstallmentType);
        }

        if ($bookingFullyPaid) {
            $booking->loadMissing(['event', 'hotel']);
            $request->user()->notify(new PaymentConfirmedNotification($booking));
            $this->notifyAdminsBookingConfirmed($booking);
        }

        $auditLogger->log(
            action: 'customer.payment.synced',
            actor: $request->user(),
            auditableType: Payment::class,
            auditableId: (string) $booking->payment->id,
            metadata: [
                'booking_id' => $booking->id,
                'provider_reference' => $reference,
                'stripe_status' => $stripeStatus,
                'payment_status' => $booking->payment->status,
                'display_status' => $this->displayPaymentStatus($booking->payment),
            ],
            request: $request
        );

        return response()->json([
            'status' => $booking->payment->status,
            'display_status' => $this->displayPaymentStatus($booking->payment),
            'stripe_status' => $stripeStatus,
            'paid_at' => $booking->payment->fresh()?->paid_at?->toDateTimeString(),
        ]);
    }

    private function notifyAdminsBookingConfirmed(Booking $booking): void
    {
        $booking->loadMissing(['user', 'event', 'hotel', 'payment']);

        User::query()
            ->where('role', 'ADMIN')
            ->whereNotNull('email')
            ->get()
            ->each(fn (User $admin) => $admin->notify(new AdminBookingConfirmedNotification($booking)));
    }

    private function canAcceptPayment(Payment $payment): bool
    {
        return in_array((string) $payment->status, ['PENDING', 'FAILED'], true);
    }

    private function mapBillingDocument(Invoice $invoice, Booking $booking): array
    {
        return [
            'id' => $invoice->id,
            'booking_id' => (string) $booking->id,
            'document_type' => (string) $invoice->document_type,
            'number' => (string) $invoice->invoice_number,
            'installment_type' => (string) $invoice->installment_type,
            'amount' => (float) $invoice->amount,
            'currency' => (string) $invoice->currency,
            'issued_at' => $invoice->issued_at?->toDateTimeString(),
            'download_url' => route('dashboard.bookings.billing.download', [
                'booking' => $booking->id,
                'invoice' => $invoice->id,
            ]),
        ];
    }

    private function isStripeBackedProvider(): bool
    {
        $provider = strtoupper((string) config('payment.provider', 'STRIPE_MOCK'));

        return in_array($provider, ['STRIPE', 'PAYPAL', 'REVOLUT'], true);
    }

    private function displayPaymentStatus(?Payment $payment): ?string
    {
        if ($payment === null) {
            return null;
        }

        if (
            $payment->installment_type === Payment::INSTALLMENT_BALANCE
            && $payment->deposit_paid_at !== null
            && $payment->status === 'PENDING'
        ) {
            return 'PARTIALLY_PAID';
        }

        return $payment->status;
    }

    private function markCurrentInstallmentAsPaid(Payment $payment): bool
    {
        if ($payment->installment_type === Payment::INSTALLMENT_DEPOSIT) {
            $hasBalance = ((float) ($payment->balance_amount ?? 0)) > 0;
            if (! $hasBalance) {
                $payment->update([
                    'status' => 'PAID',
                    'deposit_paid_at' => now(),
                    'paid_at' => now(),
                ]);

                return true;
            }

            $payment->update([
                'status' => 'PENDING',
                'installment_type' => Payment::INSTALLMENT_BALANCE,
                'deposit_paid_at' => now(),
                'amount' => (float) $payment->balance_amount,
                'due_date' => $payment->balance_due_date,
                'provider_reference' => null,
                'paid_at' => null,
            ]);

            return false;
        }

        if ($payment->installment_type === Payment::INSTALLMENT_BALANCE) {
            $payment->update([
                'status' => 'PAID',
                'balance_paid_at' => now(),
                'paid_at' => now(),
            ]);

            return true;
        }

        $payment->update([
            'status' => 'PAID',
            'paid_at' => now(),
        ]);

        return true;
    }

    private function canDeleteBooking(Booking $booking): bool
    {
        return $booking->status === 'CANCELLED'
            || $booking->check_out->lt(now()->startOfDay());
    }

    private function canCancelBookingByPolicy(Booking $booking): bool
    {
        if ($booking->status === 'CANCELLED') {
            return false;
        }

        $policy = (string) $booking->rate->cancellation_policy;
        if ($policy === Rate::CANCELLATION_POLICY_FREE) {
            return $booking->rate->cancellation_deadline !== null
                && now()->lessThanOrEqualTo($booking->rate->cancellation_deadline);
        }

        return true;
    }
}
