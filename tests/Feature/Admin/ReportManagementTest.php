<?php

namespace Tests\Feature\Admin;

use App\Models\Booking;
use App\Models\Event;
use App\Models\Hotel;
use App\Models\MealPlan;
use App\Models\Payment;
use App\Models\Rate;
use App\Models\RoomType;
use App\Models\SupplierPayment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_reports_page(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.reports.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Admin/Reports/Index'));
    }

    public function test_non_admin_cannot_access_reports_page(): void
    {
        $client = User::factory()->create(['role' => 'CLIENT']);

        $this->actingAs($client)
            ->get(route('admin.reports.index'))
            ->assertForbidden();
    }

    public function test_admin_can_export_reports_csv(): void
    {
        $admin = User::factory()->admin()->create();
        $this->createBookingBundle('CONFIRMED', 'PAID', 'PENDING', 400, 250, '2026-03-10 10:00:00');

        $response = $this->actingAs($admin)
            ->get(route('admin.reports.export', [
                'date_from' => '2026-03-01',
                'date_to' => '2026-03-31',
            ]));

        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
        $response->assertHeader('content-disposition');
        $csvContent = $response->streamedContent();
        $this->assertStringContainsString('section,metric,value', $csvContent);
        $this->assertStringContainsString('daily_trends', $csvContent);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $admin->id,
            'action' => 'admin.report.exported',
        ]);
    }

    public function test_non_admin_cannot_export_reports_csv(): void
    {
        $client = User::factory()->create(['role' => 'CLIENT']);

        $this->actingAs($client)
            ->get(route('admin.reports.export'))
            ->assertForbidden();
    }

    public function test_reports_metrics_respect_selected_date_range(): void
    {
        $admin = User::factory()->admin()->create();

        $inRangeDate = '2026-03-10 12:00:00';
        $outRangeDate = '2026-01-15 12:00:00';

        $this->createBookingBundle('CONFIRMED', 'PAID', 'PENDING', 500, 320, $inRangeDate);
        $this->createBookingBundle('CANCELLED', 'REFUNDED', 'OVERDUE', 300, 180, $inRangeDate);
        $this->createBookingBundle('CONFIRMED', 'PAID', 'PAID', 900, 600, $outRangeDate);

        $this->actingAs($admin)
            ->get(route('admin.reports.index', [
                'date_from' => '2026-03-01',
                'date_to' => '2026-03-31',
            ]))
            ->assertOk()
            ->assertInertia(
                fn ($page) => $page
                    ->component('Admin/Reports/Index')
                    ->where('metrics.total_bookings', 2)
                    ->where('metrics.confirmed_bookings', 1)
                    ->where('metrics.cancelled_bookings', 1)
                    ->where('metrics.client_revenue_paid', 500)
                    ->where('metrics.client_refunded', 300)
                    ->where('metrics.supplier_payable', 500)
                    ->where('metrics.estimated_margin', 180)
                    ->where('daily_trends.0.date', '2026-03-10')
                    ->where('daily_trends.0.revenue_paid', 500)
            );
    }

    private function createBookingBundle(
        string $bookingStatus,
        string $paymentStatus,
        string $supplierStatus,
        float $totalPrice,
        float $supplierAmount,
        string $createdAt
    ): void {
        $user = User::factory()->create();
        $event = Event::factory()->create();
        $hotel = Hotel::factory()->create(['event_id' => $event->id]);
        $roomType = RoomType::factory()->create(['name' => fake()->unique()->word(), 'max_guests' => 2]);
        $mealPlan = MealPlan::factory()->create(['name' => fake()->unique()->word()]);
        $rate = Rate::factory()->create([
            'hotel_id' => $hotel->id,
            'room_type_id' => $roomType->id,
            'meal_plan_id' => $mealPlan->id,
            'cost_price' => $supplierAmount / 2,
            'sale_price' => $totalPrice / 2,
        ]);

        $booking = Booking::query()->create([
            'user_id' => $user->id,
            'event_id' => $event->id,
            'hotel_id' => $hotel->id,
            'rate_id' => $rate->id,
            'check_in' => '2026-07-10',
            'check_out' => '2026-07-12',
            'guests' => 2,
            'nights' => 2,
            'subtotal' => $totalPrice,
            'fees_total' => 0,
            'total_price' => $totalPrice,
            'status' => $bookingStatus,
        ]);

        Payment::query()->create([
            'booking_id' => $booking->id,
            'provider' => 'STRIPE_MOCK',
            'amount' => $totalPrice,
            'currency' => 'EUR',
            'status' => $paymentStatus,
            'due_date' => now()->addDays(3)->toDateString(),
            'paid_at' => in_array($paymentStatus, ['PAID', 'REFUNDED'], true) ? now() : null,
        ]);

        SupplierPayment::query()->create([
            'booking_id' => $booking->id,
            'amount' => $supplierAmount,
            'currency' => 'EUR',
            'due_date' => now()->addDays(10)->toDateString(),
            'status' => $supplierStatus,
            'paid_at' => $supplierStatus === 'PAID' ? now() : null,
        ]);

        Booking::query()->whereKey($booking->id)->update([
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ]);
    }
}
