<?php

namespace App\Listeners;

use App\Models\User;
use App\Services\Notifications\WebPushService;
use Illuminate\Notifications\Events\NotificationSent;

class SendBrowserPushForDatabaseNotification
{
    public function __construct(
        private readonly WebPushService $webPushService
    ) {
    }

    public function handle(NotificationSent $event): void
    {
        if ($event->channel !== 'database') {
            return;
        }

        if (! $event->notifiable instanceof User) {
            return;
        }

        if (! in_array((string) $event->notifiable->role, ['ADMIN', 'HOTEL'], true)) {
            return;
        }

        if (! method_exists($event->notification, 'toArray')) {
            return;
        }

        $data = $event->notification->toArray($event->notifiable);

        $title = (string) data_get($data, 'title', 'OptEventos');
        $message = (string) data_get($data, 'message', 'Tens uma nova notificação.');
        $url = (string) data_get($data, 'url', route('dashboard'));

        $this->webPushService->sendToUser($event->notifiable, [
            'title' => $title,
            'message' => $message,
            'url' => $url,
            'icon' => '/favicon.ico',
            'tag' => 'opteventos-'.(string) data_get($data, 'kind', 'notification'),
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}

