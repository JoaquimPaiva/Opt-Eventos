<?php

namespace Tests\Feature\Notification;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\Notification;
use Tests\TestCase;

class NotificationActionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_mark_single_notification_as_read(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $user->notify(new class extends Notification
        {
            public function via(object $notifiable): array
            {
                return ['database'];
            }

            public function toArray(object $notifiable): array
            {
                return [
                    'title' => 'Booking created',
                    'message' => 'Your booking is ready.',
                    'url' => route('dashboard'),
                ];
            }
        });

        $notificationId = (string) $user->notifications()->firstOrFail()->id;

        $this->actingAs($user)
            ->post(route('notifications.read', $notificationId))
            ->assertRedirect();

        $this->assertDatabaseMissing('notifications', [
            'id' => $notificationId,
            'read_at' => null,
        ]);
    }

    public function test_user_cannot_mark_other_user_notification_as_read(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);
        $otherUser = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $otherUser->notify(new class extends Notification
        {
            public function via(object $notifiable): array
            {
                return ['database'];
            }

            public function toArray(object $notifiable): array
            {
                return [
                    'title' => 'Payment confirmed',
                    'message' => 'Booking paid.',
                    'url' => route('dashboard'),
                ];
            }
        });

        $notificationId = (string) $otherUser->notifications()->firstOrFail()->id;

        $this->actingAs($user)
            ->post(route('notifications.read', $notificationId))
            ->assertNotFound();
    }

    public function test_user_can_mark_all_notifications_as_read(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $notification = new class extends Notification
        {
            public function via(object $notifiable): array
            {
                return ['database'];
            }

            public function toArray(object $notifiable): array
            {
                return [
                    'title' => 'Generic notification',
                    'message' => 'Message',
                    'url' => route('dashboard'),
                ];
            }
        };

        $user->notify($notification);
        $user->notify($notification);

        $this->actingAs($user)
            ->post(route('notifications.read-all'))
            ->assertRedirect();

        $this->assertSame(0, $user->fresh()->unreadNotifications()->count());
    }

    public function test_admin_can_read_notifications_feed(): void
    {
        $admin = User::factory()->create([
            'role' => 'ADMIN',
            'email_verified_at' => now(),
        ]);

        $admin->notify(new class extends Notification
        {
            public function via(object $notifiable): array
            {
                return ['database'];
            }

            public function toArray(object $notifiable): array
            {
                return [
                    'title' => 'Admin alert',
                    'message' => 'New booking arrived.',
                    'url' => route('admin.bookings.index'),
                ];
            }
        });

        $this->actingAs($admin)
            ->getJson(route('notifications.feed'))
            ->assertOk()
            ->assertJsonStructure([
                'items' => [
                    '*' => ['id', 'title', 'message', 'url', 'created_at'],
                ],
                'unread_count',
            ]);
    }

    public function test_client_cannot_read_notifications_feed(): void
    {
        $client = User::factory()->create([
            'role' => 'CLIENT',
            'email_verified_at' => now(),
        ]);

        $this->actingAs($client)
            ->getJson(route('notifications.feed'))
            ->assertForbidden();
    }
}
