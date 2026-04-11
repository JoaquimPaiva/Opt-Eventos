<?php

namespace Tests\Feature\Dashboard;

use App\Mail\InvoiceIssuedMail;
use App\Models\Booking;
use App\Models\Event;
use App\Models\Hotel;
use App\Models\MealPlan;
use App\Models\Payment;
use App\Models\Rate;
use App\Models\RoomType;
use App\Models\SupplierPayment;
use App\Models\User;
use App\Notifications\AdminBookingConfirmedNotification;
use App\Notifications\BookingCancelledNotification;
use App\Notifications\PaymentConfirmedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class BookingDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_only_sees_own_bookings_in_dashboard_list(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $ownBooking = $this->createBookingFor($user);
        $otherBooking = $this->createBookingFor($otherUser);

        $response = $this->actingAs($user)->get(route('dashboard.bookings.index'));

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('Dashboard/Bookings/Index')
                ->where('bookings.0.id', $ownBooking->id)
                ->missing('bookings.1.id', $otherBooking->id)
        );
    }

    public function test_user_cannot_open_booking_detail_from_other_user(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $otherBooking = $this->createBookingFor($otherUser);

        $this->actingAs($user)
            ->get(route('dashboard.bookings.show', $otherBooking))
            ->assertNotFound();
    }

    public function test_user_can_open_own_payment_page(): void
    {
        $user = User::factory()->create();
        $booking = $this->createBookingFor($user);

        $this->actingAs($user)
            ->get(route('dashboard.bookings.payment', $booking))
            ->assertOk()
            ->assertInertia(
                fn ($page) => $page
                    ->component('Dashboard/Bookings/Payment')
                    ->where('payment.booking_id', $booking->id)
            );
    }

    public function test_user_cannot_open_payment_page_from_other_user_booking(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $otherBooking = $this->createBookingFor($otherUser);

        $this->actingAs($user)
            ->get(route('dashboard.bookings.payment', $otherBooking))
            ->assertNotFound();
    }

    public function test_user_can_cancel_booking_before_deadline(): void
    {
        $user = User::factory()->create();
        $booking = $this->createBookingFor($user, now()->addDays(2), 'PENDING');

        $this->actingAs($user)
            ->from(route('dashboard.bookings.show', $booking))
            ->post(route('dashboard.bookings.cancel', $booking), [
                'cancellation_reason' => 'Plans changed',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'CANCELLED',
            'cancellation_reason' => 'Plans changed',
        ]);

        $this->assertDatabaseHas('payments', [
            'booking_id' => $booking->id,
            'status' => 'FAILED',
        ]);

        $this->assertDatabaseHas('notifications', [
            'notifiable_type' => User::class,
            'notifiable_id' => $user->id,
            'type' => BookingCancelledNotification::class,
        ]);

        $booking->refresh();
        $booking->rate->refresh();
        $this->assertSame(11, $booking->rate->stock);
    }

    public function test_user_cannot_cancel_booking_after_deadline(): void
    {
        $user = User::factory()->create();
        $booking = $this->createBookingFor($user, now()->subDay(), 'PENDING');

        $this->actingAs($user)
            ->from(route('dashboard.bookings.show', $booking))
            ->post(route('dashboard.bookings.cancel', $booking), [
                'cancellation_reason' => 'Too late',
            ])
            ->assertRedirect(route('dashboard.bookings.show', $booking))
            ->assertSessionHasErrors('booking');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'CONFIRMED',
        ]);
    }

    public function test_user_can_delete_cancelled_booking(): void
    {
        $user = User::factory()->create();
        $booking = $this->createBookingFor($user, now()->addDays(5), 'FAILED');
        $booking->update([
            'status' => 'CANCELLED',
            'cancelled_at' => now(),
        ]);

        $this->actingAs($user)
            ->delete(route('dashboard.bookings.destroy', $booking))
            ->assertRedirect(route('dashboard.bookings.index'))
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('bookings', [
            'id' => $booking->id,
        ]);
        $this->assertDatabaseMissing('payments', [
            'booking_id' => $booking->id,
        ]);
        $this->assertDatabaseMissing('supplier_payments', [
            'booking_id' => $booking->id,
        ]);
    }

    public function test_user_can_delete_booking_after_checkout_date_has_passed(): void
    {
        $user = User::factory()->create();
        $booking = $this->createBookingFor(
            user: $user,
            cancellationDeadline: now()->addDays(5),
            paymentStatus: 'PAID',
            checkOut: now()->subDays(2)->toDateString()
        );

        $this->actingAs($user)
            ->delete(route('dashboard.bookings.destroy', $booking))
            ->assertRedirect(route('dashboard.bookings.index'))
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('bookings', [
            'id' => $booking->id,
        ]);
    }

    public function test_user_cannot_delete_active_booking_before_checkout_date(): void
    {
        $user = User::factory()->create();
        $booking = $this->createBookingFor(
            user: $user,
            cancellationDeadline: now()->addDays(5),
            paymentStatus: 'PENDING',
            checkOut: now()->addDays(4)->toDateString()
        );

        $this->actingAs($user)
            ->from(route('dashboard.bookings.show', $booking))
            ->delete(route('dashboard.bookings.destroy', $booking))
            ->assertRedirect(route('dashboard.bookings.show', $booking))
            ->assertSessionHasErrors('booking_delete');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
        ]);
    }

    public function test_user_can_confirm_test_payment_from_payment_area(): void
    {
        config()->set('payment.provider', 'STRIPE_MOCK');
        Mail::fake();

        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();
        $booking = $this->createBookingFor($user, now()->addDays(5), 'PENDING');

        $this->actingAs($user)
            ->post(route('dashboard.bookings.payment.confirm', $booking))
            ->assertRedirect();

        $this->assertDatabaseHas('payments', [
            'booking_id' => $booking->id,
            'status' => 'PAID',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $user->id,
            'action' => 'customer.payment.confirmed',
        ]);

        $this->assertDatabaseHas('notifications', [
            'notifiable_type' => User::class,
            'notifiable_id' => $user->id,
            'type' => PaymentConfirmedNotification::class,
        ]);

        $this->assertDatabaseHas('notifications', [
            'notifiable_type' => User::class,
            'notifiable_id' => $admin->id,
            'type' => AdminBookingConfirmedNotification::class,
        ]);

        $this->assertDatabaseHas('invoices', [
            'booking_id' => $booking->id,
            'installment_type' => 'FULL',
            'currency' => 'EUR',
            'amount' => 300.00,
        ]);

        Mail::assertSent(InvoiceIssuedMail::class);
    }

    public function test_user_can_prepare_payment_intent_from_payment_area_when_provider_is_stripe(): void
    {
        config()->set('payment.provider', 'STRIPE');
        config()->set('payment.stripe_secret_key', 'sk_test_123');

        Http::fake([
            'https://api.stripe.com/v1/payment_intents' => Http::response([
                'id' => 'pi_dashboard_123',
                'client_secret' => 'pi_dashboard_123_secret_abc',
            ], 200),
        ]);

        $user = User::factory()->create();
        $booking = $this->createBookingFor($user, now()->addDays(5), 'PENDING');

        $response = $this->actingAs($user)
            ->postJson(route('dashboard.bookings.payment.intent', $booking));

        $response->assertCreated();
        $response->assertJson([
            'provider' => 'STRIPE',
            'payment_reference' => 'pi_dashboard_123',
            'client_secret' => 'pi_dashboard_123_secret_abc',
        ]);

        $this->assertDatabaseHas('payments', [
            'booking_id' => $booking->id,
            'provider' => 'STRIPE',
            'provider_reference' => 'pi_dashboard_123',
            'status' => 'PENDING',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $user->id,
            'action' => 'customer.payment.intent_created',
        ]);
    }

    public function test_user_cannot_prepare_payment_intent_for_other_user_booking(): void
    {
        config()->set('payment.provider', 'STRIPE');
        config()->set('payment.stripe_secret_key', 'sk_test_123');
        Http::fake([
            'https://api.stripe.com/v1/payment_intents' => Http::response([
                'id' => 'pi_never_called',
                'client_secret' => 'pi_never_called_secret',
            ], 200),
        ]);

        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $otherBooking = $this->createBookingFor($otherUser, now()->addDays(5), 'PENDING');

        $this->actingAs($user)
            ->postJson(route('dashboard.bookings.payment.intent', $otherBooking))
            ->assertNotFound();
    }

    public function test_user_can_sync_stripe_payment_status_to_paid(): void
    {
        config()->set('payment.provider', 'STRIPE');
        config()->set('payment.stripe_secret_key', 'sk_test_123');
        Mail::fake();

        $admin = User::factory()->admin()->create();
        Http::fake([
            'https://api.stripe.com/v1/payment_intents/pi_sync_123' => Http::response([
                'id' => 'pi_sync_123',
                'status' => 'succeeded',
            ], 200),
        ]);

        $user = User::factory()->create();
        $booking = $this->createBookingFor($user, now()->addDays(5), 'PENDING');
        $booking->payment()->update([
            'provider' => 'STRIPE',
            'provider_reference' => 'pi_sync_123',
        ]);

        $response = $this->actingAs($user)
            ->postJson(route('dashboard.bookings.payment.sync-stripe', $booking));

        $response->assertOk();
        $response->assertJson([
            'status' => 'PAID',
            'stripe_status' => 'succeeded',
        ]);

        $this->assertDatabaseHas('payments', [
            'booking_id' => $booking->id,
            'status' => 'PAID',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $user->id,
            'action' => 'customer.payment.synced',
        ]);

        $this->assertDatabaseHas('notifications', [
            'notifiable_type' => User::class,
            'notifiable_id' => $user->id,
            'type' => PaymentConfirmedNotification::class,
        ]);

        $this->assertDatabaseHas('notifications', [
            'notifiable_type' => User::class,
            'notifiable_id' => $admin->id,
            'type' => AdminBookingConfirmedNotification::class,
        ]);

        $this->assertDatabaseHas('invoices', [
            'booking_id' => $booking->id,
            'installment_type' => 'FULL',
            'currency' => 'EUR',
            'amount' => 300.00,
        ]);

        Mail::assertSent(InvoiceIssuedMail::class);
    }

    public function test_user_cannot_sync_stripe_payment_from_other_user_booking(): void
    {
        config()->set('payment.provider', 'STRIPE');
        config()->set('payment.stripe_secret_key', 'sk_test_123');

        Http::fake([
            'https://api.stripe.com/v1/payment_intents/*' => Http::response([
                'id' => 'pi_unreachable',
                'status' => 'succeeded',
            ], 200),
        ]);

        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $otherBooking = $this->createBookingFor($otherUser, now()->addDays(5), 'PENDING');
        $otherBooking->payment()->update([
            'provider' => 'STRIPE',
            'provider_reference' => 'pi_other_123',
        ]);

        $this->actingAs($user)
            ->postJson(route('dashboard.bookings.payment.sync-stripe', $otherBooking))
            ->assertNotFound();
    }

    private function createBookingFor(
        User $user,
        ?\DateTimeInterface $cancellationDeadline = null,
        string $paymentStatus = 'PENDING',
        string $checkOut = '2026-07-12'
    ): Booking
    {
        $event = Event::factory()->create();
        $hotel = Hotel::factory()->create(['event_id' => $event->id]);
        $roomType = RoomType::factory()->create(['name' => fake()->unique()->word(), 'max_guests' => 2]);
        $mealPlan = MealPlan::factory()->create(['name' => fake()->unique()->word()]);
        $rate = Rate::factory()->create([
            'hotel_id' => $hotel->id,
            'room_type_id' => $roomType->id,
            'meal_plan_id' => $mealPlan->id,
            'stock' => 10,
            'cancellation_deadline' => $cancellationDeadline ?? now()->addDays(5),
        ]);

        $booking = Booking::query()->create([
            'user_id' => $user->id,
            'event_id' => $event->id,
            'hotel_id' => $hotel->id,
            'rate_id' => $rate->id,
            'check_in' => '2026-07-10',
            'check_out' => $checkOut,
            'guests' => 2,
            'nights' => 2,
            'subtotal' => 300,
            'fees_total' => 0,
            'total_price' => 300,
            'status' => 'CONFIRMED',
        ]);

        Payment::query()->create([
            'booking_id' => $booking->id,
            'provider' => 'STRIPE_MOCK',
            'amount' => 300,
            'currency' => 'EUR',
            'status' => $paymentStatus,
            'due_date' => now()->addDays(2)->toDateString(),
        ]);

        SupplierPayment::query()->create([
            'booking_id' => $booking->id,
            'amount' => 220,
            'currency' => 'EUR',
            'due_date' => now()->addDays(12)->toDateString(),
            'status' => 'PENDING',
        ]);

        return $booking;
    }
}
