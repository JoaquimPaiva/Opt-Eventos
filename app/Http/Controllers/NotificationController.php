<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class NotificationController extends Controller
{
    public function feed(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user === null) {
            throw ValidationException::withMessages([
                'notification' => 'É necessário iniciar sessão para consultar notificações.',
            ]);
        }

        if (! in_array((string) $user->role, ['ADMIN', 'HOTEL'], true)) {
            abort(403);
        }

        $limit = max(1, min((int) $request->query('limit', 10), 50));
        $items = $user->unreadNotifications()
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn (DatabaseNotification $notification) => [
                'id' => (string) $notification->id,
                'title' => (string) data_get($notification->data, 'title', 'Notificação'),
                'message' => (string) data_get($notification->data, 'message', ''),
                'url' => (string) data_get($notification->data, 'url', route('dashboard')),
                'created_at' => $notification->created_at?->toDateTimeString(),
            ])
            ->values();

        return response()->json([
            'items' => $items,
            'unread_count' => $user->unreadNotifications()->count(),
        ]);
    }

    public function readAll(Request $request): RedirectResponse
    {
        $user = $request->user();
        if ($user !== null) {
            $user->unreadNotifications->markAsRead();
        }

        return back();
    }

    public function read(Request $request, string $notification): RedirectResponse
    {
        $user = $request->user();
        if ($user === null) {
            throw ValidationException::withMessages([
                'notification' => 'É necessário iniciar sessão para gerir notificações.',
            ]);
        }

        $targetNotification = $user->notifications()
            ->whereKey($notification)
            ->firstOrFail();

        if ($targetNotification->read_at === null) {
            $targetNotification->markAsRead();
        }

        return back();
    }
}
