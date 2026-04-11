<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $amount = fake()->randomFloat(2, 150, 1800);

        return [
            'booking_id' => Booking::factory(),
            'provider' => 'STRIPE_MOCK',
            'amount' => $amount,
            'currency' => 'EUR',
            'status' => fake()->randomElement(['PENDING', 'PAID', 'FAILED']),
            'due_date' => fake()->dateTimeBetween('now', '+2 months'),
            'paid_at' => null,
            'provider_reference' => 'mock_'.fake()->bothify('########'),
        ];
    }
}
