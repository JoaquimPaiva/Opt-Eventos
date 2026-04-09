<?php

return [
    'provider' => env('PAYMENT_PROVIDER', 'STRIPE_MOCK'),
    'webhook_secret' => env('PAYMENT_WEBHOOK_SECRET', ''),
    'stripe_webhook_secret' => env('STRIPE_WEBHOOK_SECRET', ''),
    'stripe_secret_key' => env('STRIPE_SECRET_KEY', ''),
];
