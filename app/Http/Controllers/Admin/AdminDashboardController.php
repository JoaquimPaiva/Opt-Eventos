<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Event;
use App\Models\Payment;
use App\Models\SupplierPayment;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function __invoke(): Response
    {
        $totalBookings = Booking::query()->count();
        $confirmedBookings = Booking::query()->where('status', 'CONFIRMED')->count();
        $pendingBookings = Booking::query()->where('status', 'PENDING')->count();
        $cancelledBookings = Booking::query()->where('status', 'CANCELLED')->count();

        $clientRevenuePaid = (float) Payment::query()->where('status', 'PAID')->sum('amount');
        $clientReceivablePending = (float) Payment::query()->where('status', 'PENDING')->sum('amount');
        $supplierPayablePending = (float) SupplierPayment::query()->where('status', 'PENDING')->sum('amount');

        $estimatedMargin = (float) DB::table('bookings')
            ->join('supplier_payments', 'supplier_payments.booking_id', '=', 'bookings.id')
            ->whereIn('bookings.status', ['CONFIRMED', 'PENDING'])
            ->selectRaw('COALESCE(SUM(bookings.total_price - supplier_payments.amount), 0) as margin')
            ->value('margin');

        $upcomingEvents = Event::query()
            ->where('is_active', true)
            ->whereDate('start_date', '>=', now()->toDateString())
            ->orderBy('start_date')
            ->limit(5)
            ->get()
            ->map(fn (Event $event) => [
                'id' => $event->id,
                'name' => $event->name,
                'location' => $event->location,
                'start_date' => $event->start_date->toDateString(),
                'end_date' => $event->end_date->toDateString(),
            ])
            ->values();

        return Inertia::render('Admin/Dashboard', [
            'metrics' => [
                'total_bookings' => $totalBookings,
                'confirmed_bookings' => $confirmedBookings,
                'pending_bookings' => $pendingBookings,
                'cancelled_bookings' => $cancelledBookings,
                'client_revenue_paid' => $clientRevenuePaid,
                'client_receivable_pending' => $clientReceivablePending,
                'supplier_payable_pending' => $supplierPayablePending,
                'estimated_margin' => $estimatedMargin,
            ],
            'upcoming_events' => $upcomingEvents,
        ]);
    }
}
