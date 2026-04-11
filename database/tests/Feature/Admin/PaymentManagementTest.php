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

class PaymentManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_client_payments_index(): void
    {
        $admin = User::factory()->admin()->create();
        $payment = $this->createPaymentFor(User::factory()->create(), 'PENDING');

        $this->actingAs($admin)
            ->get(route('admin.payments.index'))
            ->assertOk()
            ->assertInertia(
                fn ($page) => $page
                    ->component('Admin/Payments/Index')
                    ->where('payments.0.id', $payment->id)
            );
    }

    public function test_non_admin_cannot_access_client_payments_index(): void
    {
        $client = User::factory()->create(['role' => 'CLIENT']);

        $this->actingAs($client)
            ->get(route('admin.payments.index'))
            ->assertForbidden();
    }

    public function test_admin_can_mark_payment_as_paid_and_paid_at_is_set(): void
    {
        $admin = User::factory()->admin()->create();
        $payment = $this->createPaymentFor(User::factory()->create(), 'PENDING');

        $this->actingAs($admin)
            ->patch(route('admin.payments.update-status', $payment), [
                'status' => 'PAID',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'status' => 'PAID',
        ]);

        $payment->refresh();
        $this->assertNotNull($payment->paid_at);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $admin->id,
            'action' => 'admin.payment.status_updated',
            'auditable_type' => Payment::class,
            'auditable_id' => (string) $payment->id,
        ]);
    }

    public function test_switching_to_pending_or_failed_clears_paid_at(): void
    {
        $admin = User::factory()->admin()->create();
        $paidPayment = $this->createPaymentFor(User::factory()->create(), 'PAID');

        $this->actingAs($admin)
            ->patch(route('admin.payments.update-status', $paidPayment), [
                'status' => 'PENDING',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('payments', [
            'id' => $paidPayment->id,
            'status' => 'PENDING',
            'paid_at' => null,
        ]);

        $this->actingAs($admin)
            ->patch(route('admin.payments.update-status', $paidPayment), [
                'status' => 'FAILED',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('payments', [
            'id' => $paidPayment->id,
            'status' => 'FAILED',
            'paid_at' => null,
        ]);
    }

    private function createPaymentFor(User $user, string $paymentStatus): Payment
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

        $payment = Payment::query()->create([
            'booking_id' => $booking->id,
            'provider' => 'STRIPE_MOCK',
            'amount' => 360,
            'currency' => 'EUR',
            'status' => $paymentStatus,
            'due_date' => now()->addDays(3)->toDateString(),
            'paid_at' => $paymentStatus === 'PAID' ? now()->subHour() : null,
        ]);

        SupplierPayment::query()->create([
            'booking_id' => $booking->id,
            'amount' => 240,
            'currency' => 'EUR',
            'due_date' => now()->addDays(10)->toDateString(),
            'status' => 'PENDING',
        ]);

        return $payment;
    }
}
