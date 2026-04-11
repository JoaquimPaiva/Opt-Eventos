<?php

namespace App\Http\Middleware;

use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
            ],
            'web_push' => [
                'enabled' => filled(config('services.web_push.public_key')) && filled(config('services.web_push.private_key')) && filled(config('services.web_push.subject')),
                'public_key' => config('services.web_push.public_key'),
            ],
            'notifications' => function () use ($request): array {
                $user = $request->user();
                if ($user === null) {
                    return [
                        'unread_count' => 0,
                        'unread_items' => [],
                        'read_items' => [],
                    ];
                }

                $items = $user->notifications()
                    ->latest()
                    ->limit(30)
                    ->get()
                    ->map(fn (DatabaseNotification $notification) => [
                        'id' => $notification->id,
                        'title' => (string) data_get($notification->data, 'title', 'Notification'),
                        'message' => (string) data_get($notification->data, 'message', ''),
                        'url' => (string) data_get($notification->data, 'url', route('dashboard')),
                        'read_at' => $notification->read_at?->toDateTimeString(),
                        'created_at' => $notification->created_at?->toDateTimeString(),
                    ])
                    ->values()
                    ->all();

                $unreadItems = array_values(array_filter(
                    $items,
                    fn (array $item) => ($item['read_at'] ?? null) === null
                ));
                $readItems = array_values(array_filter(
                    $items,
                    fn (array $item) => ($item['read_at'] ?? null) !== null
                ));

                return [
                    'unread_count' => $user->unreadNotifications()->count(),
                    'unread_items' => $unreadItems,
                    'read_items' => $readItems,
                ];
            },
        ];
    }
}
