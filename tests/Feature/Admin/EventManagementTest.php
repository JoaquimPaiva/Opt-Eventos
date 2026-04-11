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

class EventManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_update_and_delete_event(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post(route('admin.events.store'), [
                'name' => 'Porto Marathon Weekend',
                'slug' => '',
                'description' => 'Sports event package',
                'location' => 'Porto, Portugal',
                'latitude' => 41.1496,
                'longitude' => -8.6109,
                'start_date' => '2026-10-15',
                'end_date' => '2026-10-18',
                'booking_start' => '2026-05-01',
                'booking_end' => '2026-10-10',
                'is_active' => true,
            ])
            ->assertRedirect(route('admin.events.index'));

        $event = Event::query()->firstOrFail();
        $this->assertSame('porto-marathon-weekend', $event->slug);

        $this->actingAs($admin)
            ->put(route('admin.events.update', $event), [
                'name' => 'Porto Marathon VIP',
                'slug' => 'porto-vip',
                'description' => 'Updated package',
                'location' => 'Porto, Portugal',
                'latitude' => 41.1496,
                'longitude' => -8.6109,
                'start_date' => '2026-10-15',
                'end_date' => '2026-10-19',
                'booking_start' => '2026-05-01',
                'booking_end' => '2026-10-12',
                'is_active' => false,
            ])
            ->assertRedirect(route('admin.events.index'));

        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'name' => 'Porto Marathon VIP',
            'slug' => 'porto-vip',
            'is_active' => 0,
        ]);

        $this->actingAs($admin)
            ->delete(route('admin.events.destroy', $event))
            ->assertRedirect(route('admin.events.index'));

        $this->assertDatabaseMissing('events', ['id' => $event->id]);
    }

    public function test_non_admin_cannot_manage_events(): void
    {
        $client = User::factory()->create(['role' => 'CLIENT']);
        $event = Event::factory()->create();

        $this->actingAs($client)->get(route('admin.events.index'))->assertForbidden();
        $this->actingAs($client)->get(route('admin.events.create'))->assertForbidden();
        $this->actingAs($client)->get(route('admin.events.edit', $event))->assertForbidden();
        $this->actingAs($client)->post(route('admin.events.store'), [])->assertForbidden();
        $this->actingAs($client)->put(route('admin.events.update', $event), [])->assertForbidden();
        $this->actingAs($client)->patch(route('admin.events.toggle-featured', $event), [])->assertForbidden();
        $this->actingAs($client)->delete(route('admin.events.destroy', $event))->assertForbidden();
    }

    public function test_admin_can_toggle_event_featured_status(): void
    {
        $admin = User::factory()->admin()->create();
        $event = Event::factory()->create([
            'is_featured' => false,
        ]);

        $this->actingAs($admin)
            ->patch(route('admin.events.toggle-featured', $event))
            ->assertRedirect(route('admin.events.index'));

        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'is_featured' => 1,
        ]);

        $this->actingAs($admin)
            ->patch(route('admin.events.toggle-featured', $event))
            ->assertRedirect(route('admin.events.index'));

        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'is_featured' => 0,
        ]);
    }

    public function test_admin_cannot_delete_event_with_related_bookings(): void
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
            'check_in' => now()->addDays(20)->toDateString(),
            'check_out' => now()->addDays(23)->toDateString(),
            'guests' => 2,
            'nights' => 3,
            'subtotal' => 450,
            'fees_total' => 0,
            'total_price' => 450,
            'status' => 'CONFIRMED',
        ]);

        $this->actingAs($admin)
            ->delete(route('admin.events.destroy', $event))
            ->assertRedirect(route('admin.events.index'))
            ->assertSessionHas('error');

        $this->assertDatabaseHas('events', [
            'id' => $event->id,
        ]);
    }
}
