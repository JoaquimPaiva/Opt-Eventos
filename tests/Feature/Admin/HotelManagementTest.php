<?php

namespace Tests\Feature\Admin;

use App\Models\Booking;
use App\Models\Event;
use App\Models\Hotel;
use App\Models\MealPlan;
use App\Models\Rate;
use App\Models\RoomType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HotelManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_update_and_delete_hotel(): void
    {
        $admin = User::factory()->admin()->create();
        $eventA = Event::factory()->create(['name' => 'Event A']);
        $eventB = Event::factory()->create(['name' => 'Event B']);

        $this->actingAs($admin)
            ->post(route('admin.hotels.store'), [
                'event_id' => $eventA->id,
                'name' => 'Atlantic View Hotel',
                'description' => 'Seafront property',
                'address' => 'Rua Central 1, Porto',
                'latitude' => 41.1496,
                'longitude' => -8.6109,
                'supplier_name' => 'Supplier A',
                'website_url' => 'https://hotel.example.com',
                'is_active' => true,
            ])
            ->assertRedirect(route('admin.hotels.index'));

        $hotel = Hotel::query()->firstOrFail();
        $this->assertSame('Atlantic View Hotel', $hotel->name);
        $this->assertSame($eventA->id, $hotel->event_id);

        $this->actingAs($admin)
            ->put(route('admin.hotels.update', $hotel), [
                'event_id' => $eventB->id,
                'name' => 'Atlantic View Premium',
                'description' => 'Updated description',
                'address' => 'Rua Nova 10, Porto',
                'latitude' => 41.1500,
                'longitude' => -8.6110,
                'supplier_name' => 'Supplier B',
                'website_url' => 'https://hotel-premium.example.com',
                'is_active' => false,
            ])
            ->assertRedirect(route('admin.hotels.index'));

        $this->assertDatabaseHas('hotels', [
            'id' => $hotel->id,
            'event_id' => $eventB->id,
            'name' => 'Atlantic View Premium',
            'supplier_name' => 'Supplier B',
            'is_active' => 0,
        ]);

        $this->actingAs($admin)
            ->delete(route('admin.hotels.destroy', $hotel))
            ->assertRedirect(route('admin.hotels.index'));

        $this->assertDatabaseMissing('hotels', ['id' => $hotel->id]);
    }

    public function test_non_admin_cannot_manage_hotels(): void
    {
        $client = User::factory()->create(['role' => 'CLIENT']);
        $hotel = Hotel::factory()->create();

        $this->actingAs($client)->get(route('admin.hotels.index'))->assertForbidden();
        $this->actingAs($client)->get(route('admin.hotels.create'))->assertForbidden();
        $this->actingAs($client)->get(route('admin.hotels.edit', $hotel))->assertForbidden();
        $this->actingAs($client)->post(route('admin.hotels.store'), [])->assertForbidden();
        $this->actingAs($client)->put(route('admin.hotels.update', $hotel), [])->assertForbidden();
        $this->actingAs($client)->delete(route('admin.hotels.destroy', $hotel))->assertForbidden();
    }

    public function test_admin_cannot_delete_hotel_with_related_bookings(): void
    {
        $admin = User::factory()->admin()->create();
        $customer = User::factory()->create();
        $event = Event::factory()->create();
        $hotel = Hotel::factory()->create(['event_id' => $event->id]);
        $roomType = RoomType::factory()->create(['name' => 'single', 'max_guests' => 2]);
        $mealPlan = MealPlan::factory()->create(['name' => 'breakfast']);
        $rate = Rate::factory()->create([
            'hotel_id' => $hotel->id,
            'room_type_id' => $roomType->id,
            'meal_plan_id' => $mealPlan->id,
        ]);

        Booking::query()->create([
            'user_id' => $customer->id,
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

        $this->actingAs($admin)
            ->delete(route('admin.hotels.destroy', $hotel))
            ->assertRedirect(route('admin.hotels.index'))
            ->assertSessionHas('error');

        $this->assertDatabaseHas('hotels', [
            'id' => $hotel->id,
        ]);
    }
}
