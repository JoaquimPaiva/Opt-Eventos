<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateBookingStatusRequest;
use App\Models\Booking;
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
                'can_cancel' => now()->lessThanOrEqualTo($booking->rate->cancellation_deadline),
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
                        'status' => 'Cannot reactivate booking because stock is 0.',
                    ]);
                }

                $lockedBooking->rate->decrement('stock');
            }

            $lockedBooking->update([
                'status' => $newStatus,
                'cancellation_reason' => $newStatus === 'CANCELLED'
                    ? (($data['cancellation_reason'] ?? null) ?: 'Cancelled by admin.')
                    : null,
                'cancelled_at' => $newStatus === 'CANCELLED' ? now() : null,
            ]);

            if ($lockedBooking->payment !== null) {
                $nextPaymentStatus = match ($newStatus) {
                    'CANCELLED' => match ($lockedBooking->payment->status) {
                        'PAID' => 'REFUNDED',
                        'PENDING' => 'FAILED',
                        default => $lockedBooking->payment->status,
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

        return back()->with('success', 'Booking status updated successfully.');
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
                    'booking_delete' => 'Only cancelled bookings or bookings with an ended stay can be deleted.',
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

        return back()->with('success', 'Booking deleted successfully.');
    }

    private function canDeleteBooking(Booking $booking): bool
    {
        return $booking->status === 'CANCELLED'
            || $booking->check_out->lt(now()->startOfDay());
    }
}
