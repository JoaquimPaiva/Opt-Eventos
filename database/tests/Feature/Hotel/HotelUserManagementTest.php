<?php

namespace Tests\Feature\Hotel;

use App\Models\Event;
use App\Models\Hotel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HotelUserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_hotel_user_can_open_hotel_users_page(): void
    {
        $hotel = Hotel::factory()->create(['event_id' => Event::factory()->create()->id]);
        $hotelUser = User::factory()->create([
            'role' => 'HOTEL',
            'hotel_id' => $hotel->id,
        ]);

        $this->actingAs($hotelUser)
            ->get(route('hotel.users.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Hotel/Users/Index'));
    }

    public function test_hotel_user_can_create_new_hotel_user_for_same_hotel(): void
    {
        $hotel = Hotel::factory()->create(['event_id' => Event::factory()->create()->id]);
        $hotelUser = User::factory()->create([
            'role' => 'HOTEL',
            'hotel_id' => $hotel->id,
        ]);

        $this->actingAs($hotelUser)
            ->post(route('hotel.users.store'), [
                'name' => 'Novo Colaborador',
                'email' => 'novo.colaborador@hotel.test',
                'password' => 'Password123!',
                'password_confirmation' => 'Password123!',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('users', [
            'email' => 'novo.colaborador@hotel.test',
            'role' => 'HOTEL',
            'hotel_id' => $hotel->id,
        ]);
    }

    public function test_non_hotel_user_cannot_access_hotel_users_page(): void
    {
        $client = User::factory()->create(['role' => 'CLIENT']);

        $this->actingAs($client)
            ->get(route('hotel.users.index'))
            ->assertForbidden();
    }

    public function test_hotel_user_can_update_user_from_same_hotel(): void
    {
        $hotel = Hotel::factory()->create(['event_id' => Event::factory()->create()->id]);
        $manager = User::factory()->create([
            'role' => 'HOTEL',
            'hotel_id' => $hotel->id,
        ]);
        $teammate = User::factory()->create([
            'role' => 'HOTEL',
            'hotel_id' => $hotel->id,
            'email' => 'old.member@hotel.test',
        ]);

        $this->actingAs($manager)
            ->patch(route('hotel.users.update', $teammate), [
                'name' => 'Membro Atualizado',
                'email' => 'updated.member@hotel.test',
                'password' => '',
                'password_confirmation' => '',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('users', [
            'id' => $teammate->id,
            'name' => 'Membro Atualizado',
            'email' => 'updated.member@hotel.test',
            'hotel_id' => $hotel->id,
            'role' => 'HOTEL',
        ]);
    }

    public function test_hotel_user_can_delete_user_from_same_hotel_but_not_self(): void
    {
        $hotel = Hotel::factory()->create(['event_id' => Event::factory()->create()->id]);
        $manager = User::factory()->create([
            'role' => 'HOTEL',
            'hotel_id' => $hotel->id,
        ]);
        $teammate = User::factory()->create([
            'role' => 'HOTEL',
            'hotel_id' => $hotel->id,
        ]);

        $this->actingAs($manager)
            ->delete(route('hotel.users.destroy', $teammate))
            ->assertRedirect();

        $this->assertDatabaseMissing('users', [
            'id' => $teammate->id,
        ]);

        $this->actingAs($manager)
            ->delete(route('hotel.users.destroy', $manager))
            ->assertRedirect()
            ->assertSessionHasErrors('user');

        $this->assertDatabaseHas('users', [
            'id' => $manager->id,
        ]);
    }

    public function test_hotel_user_cannot_manage_users_from_other_hotel(): void
    {
        $hotelA = Hotel::factory()->create(['event_id' => Event::factory()->create()->id]);
        $hotelB = Hotel::factory()->create(['event_id' => Event::factory()->create()->id]);
        $hotelUserA = User::factory()->create([
            'role' => 'HOTEL',
            'hotel_id' => $hotelA->id,
        ]);
        $hotelUserB = User::factory()->create([
            'role' => 'HOTEL',
            'hotel_id' => $hotelB->id,
        ]);

        $this->actingAs($hotelUserA)
            ->patch(route('hotel.users.update', $hotelUserB), [
                'name' => 'No Access',
                'email' => 'no.access@hotel.test',
                'password' => '',
                'password_confirmation' => '',
            ])
            ->assertForbidden();

        $this->actingAs($hotelUserA)
            ->delete(route('hotel.users.destroy', $hotelUserB))
            ->assertForbidden();
    }
}
