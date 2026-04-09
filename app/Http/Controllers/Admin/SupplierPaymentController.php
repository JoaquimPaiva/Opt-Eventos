<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSupplierPaymentStatusRequest;
use App\Models\SupplierPayment;
use App\Services\Audit\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierPaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $status = (string) $request->query('status', '');
        $search = trim((string) $request->query('search', ''));

        $supplierPaymentsQuery = SupplierPayment::query()
            ->with(['booking.user', 'booking.event', 'booking.hotel'])
            ->latest();

        if ($status !== '') {
            $supplierPaymentsQuery->where('status', $status);
        }

        if ($search !== '') {
            $supplierPaymentsQuery->where(function ($query) use ($search): void {
                $query
                    ->where('id', 'like', "%{$search}%")
                    ->orWhereHas('booking', fn ($bookingQuery) => $bookingQuery
                        ->where('id', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($userQuery) => $userQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%"))
                        ->orWhereHas('hotel', fn ($hotelQuery) => $hotelQuery->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('event', fn ($eventQuery) => $eventQuery->where('name', 'like', "%{$search}%")));
            });
        }

        $supplierPayments = $supplierPaymentsQuery
            ->limit(200)
            ->get()
            ->map(fn (SupplierPayment $supplierPayment) => [
                'id' => $supplierPayment->id,
                'booking_id' => $supplierPayment->booking->id,
                'customer_name' => $supplierPayment->booking->user->name,
                'customer_email' => $supplierPayment->booking->user->email,
                'event_name' => $supplierPayment->booking->event->name,
                'hotel_name' => $supplierPayment->booking->hotel->name,
                'amount' => (float) $supplierPayment->amount,
                'currency' => $supplierPayment->currency,
                'due_date' => $supplierPayment->due_date->toDateString(),
                'status' => $supplierPayment->status,
                'paid_at' => $supplierPayment->paid_at?->toDateTimeString(),
                'is_due' => now()->startOfDay()->greaterThan($supplierPayment->due_date->startOfDay()),
            ])
            ->values();

        return Inertia::render('Admin/SupplierPayments/Index', [
            'supplier_payments' => $supplierPayments,
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
        ]);
    }

    public function updateStatus(UpdateSupplierPaymentStatusRequest $request, SupplierPayment $supplierPayment, AuditLogger $auditLogger): RedirectResponse
    {
        $previousStatus = $supplierPayment->status;
        $status = (string) $request->validated('status');

        $supplierPayment->update([
            'status' => $status,
            'paid_at' => $status === 'PAID' ? now() : null,
        ]);

        $auditLogger->log(
            action: 'admin.supplier_payment.status_updated',
            actor: $request->user(),
            auditableType: SupplierPayment::class,
            auditableId: (string) $supplierPayment->id,
            metadata: [
                'previous_status' => $previousStatus,
                'new_status' => $status,
            ],
            request: $request
        );

        return back()->with('success', 'Supplier payment status updated successfully.');
    }
}
