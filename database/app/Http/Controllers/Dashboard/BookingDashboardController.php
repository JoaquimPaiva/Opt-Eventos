<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\CancelBookingRequest;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\User;
use App\Notifications\AdminBookingConfirmedNotification;
use App\Notifications\BookingCancelledNotification;
use App\Notifications\PaymentConfirmedNotification;
use App\Services\Audit\AuditLogger;
use App\Services\Payments\PaymentIntentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
                'payment_status' => $booking->payment?->status,
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
        $canCancel = $booking->status !== 'CANCELLED'
            && now()->lessThanOrEqualTo($booking->rate->cancellation_deadline);

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
                'payment_status' => $booking->payment?->status,
                'payment_due_date' => $booking->payment?->due_date?->toDateString(),
                'supplier_payment_status' => $booking->supplierPayment?->status,
                'supplier_due_date' => $booking->supplierPayment?->due_date?->toDateString(),
                'can_cancel' => $canCancel,
                'can_delete' => $this->canDeleteBooking($booking),
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
                    'booking_delete' => 'Only cancelled bookings or bookings with an ended stay can be deleted.',
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

        return to_route('dashboard.bookings.index')->with('success', 'Booking deleted successfully.');
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
                    'booking' => 'Booking is already cancelled.',
                ]);
            }

            if (now()->greaterThan($lockedBooking->rate->cancellation_deadline)) {
                throw ValidationException::withMessages([
                    'booking' => 'Cancellation deadline has passed for this booking.',
                ]);
            }

            $lockedBooking->update([
                'status' => 'CANCELLED',
                'cancellation_reason' => $request->string('cancellation_reason')->toString() ?: 'Cancelled by customer.',
                'cancelled_at' => now(),
            ]);

            $lockedBooking->rate->increment('stock');

            if ($lockedBooking->payment !== null) {
                $nextStatus = match ($lockedBooking->payment->status) {
                    'PAID' => 'REFUNDED',
                    'PENDING' => 'FAILED',
                    default => $lockedBooking->payment->status,
                };

                $lockedBooking->payment->update([
                    'status' => $nextStatus,
                    'paid_at' => $nextStatus === 'REFUNDED' ? now() : $lockedBooking->payment->paid_at,
                ]);
            }
        });

        $booking->refresh()->loadMissing(['event', 'hotel']);
        $request->user()->notify(new BookingCancelledNotification($booking));

        return back()->with('success', 'Booking cancelled successfully.');
    }

    public function payment(Request $request, Booking $booking): Response
    {
        abort_unless($booking->user_id === $request->user()->id, 404);

        $booking->load(['event', 'hotel', 'payment']);
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
                'due_date' => $booking->payment->due_date?->toDateString(),
                'paid_at' => $booking->payment->paid_at?->toDateTimeString(),
                'is_stripe_provider' => config('payment.provider') === 'STRIPE',
                'can_confirm_test_payment' => config('payment.provider') !== 'STRIPE'
                    && in_array((string) $booking->payment->status, ['PENDING', 'FAILED'], true)
                    && $booking->status !== 'CANCELLED',
                'can_prepare_online_payment' => in_array((string) $booking->payment->status, ['PENDING', 'FAILED'], true)
                    && $booking->status !== 'CANCELLED',
            ],
        ]);
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
                'payment' => 'This booking is not eligible for payment.',
            ]);
        }

        if (! in_array((string) $booking->payment->status, ['PENDING', 'FAILED'], true)) {
            throw ValidationException::withMessages([
                'payment' => 'This booking payment is already settled.',
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

        $booking->payment->update([
            'provider' => (string) $intent['provider'],
            'provider_reference' => (string) $intent['payment_reference'],
            'status' => 'PENDING',
            'paid_at' => null,
        ]);

        $auditLogger->log(
            action: 'customer.payment.intent_created',
            actor: $request->user(),
            auditableType: Payment::class,
            auditableId: (string) $booking->payment->id,
            metadata: [
                'booking_id' => $booking->id,
                'provider' => (string) $intent['provider'],
                'payment_reference' => (string) $intent['payment_reference'],
            ],
            request: $request
        );

        return response()->json($intent, 201);
    }

    public function confirmPayment(Request $request, Booking $booking, AuditLogger $auditLogger): RedirectResponse
    {
        abort_unless($booking->user_id === $request->user()->id, 404);

        if (config('payment.provider') === 'STRIPE') {
            throw ValidationException::withMessages([
                'payment' => 'Test confirmation is disabled when Stripe provider is active.',
            ]);
        }

        $paymentWasMarkedPaid = false;
        DB::transaction(function () use ($booking, &$paymentWasMarkedPaid): void {
            /** @var Booking $lockedBooking */
            $lockedBooking = Booking::query()
                ->with(['payment'])
                ->lockForUpdate()
                ->findOrFail($booking->id);

            if ($lockedBooking->status === 'CANCELLED') {
                throw ValidationException::withMessages([
                    'payment' => 'Cannot pay a cancelled booking.',
                ]);
            }

            if ($lockedBooking->payment === null) {
                throw ValidationException::withMessages([
                    'payment' => 'Payment record not found.',
                ]);
            }

            if ($lockedBooking->payment->status === 'PAID') {
                return;
            }

            $lockedBooking->payment->update([
                'status' => 'PAID',
                'paid_at' => now(),
            ]);
            $paymentWasMarkedPaid = true;
        });

        $booking->refresh()->load('payment');
        if ($paymentWasMarkedPaid) {
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
            ],
            request: $request
        );

        return back()->with('success', 'Payment confirmed successfully.');
    }

    public function syncStripePayment(Request $request, Booking $booking, AuditLogger $auditLogger): JsonResponse
    {
        abort_unless($booking->user_id === $request->user()->id, 404);

        if (config('payment.provider') !== 'STRIPE') {
            throw ValidationException::withMessages([
                'payment' => 'Stripe sync is only available when Stripe provider is active.',
            ]);
        }

        $booking->load('payment');
        if ($booking->status === 'CANCELLED' || $booking->payment === null) {
            throw ValidationException::withMessages([
                'payment' => 'This booking is not eligible for payment sync.',
            ]);
        }

        $reference = (string) $booking->payment->provider_reference;
        if ($reference === '') {
            throw ValidationException::withMessages([
                'payment' => 'Payment reference is missing for Stripe sync.',
            ]);
        }

        $secretKey = trim((string) config('payment.stripe_secret_key', ''));
        if ($secretKey === '') {
            throw ValidationException::withMessages([
                'payment' => 'Stripe secret key is not configured.',
            ]);
        }

        $response = Http::withBasicAuth($secretKey, '')
            ->timeout(15)
            ->get(sprintf('https://api.stripe.com/v1/payment_intents/%s', $reference));

        if ($response->failed()) {
            throw ValidationException::withMessages([
                'payment' => 'Unable to sync payment with Stripe right now.',
            ]);
        }

        $stripeStatus = (string) ($response->json('status') ?? '');
        $nextStatus = match ($stripeStatus) {
            'succeeded' => 'PAID',
            'requires_payment_method', 'canceled' => 'FAILED',
            default => 'PENDING',
        };

        $previousStatus = (string) $booking->payment->status;
        $booking->payment->update([
            'status' => $nextStatus,
            'paid_at' => $nextStatus === 'PAID' ? now() : null,
        ]);

        if ($nextStatus === 'PAID' && $previousStatus !== 'PAID') {
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
                'payment_status' => $nextStatus,
            ],
            request: $request
        );

        return response()->json([
            'status' => $nextStatus,
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

    private function canDeleteBooking(Booking $booking): bool
    {
        return $booking->status === 'CANCELLED'
            || $booking->check_out->lt(now()->startOfDay());
    }
}
