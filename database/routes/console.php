<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Minishlink\WebPush\VAPID;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('webpush:vapid', function () {
    $keys = VAPID::createVapidKeys();

    $this->newLine();
    $this->info('Add these values to your .env:');
    $this->line('VAPID_PUBLIC_KEY='.$keys['publicKey']);
    $this->line('VAPID_PRIVATE_KEY='.$keys['privateKey']);
    $this->line('VAPID_SUBJECT=mailto:your-email@example.com');
    $this->newLine();
})->purpose('Generate VAPID keys for browser push notifications');
