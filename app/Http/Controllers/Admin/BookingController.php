<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateBookingStatusRequest;
use App\Models\Booking;
use App\Models\Rate;
use App\Services\Audit\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function index(Request $request): Response
    {
        $status = (string) $request->query('status', '');
        $paymentStatus = (string) $request->query('payment_status', '');
        $search = trim((string) $request->query('search', ''));

        $bookingsQuery = Booking::query()
            ->with(['user', 'event', 'hotel', 'rate.roomType', 'rate.mealPlan', 'payment'])
            ->latest();

        if ($status !== '') {
            $bookingsQuery->where('status', $status);
        }

        if ($paymentStatus !== '') {
            $bookingsQuery->whereHas('payment', fn ($query) => $query->where('status', $paymentStatus));
        }

        if ($search !== '') {
            $bookingsQuery->where(function ($query) use ($search): void {
                $query
                    ->where('id', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($userQuery) => $userQuery
                        ->where('email', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%"))
                    ->orWhereHas('hotel', fn ($hotelQuery) => $hotelQuery->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('event', fn ($eventQuery) => $eventQuery->where('name', 'like', "%{$search}%"));
            });
        }

        $bookings = $bookingsQuery
            ->limit(200)
            ->get()
            ->map(fn (Booking $booking) => [
                'id' => $booking->id,
                'customer_name' => $booking->user->name,
                'customer_email' => $booking->user->email,
                'customer_nationality' => $booking->user->nationality,
                'customer_nif' => $booking->user->nif,
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
                'can_cancel' => $this->canCancelByPolicy($booking),
                'can_delete' => $this->canDeleteBooking($booking),
            ])
            ->values();

        return Inertia::render('Admin/Bookings/Index', [
            'bookings' => $bookings,
            'filters' => [
                'status' => $status,
                'payment_status' => $paymentStatus,
                'search' => $search,
            ],
        ]);
    }

    public function updateStatus(UpdateBookingStatusRequest $request, Booking $booking, AuditLogger $auditLogger): RedirectResponse
    {
        $data = $request->validated();
        $previousStatus = $booking->status;

        DB::transaction(function () use ($booking, $data): void {
            /** @var Booking $lockedBooking */
            $lockedBooking = Booking::query()
                ->with(['rate', 'payment'])
                ->lockForUpdate()
                ->findOrFail($booking->id);

            $newStatus = (string) $data['status'];
            if ($newStatus === $lockedBooking->status) {
                return;
            }

            if ($lockedBooking->status !== 'CANCELLED' && $newStatus === 'CANCELLED') {
                $lockedBooking->rate->increment('stock');
            }

            if ($lockedBooking->status === 'CANCELLED' && $newStatus !== 'CANCELLED') {
                if ($lockedBooking->rate->stock <= 0) {
                    throw ValidationException::withMessages([
                        'status' => 'Não é possível reativar esta reserva porque não existe stock disponível.',
                    ]);
                }

                $lockedBooking->rate->decrement('stock');
            }

            $lockedBooking->update([
                'status' => $newStatus,
                'cancellation_reason' => $newStatus === 'CANCELLED'
                    ? (($data['cancellation_reason'] ?? null) ?: 'Cancelado pelo administrador.')
                    : null,
                'cancelled_at' => $newStatus === 'CANCELLED' ? now() : null,
            ]);

            if ($lockedBooking->payment !== null) {
                $policy = (string) $lockedBooking->rate->cancellation_policy;
                $hasAnyPaidInstallment = $lockedBooking->payment->paid_at !== null
                    || $lockedBooking->payment->deposit_paid_at !== null
                    || $lockedBooking->payment->balance_paid_at !== null
                    || $lockedBooking->payment->status === 'PAID';
                $nextPaymentStatus = match ($newStatus) {
                    'CANCELLED' => match (true) {
                        $policy === Rate::CANCELLATION_POLICY_FREE && $hasAnyPaidInstallment => 'REFUNDED',
                        $policy !== Rate::CANCELLATION_POLICY_FREE && $hasAnyPaidInstallment => 'PAID',
                        default => 'FAILED',
                    },
                    'CONFIRMED', 'PENDING' => in_array($lockedBooking->payment->status, ['FAILED', 'REFUNDED'], true)
                        ? 'PENDING'
                        : $lockedBooking->payment->status,
                    default => $lockedBooking->payment->status,
                };

                $lockedBooking->payment->update([
                    'status' => $nextPaymentStatus,
                    'paid_at' => $nextPaymentStatus === 'REFUNDED' ? now() : $lockedBooking->payment->paid_at,
                ]);
            }
        });

        $booking->refresh()->load('payment');
        $auditLogger->log(
            action: 'admin.booking.status_updated',
            actor: $request->user(),
            auditableType: Booking::class,
            auditableId: (string) $booking->id,
            metadata: [
                'previous_status' => $previousStatus,
                'new_status' => $booking->status,
                'payment_status' => $booking->payment?->status,
            ],
            request: $request
        );

        return back()->with('success', 'Estado da reserva atualizado com sucesso.');
    }

    public function destroy(Request $request, Booking $booking, AuditLogger $auditLogger): RedirectResponse
    {
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
                action: 'admin.booking.deleted',
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

        return back()->with('success', 'Reserva apagada com sucesso.');
    }

    private function canDeleteBooking(Booking $booking): bool
    {
        return $booking->status === 'CANCELLED'
            || $booking->check_out->lt(now()->startOfDay());
    }

    private function displayPaymentStatus(?\App\Models\Payment $payment): ?string
    {
        if ($payment === null) {
            return null;
        }

        if (
            $payment->installment_type === \App\Models\Payment::INSTALLMENT_BALANCE
            && $payment->deposit_paid_at !== null
            && $payment->status === 'PENDING'
        ) {
            return 'PARTIALLY_PAID';
        }

        return $payment->status;
    }

    private function canCancelByPolicy(Booking $booking): bool
    {
        if ($booking->status === 'CANCELLED') {
            return false;
        }

        if ((string) $booking->rate->cancellation_policy === Rate::CANCELLATION_POLICY_FREE) {
            return $booking->rate->cancellation_deadline !== null
                && now()->lessThanOrEqualTo($booking->rate->cancellation_deadline);
        }

        return true;
    }
}
