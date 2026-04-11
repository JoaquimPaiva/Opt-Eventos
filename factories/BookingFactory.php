<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Event;
use App\Models\Hotel;
use App\Models\Rate;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $checkIn = fake()->dateTimeBetween('+1 week', '+4 months');
        $nights = fake()->numberBetween(2, 6);
        $checkOut = (clone $checkIn)->modify("+{$nights} days");
        $subtotal = fake()->randomFloat(2, 120, 1200);
        $fees = fake()->randomFloat(2, 0, 100);

        return [
            'user_id' => User::factory(),
            'event_id' => Event::factory(),
            'hotel_id' => Hotel::factory(),
            'rate_id' => Rate::factory(),
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'guests' => fake()->numberBetween(1, 4),
            'nights' => $nights,
            'subtotal' => $subtotal,
            'fees_total' => $fees,
            'total_price' => $subtotal + $fees,
            'status' => fake()->randomElement(['PENDING', 'CONFIRMED', 'CANCELLED']),
            'cancellation_reason' => null,
            'cancelled_at' => null,
        ];
    }
}
