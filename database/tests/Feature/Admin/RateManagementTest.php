<?php

namespace Tests\Feature\Admin;

use App\Models\Hotel;
use App\Models\MealPlan;
use App\Models\Rate;
use App\Models\RoomType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RateManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_update_and_delete_rate(): void
    {
        $admin = User::factory()->admin()->create();
        $hotelA = Hotel::factory()->create();
        $hotelB = Hotel::factory()->create();
        $roomTypeA = RoomType::factory()->create(['name' => 'double', 'max_guests' => 2]);
        $roomTypeB = RoomType::factory()->create(['name' => 'triple', 'max_guests' => 3]);
        $mealPlanA = MealPlan::factory()->create(['name' => 'breakfast']);
        $mealPlanB = MealPlan::factory()->create(['name' => 'half-board']);

        $this->actingAs($admin)
            ->post(route('admin.rates.store'), [
                'hotel_id' => $hotelA->id,
                'room_type_id' => $roomTypeA->id,
                'meal_plan_id' => $mealPlanA->id,
                'cost_price' => 100,
                'sale_price' => 150,
                'currency' => 'eur',
                'stock' => 20,
                'cancellation_deadline' => '2026-12-01 10:00:00',
                'is_active' => true,
            ])
            ->assertRedirect(route('admin.rates.index'));

        $rate = Rate::query()->firstOrFail();
        $this->assertSame('EUR', $rate->currency);

        $this->actingAs($admin)
            ->put(route('admin.rates.update', $rate), [
                'hotel_id' => $hotelB->id,
                'room_type_id' => $roomTypeB->id,
                'meal_plan_id' => $mealPlanB->id,
                'cost_price' => 120,
                'sale_price' => 190,
                'currency' => 'usd',
                'stock' => 9,
                'cancellation_deadline' => '2026-12-15 12:30:00',
                'is_active' => false,
            ])
            ->assertRedirect(route('admin.rates.index'));

        $this->assertDatabaseHas('rates', [
            'id' => $rate->id,
            'hotel_id' => $hotelB->id,
            'room_type_id' => $roomTypeB->id,
            'meal_plan_id' => $mealPlanB->id,
            'cost_price' => 120,
            'sale_price' => 190,
            'currency' => 'USD',
            'stock' => 9,
            'is_active' => 0,
        ]);

        $this->actingAs($admin)
            ->delete(route('admin.rates.destroy', $rate))
            ->assertRedirect(route('admin.rates.index'));

        $this->assertDatabaseMissing('rates', ['id' => $rate->id]);
    }

    public function test_non_admin_cannot_manage_rates(): void
    {
        $client = User::factory()->create(['role' => 'CLIENT']);
        $rate = Rate::factory()->create();

        $this->actingAs($client)->get(route('admin.rates.index'))->assertForbidden();
        $this->actingAs($client)->get(route('admin.rates.create'))->assertForbidden();
        $this->actingAs($client)->get(route('admin.rates.edit', $rate))->assertForbidden();
        $this->actingAs($client)->post(route('admin.rates.store'), [])->assertForbidden();
        $this->actingAs($client)->put(route('admin.rates.update', $rate), [])->assertForbidden();
        $this->actingAs($client)->delete(route('admin.rates.destroy', $rate))->assertForbidden();
    }
}
