<?php

namespace Tests\Feature\Hotel;

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

class HotelBookingAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_hotel_user_can_access_hotel_bookings_index(): void
    {
        $hotel = Hotel::factory()->create(['event_id' => Event::factory()->create()->id]);
        $hotelUser = User::factory()->create([
            'role' => 'HOTEL',
            'hotel_id' => $hotel->id,
        ]);
        $booking = $this->createBookingForHotel($hotel);

        $this->actingAs($hotelUser)
            ->get(route('hotel.bookings.index'))
            ->assertOk()
            ->assertInertia(
                fn ($page) => $page
                    ->component('Hotel/Bookings/Index')
                    ->where('bookings.0.id', $booking->id)
            );
    }

    public function test_hotel_user_only_sees_bookings_from_its_hotel(): void
    {
        $event = Event::factory()->create();
        $hotelA = Hotel::factory()->create(['event_id' => $event->id]);
        $hotelB = Hotel::factory()->create(['event_id' => $event->id]);
        $hotelUser = User::factory()->create([
            'role' => 'HOTEL',
            'hotel_id' => $hotelA->id,
        ]);

        $ownBooking = $this->createBookingForHotel($hotelA);
        $otherBooking = $this->createBookingForHotel($hotelB);

        $this->actingAs($hotelUser)
            ->get(route('hotel.bookings.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('bookings.0.id', $ownBooking->id)
                ->missing('bookings.1.id', $otherBooking->id));
    }

    public function test_non_hotel_user_cannot_access_hotel_bookings_index(): void
    {
        $client = User::factory()->create(['role' => 'CLIENT']);

        $this->actingAs($client)
            ->get(route('hotel.bookings.index'))
            ->assertForbidden();
    }

    public function test_hotel_user_without_hotel_link_is_forbidden(): void
    {
        $hotelUser = User::factory()->create([
            'role' => 'HOTEL',
            'hotel_id' => null,
        ]);

        $this->actingAs($hotelUser)
            ->get(route('hotel.bookings.index'))
            ->assertForbidden();
    }

    public function test_hotel_user_cannot_access_customer_checkout_area(): void
    {
        $hotelUser = User::factory()->create([
            'role' => 'HOTEL',
            'hotel_id' => Hotel::factory()->create(['event_id' => Event::factory()->create()->id])->id,
        ]);

        $this->actingAs($hotelUser)
            ->get(route('checkout'))
            ->assertForbidden();
    }

    private function createBookingForHotel(Hotel $hotel): Booking
    {
        $roomType = RoomType::factory()->create(['name' => fake()->unique()->word(), 'max_guests' => 2]);
        $mealPlan = MealPlan::factory()->create(['name' => fake()->unique()->word()]);
        $rate = Rate::factory()->create([
            'hotel_id' => $hotel->id,
            'room_type_id' => $roomType->id,
            'meal_plan_id' => $mealPlan->id,
            'stock' => 7,
            'cancellation_deadline' => now()->addDays(10),
        ]);
        $customer = User::factory()->create(['role' => 'CLIENT']);

        $booking = Booking::query()->create([
            'user_id' => $customer->id,
            'event_id' => $hotel->event_id,
            'hotel_id' => $hotel->id,
            'rate_id' => $rate->id,
            'check_in' => now()->addDays(20)->toDateString(),
            'check_out' => now()->addDays(22)->toDateString(),
            'guests' => 2,
            'nights' => 2,
            'subtotal' => 320,
            'fees_total' => 0,
            'total_price' => 320,
            'status' => 'CONFIRMED',
        ]);

        Payment::query()->create([
            'booking_id' => $booking->id,
            'provider' => 'STRIPE_MOCK',
            'amount' => 320,
            'currency' => 'EUR',
            'status' => 'PAID',
            'due_date' => now()->addDays(2)->toDateString(),
            'paid_at' => now(),
        ]);

        SupplierPayment::query()->create([
            'booking_id' => $booking->id,
            'amount' => 220,
            'currency' => 'EUR',
            'due_date' => now()->addDays(12)->toDateString(),
            'status' => 'PENDING',
        ]);

        return $booking;
    }
}
