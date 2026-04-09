<?php

namespace Tests\Feature\Booking;

use App\Models\Booking;
use App\Models\Event;
use App\Models\Hotel;
use App\Models\MealPlan;
use App\Models\Rate;
use App\Models\RoomType;
use App\Models\User;
use App\Notifications\AdminBookingCreatedNotification;
use App\Notifications\BookingCreatedNotification;
use App\Notifications\HotelBookingCreatedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class CreateBookingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('payment.provider', 'STRIPE_MOCK');
        config()->set('payment.stripe_secret_key', '');
    }

    public function test_authenticated_user_can_create_booking_and_related_payments(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->admin()->create();
        $event = Event::factory()->create([
            'booking_start' => '2026-03-01',
            'booking_end' => '2026-12-01',
            'is_active' => true,
        ]);
        $hotel = Hotel::factory()->create(['event_id' => $event->id]);
        $roomType = RoomType::factory()->create(['name' => 'single', 'max_guests' => 2]);
        $mealPlan = MealPlan::factory()->create(['name' => 'breakfast']);
        $rate = Rate::factory()->create([
            'hotel_id' => $hotel->id,
            'room_type_id' => $roomType->id,
            'meal_plan_id' => $mealPlan->id,
            'cost_price' => 100,
            'sale_price' => 150,
            'stock' => 3,
            'is_active' => true,
        ]);

        $response = $this->actingAs($user)
            ->post(route('checkout.store'), [
                'rate_id' => $rate->id,
                'check_in' => '2026-07-10',
                'check_out' => '2026-07-13',
                'guests' => 2,
                'payment_reference' => 'pi_test_checkout_123',
            ]);

        $booking = Booking::query()->firstOrFail();
        $response->assertRedirect(route('dashboard.bookings.payment', $booking));

        $this->assertDatabaseHas('bookings', [
            'user_id' => $user->id,
            'event_id' => $event->id,
            'hotel_id' => $hotel->id,
            'rate_id' => $rate->id,
            'nights' => 3,
            'status' => 'CONFIRMED',
        ]);

        $this->assertDatabaseHas('payments', [
            'status' => 'PENDING',
            'amount' => 450,
            'provider' => 'STRIPE_MOCK',
            'provider_reference' => 'pi_test_checkout_123',
        ]);

        $this->assertDatabaseHas('supplier_payments', [
            'status' => 'PENDING',
            'amount' => 300,
        ]);

        $this->assertDatabaseHas('notifications', [
            'notifiable_type' => User::class,
            'notifiable_id' => $user->id,
            'type' => BookingCreatedNotification::class,
        ]);
        $this->assertDatabaseHas('notifications', [
            'notifiable_type' => User::class,
            'notifiable_id' => $admin->id,
            'type' => AdminBookingCreatedNotification::class,
        ]);

        $hotelUser = User::factory()->create([
            'role' => 'HOTEL',
            'hotel_id' => $hotel->id,
        ]);

        // Trigger booking after hotel user exists so notification can be emitted.
        $this->actingAs($user)
            ->post(route('checkout.store'), [
                'rate_id' => $rate->id,
                'check_in' => '2026-07-20',
                'check_out' => '2026-07-22',
                'guests' => 2,
                'payment_reference' => 'pi_test_checkout_hotel_123',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('notifications', [
            'notifiable_type' => User::class,
            'notifiable_id' => $hotelUser->id,
            'type' => HotelBookingCreatedNotification::class,
        ]);

        $rate->refresh();
        $this->assertSame(1, $rate->stock);
    }

    public function test_booking_fails_when_rate_stock_is_empty(): void
    {
        $user = User::factory()->create();
        $event = Event::factory()->create([
            'booking_start' => '2026-03-01',
            'booking_end' => '2026-12-01',
            'is_active' => true,
        ]);
        $hotel = Hotel::factory()->create(['event_id' => $event->id]);
        $roomType = RoomType::factory()->create(['name' => 'single', 'max_guests' => 2]);
        $mealPlan = MealPlan::factory()->create(['name' => 'breakfast']);
        $rate = Rate::factory()->create([
            'hotel_id' => $hotel->id,
            'room_type_id' => $roomType->id,
            'meal_plan_id' => $mealPlan->id,
            'stock' => 0,
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->from(route('checkout'))
            ->post(route('checkout.store'), [
                'rate_id' => $rate->id,
                'check_in' => '2026-07-10',
                'check_out' => '2026-07-12',
                'guests' => 1,
            ])
            ->assertRedirect(route('checkout'))
            ->assertSessionHasErrors('rate_id');

        $this->assertDatabaseCount('bookings', 0);
        $this->assertDatabaseCount('payments', 0);
        $this->assertDatabaseCount('supplier_payments', 0);
    }

    public function test_checkout_can_prepare_payment_intent(): void
    {
        $user = User::factory()->create();
        $event = Event::factory()->create([
            'booking_start' => '2026-03-01',
            'booking_end' => '2026-12-01',
            'is_active' => true,
        ]);
        $hotel = Hotel::factory()->create(['event_id' => $event->id]);
        $roomType = RoomType::factory()->create(['name' => 'single', 'max_guests' => 2]);
        $mealPlan = MealPlan::factory()->create(['name' => 'breakfast']);
        $rate = Rate::factory()->create([
            'hotel_id' => $hotel->id,
            'room_type_id' => $roomType->id,
            'meal_plan_id' => $mealPlan->id,
            'sale_price' => 150,
            'stock' => 3,
            'is_active' => true,
        ]);

        $response = $this->actingAs($user)
            ->postJson(route('checkout.payment-intent'), [
                'rate_id' => $rate->id,
                'check_in' => '2026-07-10',
                'check_out' => '2026-07-13',
                'guests' => 2,
            ]);

        $response->assertCreated();
        $response->assertJsonStructure([
            'provider',
            'payment_reference',
            'client_secret',
            'amount',
            'currency',
        ]);
        $response->assertJson([
            'amount' => 450.0,
            'currency' => 'EUR',
        ]);
    }

    public function test_checkout_prepares_real_stripe_intent_when_provider_is_stripe(): void
    {
        config()->set('payment.provider', 'STRIPE');
        config()->set('payment.stripe_secret_key', 'sk_test_123');

        Http::fake([
            'https://api.stripe.com/v1/payment_intents' => Http::response([
                'id' => 'pi_test_real_123',
                'client_secret' => 'pi_test_real_123_secret_abc',
            ], 200),
        ]);

        $user = User::factory()->create();
        $event = Event::factory()->create([
            'booking_start' => '2026-03-01',
            'booking_end' => '2026-12-01',
            'is_active' => true,
        ]);
        $hotel = Hotel::factory()->create(['event_id' => $event->id]);
        $roomType = RoomType::factory()->create(['name' => 'double', 'max_guests' => 2]);
        $mealPlan = MealPlan::factory()->create(['name' => 'half-board']);
        $rate = Rate::factory()->create([
            'hotel_id' => $hotel->id,
            'room_type_id' => $roomType->id,
            'meal_plan_id' => $mealPlan->id,
            'sale_price' => 200,
            'stock' => 3,
            'is_active' => true,
        ]);

        $response = $this->actingAs($user)
            ->postJson(route('checkout.payment-intent'), [
                'rate_id' => $rate->id,
                'check_in' => '2026-07-10',
                'check_out' => '2026-07-12',
                'guests' => 2,
            ]);

        $response->assertCreated();
        $response->assertJson([
            'provider' => 'STRIPE',
            'payment_reference' => 'pi_test_real_123',
            'client_secret' => 'pi_test_real_123_secret_abc',
            'amount' => 400.0,
            'currency' => 'EUR',
        ]);

        Http::assertSentCount(1);
        Http::assertSent(fn ($request) => $request->url() === 'https://api.stripe.com/v1/payment_intents');
    }

    public function test_checkout_returns_validation_error_when_stripe_key_is_missing(): void
    {
        config()->set('payment.provider', 'STRIPE');
        config()->set('payment.stripe_secret_key', '');

        $user = User::factory()->create();
        $event = Event::factory()->create([
            'booking_start' => '2026-03-01',
            'booking_end' => '2026-12-01',
            'is_active' => true,
        ]);
        $hotel = Hotel::factory()->create(['event_id' => $event->id]);
        $roomType = RoomType::factory()->create(['name' => 'single', 'max_guests' => 2]);
        $mealPlan = MealPlan::factory()->create(['name' => 'breakfast']);
        $rate = Rate::factory()->create([
            'hotel_id' => $hotel->id,
            'room_type_id' => $roomType->id,
            'meal_plan_id' => $mealPlan->id,
            'sale_price' => 150,
            'stock' => 3,
            'is_active' => true,
        ]);

        $response = $this->actingAs($user)
            ->postJson(route('checkout.payment-intent'), [
                'rate_id' => $rate->id,
                'check_in' => '2026-07-10',
                'check_out' => '2026-07-13',
                'guests' => 2,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['payment']);
    }
}
