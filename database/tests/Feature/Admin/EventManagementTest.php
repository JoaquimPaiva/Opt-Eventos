<?php

namespace Tests\Feature\Admin;

use App\Models\Event;
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
        $this->actingAs($client)->delete(route('admin.events.destroy', $event))->assertForbidden();
    }
}
