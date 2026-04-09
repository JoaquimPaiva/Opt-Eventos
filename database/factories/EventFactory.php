<?php

namespace Database\Factories;

use App\Models\Event;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Event>
 */
class EventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('+1 month', '+10 months');
        $endDate = (clone $startDate)->modify('+2 days');
        $bookingStart = (clone $startDate)->modify('-3 months');
        $bookingEnd = (clone $startDate)->modify('+1 month');

        return [
            'name' => fake()->city().' Festival',
            'slug' => fake()->unique()->slug(3),
            'description' => fake()->paragraph(),
            'location' => fake()->city().', '.fake()->country(),
            'latitude' => fake()->latitude(),
            'longitude' => fake()->longitude(),
            'start_date' => $startDate,
            'end_date' => $endDate,
            'booking_start' => $bookingStart,
            'booking_end' => $bookingEnd,
            'is_active' => true,
        ];
    }
}
