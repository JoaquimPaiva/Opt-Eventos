<?php

namespace Database\Factories;

use App\Models\Hotel;
use App\Models\MealPlan;
use App\Models\Rate;
use App\Models\RoomType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Rate>
 */
class RateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $cost = fake()->numberBetween(40, 180);
        $sale = $cost + fake()->numberBetween(20, 140);

        return [
            'hotel_id' => Hotel::factory(),
            'room_type_id' => RoomType::factory(),
            'meal_plan_id' => MealPlan::factory(),
            'cost_price' => $cost,
            'sale_price' => $sale,
            'currency' => 'EUR',
            'stock' => fake()->numberBetween(5, 40),
            'cancellation_policy' => 'FREE_CANCELLATION',
            'deposit_amount' => null,
            'balance_due_days_before_checkin' => null,
            'cancellation_deadline' => fake()->dateTimeBetween('now', '+6 months'),
            'is_active' => true,
        ];
    }
}
