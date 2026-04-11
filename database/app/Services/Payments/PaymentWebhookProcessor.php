<?php

namespace App\Services\Payments;

use App\Models\Payment;
use App\Models\User;
use App\Notifications\AdminBookingConfirmedNotification;
use App\Notifications\PaymentConfirmedNotification;
use App\Services\Audit\AuditLogger;
use Illuminate\Support\Facades\DB;

class PaymentWebhookProcessor
{
    public function __construct(private readonly AuditLogger $auditLogger)
    {
    }

    /**
     * @param array<string, mixed> $event
     */
    public function process(array $event): void
    {
        $provider = strtolower((string) ($event['provider'] ?? config('payment.provider', 'stripe_mock')));
        $eventId = (string) ($event['id'] ?? '');
        $eventType = (string) ($event['type'] ?? '');
        $reference = $this->extractReference($event, $provider);

        if ($eventId === '' || $eventType === '' || $reference === '') {
            return;
        }

        DB::transaction(function () use ($provider, $eventId, $eventType, $reference, $event): void {
            $alreadyProcessed = DB::table('payment_webhook_events')
                ->where('provider', $provider)
                ->where('event_id', $eventId)
                ->exists();

            if ($alreadyProcessed) {
                return;
            }

            $payment = Payment::query()
                ->where('provider_reference', $reference)
                ->where('provider', strtoupper($provider))
                ->first();

            if ($payment !== null) {
                $this->applyStatusFromEvent($payment, $eventType, $provider);
            }

            DB::table('payment_webhook_events')->insert([
                'provider' => $provider,
                'event_id' => $eventId,
                'event_type' => $eventType,
                'payload' => json_encode($event),
                'processed_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $this->auditLogger->log(
                action: 'webhook.payment.processed',
                actor: null,
                auditableType: Payment::class,
                auditableId: $payment !== null ? (string) $payment->id : null,
                metadata: [
                    'provider' => $provider,
                    'event_id' => $eventId,
                    'event_type' => $eventType,
                    'reference' => $reference,
                    'payment_found' => $payment !== null,
                ],
                request: null
            );
        });
    }

    /**
     * @param array<string, mixed> $event
     */
    private function extractReference(array $event, string $provider): string
    {
        if ($provider === 'stripe') {
            $metadataReference = (string) data_get($event, 'data.object.metadata.payment_reference', '');
            if ($metadataReference !== '') {
                return $metadataReference;
            }

            $fallbackReference = (string) data_get($event, 'data.object.id', '');

            return $fallbackReference;
        }

        return (string) data_get($event, 'data.reference', '');
    }

    private function applyStatusFromEvent(Payment $payment, string $eventType, string $provider): void
    {
        $normalizedType = strtolower($eventType);

        $newStatus = $provider === 'stripe'
            ? $this->mapStripeStatus($normalizedType)
            : match ($normalizedType) {
                'payment.succeeded' => 'PAID',
                'payment.failed' => 'FAILED',
                'payment.refunded' => 'REFUNDED',
                default => null,
            };

        if ($newStatus === null) {
            return;
        }

        $previousStatus = (string) $payment->status;
        $payment->update([
            'status' => $newStatus,
            'paid_at' => in_array($newStatus, ['PAID', 'REFUNDED'], true) ? now() : null,
        ]);

        if ($newStatus === 'PAID' && $previousStatus !== 'PAID') {
            $payment->loadMissing('booking.user');
            $payment->booking?->user?->notify(new PaymentConfirmedNotification($payment->booking));
            $this->notifyAdminsBookingConfirmed($payment);
        }
    }

    private function mapStripeStatus(string $eventType): ?string
    {
        return match ($eventType) {
            'payment_intent.succeeded', 'charge.succeeded' => 'PAID',
            'payment_intent.payment_failed', 'charge.failed' => 'FAILED',
            'charge.refunded' => 'REFUNDED',
            default => null,
        };
    }

    private function notifyAdminsBookingConfirmed(Payment $payment): void
    {
        $payment->loadMissing(['booking.user', 'booking.event', 'booking.hotel']);
        if ($payment->booking === null) {
            return;
        }

        User::query()
            ->where('role', 'ADMIN')
            ->whereNotNull('email')
            ->get()
            ->each(fn (User $admin) => $admin->notify(new AdminBookingConfirmedNotification($payment->booking)));
    }
}
