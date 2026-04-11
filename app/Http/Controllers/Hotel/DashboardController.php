<?php

namespace App\Http\Controllers\Hotel;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Hotel;
use App\Models\SupplierPayment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $hotelId = $request->user()?->hotel_id;
        if ($hotelId === null) {
            abort(403, 'A conta de hotel não está associada a nenhum hotel.');
        }

        $hotel = Hotel::query()
            ->select(['id', 'name', 'supplier_name', 'address'])
            ->findOrFail($hotelId);

        $bookingsBaseQuery = Booking::query()->where('hotel_id', $hotelId);
        $supplierPaymentsBaseQuery = SupplierPayment::query()
            ->whereHas('booking', fn ($query) => $query->where('hotel_id', $hotelId));

        $bookingsTotal = (clone $bookingsBaseQuery)->count();
        $bookingsPending = (clone $bookingsBaseQuery)->where('status', 'PENDING')->count();
        $bookingsConfirmed = (clone $bookingsBaseQuery)->where('status', 'CONFIRMED')->count();
        $bookingsCancelled = (clone $bookingsBaseQuery)->where('status', 'CANCELLED')->count();

        $supplierReceivedPaid = (float) (clone $supplierPaymentsBaseQuery)
            ->where('status', 'PAID')
            ->sum('amount');
        $supplierPendingToReceive = (float) (clone $supplierPaymentsBaseQuery)
            ->where('status', 'PENDING')
            ->sum('amount');
        $supplierOverdueToReceive = (float) (clone $supplierPaymentsBaseQuery)
            ->where('status', 'PENDING')
            ->whereDate('due_date', '<', now()->toDateString())
            ->sum('amount');

        $avgNights = round((float) ((clone $bookingsBaseQuery)
            ->whereIn('status', ['PENDING', 'CONFIRMED'])
            ->avg('nights') ?? 0), 1);

        $nextCheckIns = Booking::query()
            ->with(['user', 'event', 'supplierPayment', 'payment'])
            ->where('hotel_id', $hotelId)
            ->whereIn('status', ['PENDING', 'CONFIRMED'])
            ->whereDate('check_in', '>=', now()->toDateString())
            ->orderBy('check_in')
            ->limit(8)
            ->get()
            ->map(fn (Booking $booking) => [
                'id' => $booking->id,
                'customer_name' => $booking->user->name,
                'event_name' => $booking->event->name,
                'check_in' => $booking->check_in->toDateString(),
                'check_out' => $booking->check_out->toDateString(),
                'nights' => $booking->nights,
                'booking_status' => $booking->status,
                'customer_payment_status' => $booking->payment?->status ?? 'N/D',
                'supplier_amount' => (float) ($booking->supplierPayment?->amount ?? 0),
                'currency' => $booking->supplierPayment?->currency ?? 'EUR',
                'supplier_payment_status' => $booking->supplierPayment?->status ?? 'N/D',
                'supplier_due_date' => $booking->supplierPayment?->due_date?->toDateString(),
            ])
            ->values();

        return Inertia::render('Hotel/Dashboard', [
            'hotel' => [
                'id' => $hotel->id,
                'name' => $hotel->name,
                'supplier_name' => $hotel->supplier_name,
                'address' => $hotel->address,
            ],
            'metrics' => [
                'bookings_total' => $bookingsTotal,
                'bookings_pending' => $bookingsPending,
                'bookings_confirmed' => $bookingsConfirmed,
                'bookings_cancelled' => $bookingsCancelled,
                'average_nights' => $avgNights,
                'supplier_received_paid' => $supplierReceivedPaid,
                'supplier_pending_to_receive' => $supplierPendingToReceive,
                'supplier_overdue_to_receive' => $supplierOverdueToReceive,
                'currency' => 'EUR',
            ],
            'next_checkins' => $nextCheckIns,
        ]);
    }
}
