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

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_admin_dashboard(): void
    {
        $admin = User::factory()->admin()->create();
        $this->createConfirmedBooking();

        $this->actingAs($admin)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(
                fn ($page) => $page
                    ->component('Admin/Dashboard')
                    ->where('metrics.total_bookings', 1)
                    ->where('metrics.confirmed_bookings', 1)
            );
    }

    public function test_non_admin_cannot_access_admin_dashboard(): void
    {
        $client = User::factory()->create(['role' => 'CLIENT']);

        $this->actingAs($client)
            ->get(route('admin.dashboard'))
            ->assertForbidden();
    }

    private function createConfirmedBooking(): void
    {
        $user = User::factory()->create();
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
            'check_in' => now()->addDays(10)->toDateString(),
            'check_out' => now()->addDays(12)->toDateString(),
            'guests' => 2,
            'nights' => 2,
            'subtotal' => 300,
            'fees_total' => 0,
            'total_price' => 300,
            'status' => 'CONFIRMED',
        ]);

        Payment::query()->create([
            'booking_id' => $booking->id,
            'provider' => 'STRIPE_MOCK',
            'amount' => 300,
            'currency' => 'EUR',
            'status' => 'PAID',
            'due_date' => now()->addDays(2)->toDateString(),
            'paid_at' => now(),
        ]);

        SupplierPayment::query()->create([
            'booking_id' => $booking->id,
            'amount' => 210,
            'currency' => 'EUR',
            'due_date' => now()->addDays(10)->toDateString(),
            'status' => 'PENDING',
        ]);
    }
}
