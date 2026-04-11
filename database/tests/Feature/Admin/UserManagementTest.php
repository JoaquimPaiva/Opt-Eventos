<?php

namespace Tests\Feature\Admin;

use App\Models\Event;
use App\Models\Hotel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_open_users_management_page(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->count(2)->create();

        $this->actingAs($admin)
            ->get(route('admin.users.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Admin/Users/Index'));
    }

    public function test_non_admin_cannot_open_users_management_page(): void
    {
        $client = User::factory()->create(['role' => 'CLIENT']);

        $this->actingAs($client)
            ->get(route('admin.users.index'))
            ->assertForbidden();
    }

    public function test_admin_can_promote_client_to_admin(): void
    {
        $admin = User::factory()->admin()->create();
        $client = User::factory()->create(['role' => 'CLIENT']);

        $this->actingAs($admin)
            ->patch(route('admin.users.update-role', $client), [
                'role' => 'ADMIN',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('users', [
            'id' => $client->id,
            'role' => 'ADMIN',
        ]);
    }

    public function test_admin_can_assign_hotel_role_with_hotel_link(): void
    {
        $admin = User::factory()->admin()->create();
        $client = User::factory()->create(['role' => 'CLIENT']);
        $hotel = Hotel::factory()->create(['event_id' => Event::factory()->create()->id]);

        $this->actingAs($admin)
            ->patch(route('admin.users.update-role', $client), [
                'role' => 'HOTEL',
                'hotel_id' => $hotel->id,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('users', [
            'id' => $client->id,
            'role' => 'HOTEL',
            'hotel_id' => $hotel->id,
        ]);
    }

    public function test_admin_cannot_assign_hotel_role_without_hotel_link(): void
    {
        $admin = User::factory()->admin()->create();
        $client = User::factory()->create(['role' => 'CLIENT']);

        $this->actingAs($admin)
            ->patch(route('admin.users.update-role', $client), [
                'role' => 'HOTEL',
                'hotel_id' => null,
            ])
            ->assertSessionHasErrors('hotel_id');
    }

    public function test_admin_cannot_remove_own_admin_role(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->patch(route('admin.users.update-role', $admin), [
                'role' => 'CLIENT',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('users', [
            'id' => $admin->id,
            'role' => 'ADMIN',
        ]);
    }
}
