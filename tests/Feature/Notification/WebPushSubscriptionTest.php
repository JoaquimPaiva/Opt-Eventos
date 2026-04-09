<?php

namespace Tests\Feature\Notification;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WebPushSubscriptionTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_store_push_subscription(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $this->actingAs($user)
            ->postJson(route('push-subscriptions.store'), [
                'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint-123',
                'keys' => [
                    'p256dh' => str_repeat('a', 87),
                    'auth' => str_repeat('b', 24),
                ],
                'contentEncoding' => 'aes128gcm',
            ])
            ->assertOk();

        $this->assertDatabaseHas('push_subscriptions', [
            'user_id' => $user->id,
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint-123',
        ]);
    }

    public function test_authenticated_user_can_remove_push_subscription(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $user->pushSubscriptions()->create([
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint-456',
            'public_key' => str_repeat('c', 87),
            'auth_token' => str_repeat('d', 24),
            'content_encoding' => 'aesgcm',
        ]);

        $this->actingAs($user)
            ->deleteJson(route('push-subscriptions.destroy'), [
                'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint-456',
            ])
            ->assertOk();

        $this->assertDatabaseMissing('push_subscriptions', [
            'user_id' => $user->id,
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint-456',
        ]);
    }
}

