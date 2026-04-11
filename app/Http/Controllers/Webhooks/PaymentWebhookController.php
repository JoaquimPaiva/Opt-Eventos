<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Services\Payments\PaymentWebhookProcessor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentWebhookController extends Controller
{
    public function __invoke(Request $request, PaymentWebhookProcessor $processor): JsonResponse
    {
        $provider = strtolower((string) ($request->route('provider') ?? data_get($request->all(), 'provider', config('payment.provider', 'stripe_mock'))));
        $payload = (string) $request->getContent();

        if (! $this->isSignatureValid($request, $payload, $provider)) {
            return response()->json(['message' => 'Assinatura do webhook inválida.'], 401);
        }

        /** @var array<string, mixed>|null $event */
        $event = json_decode($payload, true);
        if (! is_array($event)) {
            return response()->json(['message' => 'Conteúdo do webhook inválido.'], 422);
        }

        $event['provider'] = $provider;
        $processor->process($event);

        return response()->json(['status' => 'ok']);
    }

    private function isSignatureValid(Request $request, string $payload, string $provider): bool
    {
        if ($provider === 'stripe') {
            return $this->isStripeSignatureValid(
                $payload,
                (string) $request->header('Stripe-Signature', ''),
                (string) config('payment.stripe_webhook_secret', '')
            );
        }

        $secret = (string) config('payment.webhook_secret', '');
        $signature = (string) $request->header('X-Payment-Signature', '');

        if ($secret === '' || $signature === '') {
            return false;
        }

        $expected = hash_hmac('sha256', $payload, $secret);

        return hash_equals($expected, $signature);
    }

    private function isStripeSignatureValid(string $payload, string $stripeSignature, string $secret): bool
    {
        if ($secret === '' || $stripeSignature === '') {
            return false;
        }

        $parts = [];
        foreach (explode(',', $stripeSignature) as $segment) {
            $pair = explode('=', trim($segment), 2);
            if (count($pair) === 2) {
                $parts[$pair[0]] = $pair[1];
            }
        }

        $timestamp = isset($parts['t']) ? (int) $parts['t'] : 0;
        $signature = $parts['v1'] ?? '';

        if ($timestamp <= 0 || $signature === '') {
            return false;
        }

        if (abs(time() - $timestamp) > 300) {
            return false;
        }

        $signedPayload = sprintf('%d.%s', $timestamp, $payload);
        $expected = hash_hmac('sha256', $signedPayload, $secret);

        return hash_equals($expected, $signature);
    }
}
