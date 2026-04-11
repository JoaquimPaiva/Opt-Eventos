<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdatePaymentStatusRequest;
use App\Models\Payment;
use App\Services\Audit\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $status = (string) $request->query('status', '');
        $search = trim((string) $request->query('search', ''));

        $paymentsQuery = Payment::query()
            ->with(['booking.user', 'booking.event', 'booking.hotel'])
            ->latest();

        if ($status !== '') {
            $paymentsQuery->where('status', $status);
        }

        if ($search !== '') {
            $paymentsQuery->where(function ($query) use ($search): void {
                $query
                    ->where('provider_reference', 'like', "%{$search}%")
                    ->orWhereHas('booking', fn ($bookingQuery) => $bookingQuery
                        ->where('id', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($userQuery) => $userQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%"))
                        ->orWhereHas('hotel', fn ($hotelQuery) => $hotelQuery->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('event', fn ($eventQuery) => $eventQuery->where('name', 'like', "%{$search}%")));
            });
        }

        $payments = $paymentsQuery
            ->limit(200)
            ->get()
            ->map(fn (Payment $payment) => [
                'id' => $payment->id,
                'booking_id' => $payment->booking->id,
                'booking_status' => $payment->booking->status,
                'customer_name' => $payment->booking->user->name,
                'customer_email' => $payment->booking->user->email,
                'event_name' => $payment->booking->event->name,
                'hotel_name' => $payment->booking->hotel->name,
                'provider' => $payment->provider,
                'provider_reference' => $payment->provider_reference,
                'amount' => (float) $payment->amount,
                'currency' => $payment->currency,
                'due_date' => $payment->due_date->toDateString(),
                'status' => $payment->status,
                'paid_at' => $payment->paid_at?->toDateTimeString(),
                'is_due' => now()->startOfDay()->greaterThan($payment->due_date->startOfDay()),
            ])
            ->values();

        return Inertia::render('Admin/Payments/Index', [
            'payments' => $payments,
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
        ]);
    }

    public function updateStatus(UpdatePaymentStatusRequest $request, Payment $payment, AuditLogger $auditLogger): RedirectResponse
    {
        $previousStatus = $payment->status;
        $status = (string) $request->validated('status');

        if ($status === 'PAID') {
            $this->markCurrentInstallmentAsPaid($payment);
        } else {
            $payment->update([
                'status' => $status,
                'paid_at' => in_array($status, ['REFUNDED'], true) ? now() : null,
            ]);
        }

        $auditLogger->log(
            action: 'admin.payment.status_updated',
            actor: $request->user(),
            auditableType: Payment::class,
            auditableId: (string) $payment->id,
            metadata: [
                'previous_status' => $previousStatus,
                'new_status' => $status,
            ],
            request: $request
        );

        return back()->with('success', 'Client payment status updated successfully.');
    }

    private function markCurrentInstallmentAsPaid(Payment $payment): void
    {
        if ($payment->installment_type === Payment::INSTALLMENT_DEPOSIT) {
            $hasBalance = ((float) ($payment->balance_amount ?? 0)) > 0;
            if (! $hasBalance) {
                $payment->update([
                    'status' => 'PAID',
                    'deposit_paid_at' => now(),
                    'paid_at' => now(),
                ]);

                return;
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

            return;
        }

        if ($payment->installment_type === Payment::INSTALLMENT_BALANCE) {
            $payment->update([
                'status' => 'PAID',
                'balance_paid_at' => now(),
                'paid_at' => now(),
            ]);

            return;
        }

        $payment->update([
            'status' => 'PAID',
            'paid_at' => now(),
        ]);
    }
}
