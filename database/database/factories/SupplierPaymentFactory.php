<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\SupplierPayment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SupplierPayment>
 */
class SupplierPaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $amount = fake()->randomFloat(2, 100, 1200);

        return [
            'booking_id' => Booking::factory(),
            'amount' => $amount,
            'currency' => 'EUR',
            'due_date' => fake()->dateTimeBetween('now', '+2 months'),
            'status' => fake()->randomElement(['PENDING', 'PAID']),
            'paid_at' => null,
        ];
    }
}
