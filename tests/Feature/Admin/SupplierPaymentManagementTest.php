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

class SupplierPaymentManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_supplier_payments_index(): void
    {
        $admin = User::factory()->admin()->create();
        $supplierPayment = $this->createSupplierPaymentFor(User::factory()->create(), 'PENDING');

        $this->actingAs($admin)
            ->get(route('admin.supplier-payments.index'))
            ->assertOk()
            ->assertInertia(
                fn ($page) => $page
                    ->component('Admin/SupplierPayments/Index')
                    ->where('supplier_payments.0.id', $supplierPayment->id)
            );
    }

    public function test_non_admin_cannot_access_supplier_payments_index(): void
    {
        $client = User::factory()->create(['role' => 'CLIENT']);

        $this->actingAs($client)
            ->get(route('admin.supplier-payments.index'))
            ->assertForbidden();
    }

    public function test_admin_can_mark_supplier_payment_as_paid_and_paid_at_is_set(): void
    {
        $admin = User::factory()->admin()->create();
        $supplierPayment = $this->createSupplierPaymentFor(User::factory()->create(), 'PENDING');

        $this->actingAs($admin)
            ->patch(route('admin.supplier-payments.update-status', $supplierPayment), [
                'status' => 'PAID',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('supplier_payments', [
            'id' => $supplierPayment->id,
            'status' => 'PAID',
        ]);

        $supplierPayment->refresh();
        $this->assertNotNull($supplierPayment->paid_at);
    }

    public function test_switching_back_to_pending_clears_paid_at(): void
    {
        $admin = User::factory()->admin()->create();
        $supplierPayment = $this->createSupplierPaymentFor(User::factory()->create(), 'PAID');

        $this->actingAs($admin)
            ->patch(route('admin.supplier-payments.update-status', $supplierPayment), [
                'status' => 'PENDING',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('supplier_payments', [
            'id' => $supplierPayment->id,
            'status' => 'PENDING',
            'paid_at' => null,
        ]);
    }

    private function createSupplierPaymentFor(User $user, string $supplierPaymentStatus): SupplierPayment
    {
        $event = Event::factory()->create();
        $hotel = Hotel::factory()->create(['event_id' => $event->id]);
        $roomType = RoomType::factory()->create(['name' => fake()->unique()->word(), 'max_guests' => 2]);
        $mealPlan = MealPlan::factory()->create(['name' => fake()->unique()->word()]);
        $rate = Rate::factory()->create([
            'hotel_id' => $hotel->id,
            'room_type_id' => $roomType->id,
            'meal_plan_id' => $mealPlan->id,
        ]);

        $booking = Booking::query()->create([
            'user_id' => $user->id,
            'event_id' => $event->id,
            'hotel_id' => $hotel->id,
            'rate_id' => $rate->id,
            'check_in' => now()->addDays(20)->toDateString(),
            'check_out' => now()->addDays(22)->toDateString(),
            'guests' => 2,
            'nights' => 2,
            'subtotal' => 360,
            'fees_total' => 0,
            'total_price' => 360,
            'status' => 'CONFIRMED',
        ]);

        Payment::query()->create([
            'booking_id' => $booking->id,
            'provider' => 'STRIPE_MOCK',
            'amount' => 360,
            'currency' => 'EUR',
            'status' => 'PENDING',
            'due_date' => now()->addDays(3)->toDateString(),
        ]);

        return SupplierPayment::query()->create([
            'booking_id' => $booking->id,
            'amount' => 240,
            'currency' => 'EUR',
            'due_date' => now()->addDays(10)->toDateString(),
            'status' => $supplierPaymentStatus,
            'paid_at' => $supplierPaymentStatus === 'PAID' ? now()->subHour() : null,
        ]);
    }
}
