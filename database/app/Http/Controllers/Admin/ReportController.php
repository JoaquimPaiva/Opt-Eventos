<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\SupplierPayment;
use App\Services\Audit\AuditLogger;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        [$dateFrom, $dateTo] = $this->resolveRange($request);
        [$metrics, $topEvents, $dailyTrends] = $this->buildReportData($dateFrom, $dateTo);

        return Inertia::render('Admin/Reports/Index', [
            'filters' => [
                'date_from' => $dateFrom->toDateString(),
                'date_to' => $dateTo->toDateString(),
            ],
            'metrics' => $metrics,
            'top_events' => $topEvents,
            'daily_trends' => $dailyTrends,
        ]);
    }

    public function export(Request $request, AuditLogger $auditLogger): StreamedResponse
    {
        [$dateFrom, $dateTo] = $this->resolveRange($request);
        [$metrics, $topEvents, $dailyTrends] = $this->buildReportData($dateFrom, $dateTo);

        $auditLogger->log(
            action: 'admin.report.exported',
            actor: $request->user(),
            auditableType: null,
            auditableId: null,
            metadata: [
                'date_from' => $dateFrom->toDateString(),
                'date_to' => $dateTo->toDateString(),
            ],
            request: $request
        );

        $filename = sprintf(
            'financial-report-%s-to-%s.csv',
            $dateFrom->toDateString(),
            $dateTo->toDateString()
        );

        return response()->streamDownload(function () use ($dateFrom, $dateTo, $metrics, $topEvents, $dailyTrends): void {
            $out = fopen('php://output', 'wb');
            if ($out === false) {
                return;
            }

            fputcsv($out, ['section', 'metric', 'value']);
            fputcsv($out, ['period', 'date_from', $dateFrom->toDateString()]);
            fputcsv($out, ['period', 'date_to', $dateTo->toDateString()]);

            foreach ($metrics as $key => $value) {
                fputcsv($out, ['metrics', (string) $key, (string) $value]);
            }

            foreach ($topEvents as $event) {
                fputcsv($out, ['top_events', (string) $event['name'], (string) $event['revenue']]);
            }

            foreach ($dailyTrends as $trend) {
                fputcsv($out, ['daily_trends', (string) $trend['date'], (string) $trend['revenue_paid']]);
            }

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * @return array{0: CarbonImmutable, 1: CarbonImmutable}
     */
    private function resolveRange(Request $request): array
    {
        $validated = $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
        ]);

        $dateFrom = isset($validated['date_from'])
            ? CarbonImmutable::parse((string) $validated['date_from'])->startOfDay()
            : CarbonImmutable::now()->subDays(30)->startOfDay();
        $dateTo = isset($validated['date_to'])
            ? CarbonImmutable::parse((string) $validated['date_to'])->endOfDay()
            : CarbonImmutable::now()->endOfDay();

        return [$dateFrom, $dateTo];
    }

    /**
     * @return array{
     *   0: array<string, float|int>,
     *   1: \Illuminate\Support\Collection<int, array{id:int,name:string,bookings_count:int,revenue:float}>,
     *   2: \Illuminate\Support\Collection<int, array{
     *     date:string,total_bookings:int,cancelled_bookings:int,revenue_paid:float,supplier_cost:float,margin:float
     *   }>
     * }
     */
    private function buildReportData(CarbonImmutable $dateFrom, CarbonImmutable $dateTo): array
    {
        $bookingsInRange = Booking::query()->whereBetween('created_at', [$dateFrom, $dateTo]);

        $totalBookings = (clone $bookingsInRange)->count();
        $confirmedBookings = (clone $bookingsInRange)->where('status', 'CONFIRMED')->count();
        $pendingBookings = (clone $bookingsInRange)->where('status', 'PENDING')->count();
        $cancelledBookings = (clone $bookingsInRange)->where('status', 'CANCELLED')->count();

        $clientRevenuePaid = (float) Payment::query()
            ->where('status', 'PAID')
            ->whereHas('booking', fn ($query) => $query->whereBetween('created_at', [$dateFrom, $dateTo]))
            ->sum('amount');
        $clientReceivablePending = (float) Payment::query()
            ->where('status', 'PENDING')
            ->whereHas('booking', fn ($query) => $query->whereBetween('created_at', [$dateFrom, $dateTo]))
            ->sum('amount');
        $clientRefunded = (float) Payment::query()
            ->where('status', 'REFUNDED')
            ->whereHas('booking', fn ($query) => $query->whereBetween('created_at', [$dateFrom, $dateTo]))
            ->sum('amount');

        $supplierPaid = (float) SupplierPayment::query()
            ->where('status', 'PAID')
            ->whereHas('booking', fn ($query) => $query->whereBetween('created_at', [$dateFrom, $dateTo]))
            ->sum('amount');
        $supplierPayable = (float) SupplierPayment::query()
            ->whereIn('status', ['PENDING', 'OVERDUE'])
            ->whereHas('booking', fn ($query) => $query->whereBetween('created_at', [$dateFrom, $dateTo]))
            ->sum('amount');

        $estimatedMargin = (float) DB::table('bookings')
            ->join('supplier_payments', 'supplier_payments.booking_id', '=', 'bookings.id')
            ->whereBetween('bookings.created_at', [$dateFrom, $dateTo])
            ->whereIn('bookings.status', ['CONFIRMED', 'PENDING'])
            ->selectRaw('COALESCE(SUM(bookings.total_price - supplier_payments.amount), 0) as margin')
            ->value('margin');

        $cancellationRate = $totalBookings > 0
            ? round(($cancelledBookings / $totalBookings) * 100, 2)
            : 0.0;

        $topEvents = DB::table('bookings')
            ->join('events', 'events.id', '=', 'bookings.event_id')
            ->whereBetween('bookings.created_at', [$dateFrom, $dateTo])
            ->whereIn('bookings.status', ['CONFIRMED', 'PENDING'])
            ->groupBy('events.id', 'events.name')
            ->selectRaw('events.id, events.name, COUNT(bookings.id) as bookings_count, COALESCE(SUM(bookings.total_price), 0) as revenue')
            ->orderByDesc('revenue')
            ->limit(5)
            ->get()
            ->map(fn ($event) => [
                'id' => (int) $event->id,
                'name' => (string) $event->name,
                'bookings_count' => (int) $event->bookings_count,
                'revenue' => (float) $event->revenue,
            ])
            ->values();

        $dailyTrends = DB::table('bookings')
            ->leftJoin('payments', 'payments.booking_id', '=', 'bookings.id')
            ->leftJoin('supplier_payments', 'supplier_payments.booking_id', '=', 'bookings.id')
            ->whereBetween('bookings.created_at', [$dateFrom, $dateTo])
            ->groupBy(DB::raw('DATE(bookings.created_at)'))
            ->orderBy(DB::raw('DATE(bookings.created_at)'))
            ->selectRaw("
                DATE(bookings.created_at) as day,
                COUNT(bookings.id) as total_bookings,
                SUM(CASE WHEN bookings.status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled_bookings,
                COALESCE(SUM(CASE WHEN payments.status = 'PAID' THEN payments.amount ELSE 0 END), 0) as revenue_paid,
                COALESCE(SUM(CASE WHEN bookings.status IN ('CONFIRMED', 'PENDING') THEN supplier_payments.amount ELSE 0 END), 0) as supplier_cost
            ")
            ->get()
            ->map(fn ($row) => [
                'date' => (string) $row->day,
                'total_bookings' => (int) $row->total_bookings,
                'cancelled_bookings' => (int) $row->cancelled_bookings,
                'revenue_paid' => (float) $row->revenue_paid,
                'supplier_cost' => (float) $row->supplier_cost,
                'margin' => (float) $row->revenue_paid - (float) $row->supplier_cost,
            ])
            ->values();

        $metrics = [
            'total_bookings' => $totalBookings,
            'confirmed_bookings' => $confirmedBookings,
            'pending_bookings' => $pendingBookings,
            'cancelled_bookings' => $cancelledBookings,
            'cancellation_rate' => $cancellationRate,
            'client_revenue_paid' => $clientRevenuePaid,
            'client_receivable_pending' => $clientReceivablePending,
            'client_refunded' => $clientRefunded,
            'supplier_paid' => $supplierPaid,
            'supplier_payable' => $supplierPayable,
            'estimated_margin' => $estimatedMargin,
        ];

        return [$metrics, $topEvents, $dailyTrends];
    }
}
