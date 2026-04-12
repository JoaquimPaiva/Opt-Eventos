<?php

$stripePaymentMethodTypes = collect(explode(',', (string) env('STRIPE_PAYMENT_METHOD_TYPES', '')))
    ->map(fn (string $type) => trim($type))
    ->filter(fn (string $type) => $type !== '')
    ->values()
    ->all();

return [
    'provider' => env('PAYMENT_PROVIDER', 'STRIPE_MOCK'),
    'webhook_secret' => env('PAYMENT_WEBHOOK_SECRET', ''),
    'stripe_webhook_secret' => env('STRIPE_WEBHOOK_SECRET', ''),
    'stripe_secret_key' => env('STRIPE_SECRET_KEY', ''),
    'stripe_payment_method_types' => $stripePaymentMethodTypes,
];
