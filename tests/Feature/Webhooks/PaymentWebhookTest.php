<?php

namespace Tests\Feature\Webhooks;

use App\Mail\BillingDocumentsIssuedMail;
use App\Models\Booking;
use App\Models\Event;
use App\Models\Hotel;
use App\Models\MealPlan;
use App\Models\Payment;
use App\Models\Rate;
use App\Models\RoomType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PaymentWebhookTest extends TestCase
{
    use RefreshDatabase;

    public function test_valid_webhook_marks_payment_as_paid_and_stores_event(): void
    {
        config()->set('payment.webhook_secret', 'test-secret');
        Mail::fake();

        $payment = $this->createPaymentWithReference('pm_test_paid');
        $payload = [
            'id' => 'evt_paid_1',
            'provider' => 'stripe_mock',
            'type' => 'payment.succeeded',
            'data' => [
                'reference' => 'pm_test_paid',
            ],
        ];

        $rawPayload = json_encode($payload);
        $signature = hash_hmac('sha256', (string) $rawPayload, 'test-secret');

        $this->postJson(route('webhooks.payments.handle'), $payload, [
            'X-Payment-Signature' => $signature,
        ])->assertOk();

        $payment->refresh();
        $this->assertSame('PAID', $payment->status);
        $this->assertNotNull($payment->paid_at);

        $this->assertDatabaseHas('payment_webhook_events', [
            'provider' => 'stripe_mock',
            'event_id' => 'evt_paid_1',
            'event_type' => 'payment.succeeded',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'webhook.payment.processed',
            'auditable_type' => Payment::class,
            'auditable_id' => (string) $payment->id,
        ]);

        $this->assertDatabaseHas('invoices', [
            'booking_id' => $payment->booking_id,
            'installment_type' => 'FULL',
            'document_type' => 'INVOICE',
            'amount' => 300.00,
            'currency' => 'EUR',
        ]);
        Mail::assertSent(BillingDocumentsIssuedMail::class);
    }

    public function test_invalid_signature_is_rejected(): void
    {
        config()->set('payment.webhook_secret', 'test-secret');

        $payload = [
            'id' => 'evt_invalid_sig',
            'provider' => 'stripe_mock',
            'type' => 'payment.succeeded',
            'data' => [
                'reference' => 'pm_not_used',
            ],
        ];

        $this->postJson(route('webhooks.payments.handle'), $payload, [
            'X-Payment-Signature' => 'wrong-signature',
        ])->assertUnauthorized();

        $this->assertDatabaseCount('payment_webhook_events', 0);
    }

    public function test_duplicate_event_is_idempotent(): void
    {
        config()->set('payment.webhook_secret', 'test-secret');

        $this->createPaymentWithReference('pm_dup');
        $payload = [
            'id' => 'evt_dup_1',
            'provider' => 'stripe_mock',
            'type' => 'payment.failed',
            'data' => [
                'reference' => 'pm_dup',
            ],
        ];

        $rawPayload = json_encode($payload);
        $signature = hash_hmac('sha256', (string) $rawPayload, 'test-secret');

        $this->postJson(route('webhooks.payments.handle'), $payload, [
            'X-Payment-Signature' => $signature,
        ])->assertOk();

        $this->postJson(route('webhooks.payments.handle'), $payload, [
            'X-Payment-Signature' => $signature,
        ])->assertOk();

        $this->assertDatabaseCount('payment_webhook_events', 1);
        $this->assertDatabaseHas('payments', [
            'provider_reference' => 'pm_dup',
            'status' => 'FAILED',
        ]);
    }

    public function test_valid_stripe_webhook_marks_payment_as_paid(): void
    {
        config()->set('payment.stripe_webhook_secret', 'stripe-secret');
        Mail::fake();

        $payment = $this->createPaymentWithReference('pi_123');
        $payment->update(['provider' => 'STRIPE']);

        $payload = [
            'id' => 'evt_stripe_1',
            'type' => 'payment_intent.succeeded',
            'data' => [
                'object' => [
                    'id' => 'pi_123',
                    'metadata' => [
                        'payment_reference' => 'pi_123',
                    ],
                ],
            ],
        ];

        $rawPayload = json_encode($payload);
        $timestamp = time();
        $signature = hash_hmac('sha256', sprintf('%d.%s', $timestamp, (string) $rawPayload), 'stripe-secret');

        $this->postJson(route('webhooks.stripe.handle'), $payload, [
            'Stripe-Signature' => sprintf('t=%d,v1=%s', $timestamp, $signature),
        ])->assertOk();

        $payment->refresh();
        $this->assertSame('PAID', $payment->status);
        $this->assertNotNull($payment->paid_at);
        $this->assertDatabaseHas('invoices', [
            'booking_id' => $payment->booking_id,
            'installment_type' => 'FULL',
            'document_type' => 'INVOICE',
            'amount' => 300.00,
            'currency' => 'EUR',
        ]);
        Mail::assertSent(BillingDocumentsIssuedMail::class);
    }

    public function test_stripe_webhook_with_expired_timestamp_is_rejected(): void
    {
        config()->set('payment.stripe_webhook_secret', 'stripe-secret');

        $payload = [
            'id' => 'evt_stripe_old_1',
            'type' => 'payment_intent.succeeded',
            'data' => [
                'object' => [
                    'id' => 'pi_old',
                ],
            ],
        ];

        $rawPayload = json_encode($payload);
        $timestamp = time() - 3600;
        $signature = hash_hmac('sha256', sprintf('%d.%s', $timestamp, (string) $rawPayload), 'stripe-secret');

        $this->postJson(route('webhooks.stripe.handle'), $payload, [
            'Stripe-Signature' => sprintf('t=%d,v1=%s', $timestamp, $signature),
        ])->assertUnauthorized();
    }

    private function createPaymentWithReference(string $reference): Payment
    {
        $user = User::factory()->create();
        $event = Event::factory()->create();
        $hotel = Hotel::factory()->create(['event_id' => $event->id]);
        $roomType = RoomType::factory()->create(['name' => fake()->unique()->word(), 'max_guests' => 2]);
        $mealPlan = MealPlan::factory()->create(['name' => fake()->unique()->word()]);
        $rate = Rate::factory()->create([
            'hotel_id' => $hotel->id,
            'room_type_id' => $roomType->id,
            'meal_plan_id' => $mealPlan->id,
        ]);

        $booking = Booking::query()->create([
            'user_id' => $user->id,
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

        return Payment::query()->create([
            'booking_id' => $booking->id,
            'provider' => 'STRIPE_MOCK',
            'amount' => 300,
            'currency' => 'EUR',
            'status' => 'PENDING',
            'due_date' => now()->addDays(2)->toDateString(),
            'provider_reference' => $reference,
        ]);
    }
}
