<?php

namespace App\Services\Notifications;

use App\Models\User;
use Illuminate\Support\Facades\Log;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;
use Throwable;

class WebPushService
{
    /**
     * @param array<string, mixed> $payload
     */
    public function sendToUser(User $user, array $payload): void
    {
        $publicKey = (string) config('services.web_push.public_key', '');
        $privateKey = (string) config('services.web_push.private_key', '');
        $subject = (string) config('services.web_push.subject', '');
        if ($publicKey === '' || $privateKey === '' || $subject === '') {
            Log::warning('WebPush skipped: missing VAPID configuration.', [
                'user_id' => $user->id,
            ]);
            return;
        }

        $subscriptions = $user->pushSubscriptions()->get();
        if ($subscriptions->isEmpty()) {
            Log::info('WebPush skipped: user has no subscriptions.', [
                'user_id' => $user->id,
            ]);
            return;
        }

        if (! extension_loaded('gmp') && ! extension_loaded('bcmath')) {
            // Without one of these extensions, minishlink/web-push triggers a warning that
            // is promoted to an exception by Laravel's error handler.
            Log::warning('WebPush skipped: GMP/BCMath extension not available.', [
                'user_id' => $user->id,
            ]);
            return;
        }

        try {
            $webPush = new WebPush([
                'VAPID' => [
                    'subject' => $subject,
                    'publicKey' => $publicKey,
                    'privateKey' => $privateKey,
                ],
            ]);
        } catch (Throwable) {
            Log::warning('WebPush init failed.', [
                'user_id' => $user->id,
            ]);
            return;
        }

        $encodedPayload = json_encode($payload, JSON_UNESCAPED_UNICODE);
        if ($encodedPayload === false) {
            return;
        }

        foreach ($subscriptions as $subscription) {
            try {
                $report = $webPush->sendOneNotification(
                    Subscription::create([
                        'endpoint' => $subscription->endpoint,
                        'publicKey' => $subscription->public_key,
                        'authToken' => $subscription->auth_token,
                        'contentEncoding' => $subscription->content_encoding ?: 'aesgcm',
                    ]),
                    $encodedPayload,
                    ['TTL' => 60]
                );

                if (! $report->isSuccess() && in_array($report->getResponse()?->getStatusCode(), [401, 404, 410], true)) {
                    $subscription->delete();
                }
                if (! $report->isSuccess()) {
                    Log::warning('WebPush delivery failed.', [
                        'user_id' => $user->id,
                        'endpoint' => $subscription->endpoint,
                        'status_code' => $report->getResponse()?->getStatusCode(),
                        'reason' => $report->getReason(),
                    ]);
                } else {
                    Log::info('WebPush delivery success.', [
                        'user_id' => $user->id,
                        'endpoint' => $subscription->endpoint,
                    ]);
                }
            } catch (Throwable) {
                // Keep the request lifecycle resilient if a push gateway fails.
                Log::warning('WebPush delivery exception.', [
                    'user_id' => $user->id,
                    'endpoint' => $subscription->endpoint,
                ]);
            }
        }
    }
}
