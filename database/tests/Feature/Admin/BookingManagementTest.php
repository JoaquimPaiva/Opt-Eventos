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

class BookingManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_admin_bookings_index(): void
    {
        $admin = User::factory()->admin()->create();
        $booking = $this->createBookingFor(User::factory()->create(), 'CONFIRMED', 'PAID');

        $this->actingAs($admin)
            ->get(route('admin.bookings.index'))
            ->assertOk()
            ->assertInertia(
                fn ($page) => $page
                    ->component('Admin/Bookings/Index')
                    ->where('bookings.0.id', $booking->id)
            );
    }

    public function test_non_admin_cannot_access_admin_bookings(): void
    {
        $client = User::factory()->create(['role' => 'CLIENT']);

        $this->actingAs($client)
            ->get(route('admin.bookings.index'))
            ->assertForbidden();
    }

    public function test_admin_can_cancel_booking_and_payment_is_updated_and_stock_returns(): void
    {
        $admin = User::factory()->admin()->create();
        $booking = $this->createBookingFor(User::factory()->create(), 'CONFIRMED', 'PAID');
        $originalStock = $booking->rate->stock;

        $this->actingAs($admin)
            ->patch(route('admin.bookings.update-status', $booking), [
                'status' => 'CANCELLED',
                'cancellation_reason' => 'Manual cancellation',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'CANCELLED',
            'cancellation_reason' => 'Manual cancellation',
        ]);

        $this->assertDatabaseHas('payments', [
            'booking_id' => $booking->id,
            'status' => 'REFUNDED',
        ]);

        $booking->rate->refresh();
        $this->assertSame($originalStock + 1, $booking->rate->stock);
    }

    public function test_admin_can_reactivate_cancelled_booking_and_stock_is_consumed_again(): void
    {
        $admin = User::factory()->admin()->create();
        $booking = $this->createBookingFor(User::factory()->create(), 'CANCELLED', 'FAILED');
        $startingStock = $booking->rate->stock;

        $this->actingAs($admin)
            ->patch(route('admin.bookings.update-status', $booking), [
                'status' => 'CONFIRMED',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'CONFIRMED',
            'cancellation_reason' => null,
        ]);

        $this->assertDatabaseHas('payments', [
            'booking_id' => $booking->id,
            'status' => 'PENDING',
        ]);

        $booking->rate->refresh();
        $this->assertSame($startingStock - 1, $booking->rate->stock);
    }

    public function test_admin_can_delete_cancelled_booking(): void
    {
        $admin = User::factory()->admin()->create();
        $booking = $this->createBookingFor(User::factory()->create(), 'CANCELLED', 'FAILED');

        $this->actingAs($admin)
            ->delete(route('admin.bookings.destroy', $booking))
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('bookings', [
            'id' => $booking->id,
        ]);
        $this->assertDatabaseMissing('payments', [
            'booking_id' => $booking->id,
        ]);
        $this->assertDatabaseMissing('supplier_payments', [
            'booking_id' => $booking->id,
        ]);
    }

    public function test_admin_can_delete_booking_after_checkout_date_has_passed(): void
    {
        $admin = User::factory()->admin()->create();
        $booking = $this->createBookingFor(
            user: User::factory()->create(),
            bookingStatus: 'CONFIRMED',
            paymentStatus: 'PAID',
            checkOut: now()->subDay()->toDateString()
        );

        $this->actingAs($admin)
            ->delete(route('admin.bookings.destroy', $booking))
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('bookings', [
            'id' => $booking->id,
        ]);
    }

    public function test_admin_cannot_delete_active_booking_before_checkout_date(): void
    {
        $admin = User::factory()->admin()->create();
        $booking = $this->createBookingFor(User::factory()->create(), 'CONFIRMED', 'PENDING');

        $this->actingAs($admin)
            ->from(route('admin.bookings.index'))
            ->delete(route('admin.bookings.destroy', $booking))
            ->assertRedirect(route('admin.bookings.index'))
            ->assertSessionHasErrors('booking_delete');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
        ]);
    }

    private function createBookingFor(
        User $user,
        string $bookingStatus,
        string $paymentStatus,
        ?string $checkOut = null
    ): Booking
    {
        $event = Event::factory()->create();
        $hotel = Hotel::factory()->create(['event_id' => $event->id]);
        $roomType = RoomType::factory()->create(['name' => fake()->unique()->word(), 'max_guests' => 2]);
        $mealPlan = MealPlan::factory()->create(['name' => fake()->unique()->word()]);
        $rate = Rate::factory()->create([
            'hotel_id' => $hotel->id,
            'room_type_id' => $roomType->id,
            'meal_plan_id' => $mealPlan->id,
            'stock' => 7,
            'cancellation_deadline' => now()->addDays(10),
        ]);

        $booking = Booking::query()->create([
            'user_id' => $user->id,
            'event_id' => $event->id,
            'hotel_id' => $hotel->id,
            'rate_id' => $rate->id,
            'check_in' => now()->addDays(20)->toDateString(),
            'check_out' => $checkOut ?? now()->addDays(22)->toDateString(),
            'guests' => 2,
            'nights' => 2,
            'subtotal' => 320,
            'fees_total' => 0,
            'total_price' => 320,
            'status' => $bookingStatus,
            'cancellation_reason' => $bookingStatus === 'CANCELLED' ? 'Previous cancellation' : null,
            'cancelled_at' => $bookingStatus === 'CANCELLED' ? now()->subDay() : null,
        ]);

        Payment::query()->create([
            'booking_id' => $booking->id,
            'provider' => 'STRIPE_MOCK',
            'amount' => 320,
            'currency' => 'EUR',
            'status' => $paymentStatus,
            'due_date' => now()->addDays(2)->toDateString(),
            'paid_at' => $paymentStatus === 'PAID' ? now() : null,
        ]);

        SupplierPayment::query()->create([
            'booking_id' => $booking->id,
            'amount' => 220,
            'currency' => 'EUR',
            'due_date' => now()->addDays(12)->toDateString(),
            'status' => 'PENDING',
        ]);

        return $booking->fresh(['rate']) ?? $booking;
    }
}
