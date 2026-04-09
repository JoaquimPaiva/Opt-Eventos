<?php

namespace App\Services\Payments;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

class PaymentIntentService
{
    /**
     * @return array{
     *   provider:string,
     *   payment_reference:string,
     *   client_secret:string,
     *   amount:float,
     *   currency:string
     * }
     */
    public function create(float $amount, string $currency): array
    {
        $provider = strtoupper((string) config('payment.provider', 'STRIPE_MOCK'));

        if ($provider === 'STRIPE') {
            $secretKey = trim((string) config('payment.stripe_secret_key', ''));
            if ($secretKey === '') {
                throw new RuntimeException('Stripe secret key is not configured.');
            }

            $response = Http::asForm()
                ->withBasicAuth($secretKey, '')
                ->timeout(15)
                ->post('https://api.stripe.com/v1/payment_intents', [
                    'amount' => (int) round($amount * 100),
                    'currency' => strtolower($currency),
                    'automatic_payment_methods[enabled]' => 'true',
                    'metadata[payment_reference]' => sprintf('pmref_%s', Str::uuid()->toString()),
                ]);

            if ($response->failed()) {
                throw new RuntimeException('Failed to create Stripe PaymentIntent.');
            }

            $paymentReference = (string) ($response->json('id') ?? '');
            $clientSecret = (string) ($response->json('client_secret') ?? '');
            if ($paymentReference === '' || $clientSecret === '') {
                throw new RuntimeException('Invalid Stripe PaymentIntent response.');
            }

            return [
                'provider' => $provider,
                'payment_reference' => $paymentReference,
                'client_secret' => $clientSecret,
                'amount' => $amount,
                'currency' => strtoupper($currency),
            ];
        }

        $paymentReference = sprintf('pm_%s', Str::uuid()->toString());

        return [
            'provider' => $provider,
            'payment_reference' => $paymentReference,
            'client_secret' => sprintf('mock_secret_%s', Str::lower(Str::random(24))),
            'amount' => $amount,
            'currency' => strtoupper($currency),
        ];
    }
}
