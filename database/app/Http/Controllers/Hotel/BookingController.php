<?php

namespace App\Http\Controllers\Hotel;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function index(Request $request): Response
    {
        $hotelId = $request->user()?->hotel_id;
        if ($hotelId === null) {
            abort(403, 'Hotel account is not linked to a hotel.');
        }

        $status = (string) $request->query('status', '');
        $paymentStatus = (string) $request->query('payment_status', '');
        $search = trim((string) $request->query('search', ''));

        $bookingsQuery = Booking::query()
            ->with(['user', 'event', 'hotel', 'rate.roomType', 'rate.mealPlan', 'payment'])
            ->where('hotel_id', $hotelId)
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
            ])
            ->values();

        return Inertia::render('Hotel/Bookings/Index', [
            'bookings' => $bookings,
            'filters' => [
                'status' => $status,
                'payment_status' => $paymentStatus,
                'search' => $search,
            ],
        ]);
    }
}
