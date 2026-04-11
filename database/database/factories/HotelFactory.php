<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\Hotel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Hotel>
 */
class HotelFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'name' => fake()->company().' Hotel',
            'description' => fake()->paragraph(),
            'address' => fake()->streetAddress().', '.fake()->city(),
            'latitude' => fake()->latitude(),
            'longitude' => fake()->longitude(),
            'supplier_name' => fake()->company(),
            'website_url' => fake()->url(),
            'is_active' => true,
        ];
    }
}
