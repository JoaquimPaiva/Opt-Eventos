<?php

use App\Http\Controllers\Booking\BookingController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Admin\EventController;
use App\Http\Controllers\Admin\EventLogoController;
use App\Http\Controllers\Admin\HotelController;
use App\Http\Controllers\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Admin\RateController;
use App\Http\Controllers\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Admin\SupplierPaymentController as AdminSupplierPaymentController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Dashboard\BookingDashboardController;
use App\Http\Controllers\Hotel\BookingController as HotelBookingController;
use App\Http\Controllers\Hotel\DashboardController as HotelDashboardController;
use App\Http\Controllers\Hotel\UserController as HotelUserController;
use App\Http\Controllers\Legal\CookieConsentController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PushSubscriptionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Webhooks\PaymentWebhookController;
use App\Models\Event;
use App\Models\EventLogo;
use App\Models\Hotel;
use App\Models\Rate;
use App\Support\MediaUrl;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Foundation\Application;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/media/{path}', [MediaController::class, 'show'])
    ->where('path', '.*')
    ->name('media.public');

Route::get('/politica-de-privacidade', function () {
    return Inertia::render('Legal/PrivacyPolicy');
})->name('legal.privacy');

Route::get('/politica-de-cookies', function () {
    return Inertia::render('Legal/CookiePolicy');
})->name('legal.cookies');

Route::get('/termos-e-condicoes', function () {
    return Inertia::render('Legal/TermsAndConditions');
})->name('legal.terms');

Route::post('/legal/cookie-consent', [CookieConsentController::class, 'store'])
    ->middleware('throttle:30,1')
    ->name('legal.cookie-consent.store');

Route::get('/', function () {
    $today = Carbon::today()->toDateString();
    $featuredEventIds = Event::query()
        ->where('is_featured', true)
        ->pluck('id')
        ->map(fn ($id) => (int) $id)
        ->values();

    $rates = Rate::query()
        ->with(['hotel.event', 'roomType', 'mealPlan'])
        ->where('is_active', true)
        ->where('stock', '>', 0)
        ->whereHas('hotel.event', function ($query) use ($today) {
            $query
                ->where('is_active', true)
                ->where(function ($windowQuery) use ($today) {
                    $windowQuery
                        ->whereNull('booking_start')
                        ->orWhereDate('booking_start', '<=', $today);
                })
                ->where(function ($windowQuery) use ($today) {
                    $windowQuery
                        ->whereNull('booking_end')
                        ->orWhereDate('booking_end', '>=', $today);
                });
        })
        ->orderByDesc('id')
        ->get()
        ->map(fn (Rate $rate) => [
            'id' => $rate->id,
            'event_id' => $rate->hotel->event->id,
            'hotel_id' => $rate->hotel->id,
            'event_name' => $rate->hotel->event->name,
            'event_cover_image' => MediaUrl::fromStoragePath($rate->hotel->event->cover_image),
            'hotel_name' => $rate->hotel->name,
            'hotel_images' => collect($rate->hotel->gallery_images ?? [])
                ->filter(fn ($path) => is_string($path) && $path !== '')
                ->map(fn (string $path) => MediaUrl::fromStoragePath($path))
                ->filter(fn ($url) => is_string($url) && $url !== '')
                ->values()
                ->all(),
            'room_type' => $rate->roomType->name,
            'meal_plan' => $rate->mealPlan->name,
            'sale_price' => (float) $rate->sale_price,
            'currency' => $rate->currency,
            'stock' => $rate->stock,
            'booking_start' => $rate->hotel->event->booking_start?->toDateString(),
            'booking_end' => $rate->hotel->event->booking_end?->toDateString(),
            'max_guests' => $rate->roomType->max_guests,
        ])
        ->values();

    $managedLogos = EventLogo::query()
        ->where('is_active', true)
        ->orderBy('display_order')
        ->orderBy('id')
        ->get()
        ->map(fn (EventLogo $logo) => [
            'id' => $logo->id,
            'name' => $logo->name,
            'image' => MediaUrl::fromStoragePath($logo->image_path),
        ])
        ->filter(fn (array $logo) => $logo['image'] !== null)
        ->values();

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'featured_event_ids' => $featuredEventIds,
        'rates' => $rates,
        'logo_strip' => $managedLogos,
    ]);
});

Route::get('/eventos', function () {
    $events = Event::query()
        ->withCount('hotels')
        ->with([
            'hotels:id,event_id,gallery_images',
        ])
        ->orderByDesc('start_date')
        ->get()
        ->map(fn (Event $event) => [
            'id' => $event->id,
            'name' => $event->name,
            'description' => $event->description,
            'cover_image_url' => MediaUrl::fromStoragePath($event->cover_image)
                ?? collect($event->hotels)
                    ->flatMap(fn ($hotel) => collect($hotel->gallery_images ?? []))
                    ->filter(fn ($path) => is_string($path) && $path !== '')
                    ->map(fn (string $path) => MediaUrl::fromStoragePath($path))
                    ->filter(fn ($url) => is_string($url) && $url !== '')
                    ->first(),
            'location' => $event->location,
            'start_date' => $event->start_date?->toDateString(),
            'end_date' => $event->end_date?->toDateString(),
            'booking_start' => $event->booking_start?->toDateString(),
            'booking_end' => $event->booking_end?->toDateString(),
            'is_active' => (bool) $event->is_active,
            'hotels_count' => (int) $event->hotels_count,
        ])
        ->values();

    return Inertia::render('Eventos', [
        'events' => $events,
    ]);
})->name('events.index');

Route::get('/hoteis-parceiros', function () {
    $hotels = Hotel::query()
        ->with(['event:id,name,location,start_date,end_date,is_active'])
        ->withCount([
            'rates as active_rates_count' => fn ($query) => $query->where('is_active', true),
        ])
        ->withMin([
            'rates as min_sale_price' => fn ($query) => $query->where('is_active', true),
        ], 'sale_price')
        ->where('is_active', true)
        ->orderByDesc('id')
        ->get()
        ->map(fn (Hotel $hotel) => [
            'id' => $hotel->id,
            'event_id' => $hotel->event_id,
            'event_name' => (string) $hotel->event?->name,
            'event_location' => $hotel->event?->location,
            'event_start_date' => $hotel->event?->start_date?->toDateString(),
            'event_end_date' => $hotel->event?->end_date?->toDateString(),
            'name' => $hotel->name,
            'description' => $hotel->description,
            'address' => $hotel->address,
            'supplier_name' => $hotel->supplier_name,
            'website_url' => $hotel->website_url,
            'cover_image_url' => collect($hotel->gallery_images ?? [])
                ->filter(fn ($path) => is_string($path) && $path !== '')
                ->map(fn (string $path) => MediaUrl::fromStoragePath($path))
                ->filter(fn ($url) => is_string($url) && $url !== '')
                ->first(),
            'images' => collect($hotel->gallery_images ?? [])
                ->filter(fn ($path) => is_string($path) && $path !== '')
                ->map(fn (string $path) => MediaUrl::fromStoragePath($path))
                ->filter(fn ($url) => is_string($url) && $url !== '')
                ->values()
                ->all(),
            'active_rates_count' => (int) ($hotel->active_rates_count ?? 0),
            'min_sale_price' => $hotel->min_sale_price !== null ? (float) $hotel->min_sale_price : null,
            'currency' => 'EUR',
        ])
        ->values();

    return Inertia::render('Hoteis', [
        'hotels' => $hotels,
    ]);
})->name('hotels.index');

Route::get('/contactos', function () {
    return Inertia::render('Contactos');
})->name('contacts.index');

Route::post('/webhooks/payments', PaymentWebhookController::class)
    ->withoutMiddleware([VerifyCsrfToken::class])
    ->name('webhooks.payments.handle');
Route::post('/webhooks/stripe', PaymentWebhookController::class)
    ->defaults('provider', 'stripe')
    ->withoutMiddleware([VerifyCsrfToken::class])
    ->name('webhooks.stripe.handle');

Route::get('/dashboard', function (\Illuminate\Http\Request $request) {
    if ($request->user()?->role === 'HOTEL') {
        return redirect()->route('hotel.dashboard');
    }

    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::middleware('not_hotel')->group(function () {
        Route::get('/checkout/events', [BookingController::class, 'events'])->name('checkout.events');
        Route::get('/checkout', [BookingController::class, 'hotels'])->name('checkout');
        Route::get('/checkout/hotels/{hotel}', [BookingController::class, 'hotel'])->name('checkout.hotels.show');
        Route::get('/checkout/payment', [BookingController::class, 'payment'])->name('checkout.payment');
        Route::post('/checkout/payment-intent', [BookingController::class, 'createPaymentIntent'])->name('checkout.payment-intent');
        Route::post('/checkout', [BookingController::class, 'store'])->name('checkout.store');
        Route::get('/dashboard/faturas-recibos', [BookingDashboardController::class, 'billingDocuments'])->name('dashboard.billing.index');
        Route::get('/dashboard/bookings', [BookingDashboardController::class, 'index'])->name('dashboard.bookings.index');
        Route::get('/dashboard/bookings/{booking}', [BookingDashboardController::class, 'show'])->name('dashboard.bookings.show');
        Route::get('/dashboard/bookings/{booking}/payment', [BookingDashboardController::class, 'payment'])->name('dashboard.bookings.payment');
        Route::get('/dashboard/bookings/{booking}/billing/{invoice}', [BookingDashboardController::class, 'downloadBillingDocument'])->name('dashboard.bookings.billing.download');
        Route::post('/dashboard/bookings/{booking}/payment/intent', [BookingDashboardController::class, 'paymentIntent'])->name('dashboard.bookings.payment.intent');
        Route::post('/dashboard/bookings/{booking}/payment/sync-stripe', [BookingDashboardController::class, 'syncStripePayment'])->name('dashboard.bookings.payment.sync-stripe');
        Route::post('/dashboard/bookings/{booking}/payment/confirm', [BookingDashboardController::class, 'confirmPayment'])->name('dashboard.bookings.payment.confirm');
        Route::post('/dashboard/bookings/{booking}/cancel', [BookingDashboardController::class, 'cancel'])->name('dashboard.bookings.cancel');
        Route::delete('/dashboard/bookings/{booking}', [BookingDashboardController::class, 'destroy'])->name('dashboard.bookings.destroy');
    });

    Route::post('/notifications/{notification}/read', [NotificationController::class, 'read'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'readAll'])->name('notifications.read-all');
    Route::get('/notifications/feed', [NotificationController::class, 'feed'])->name('notifications.feed');
    Route::post('/push-subscriptions', [PushSubscriptionController::class, 'store'])->name('push-subscriptions.store');
    Route::delete('/push-subscriptions', [PushSubscriptionController::class, 'destroy'])->name('push-subscriptions.destroy');
});

Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('/admin', AdminDashboardController::class)->name('admin.dashboard');
    Route::resource('/admin/event-logos', EventLogoController::class)->names('admin.event-logos')->except(['show', 'create', 'edit']);
    Route::resource('/admin/events', EventController::class)->names('admin.events')->except('show');
    Route::patch('/admin/events/{event}/featured', [EventController::class, 'toggleFeatured'])->name('admin.events.toggle-featured');
    Route::resource('/admin/hotels', HotelController::class)->names('admin.hotels')->except('show');
    Route::resource('/admin/rates', RateController::class)->names('admin.rates')->except('show');
    Route::get('/admin/bookings', [AdminBookingController::class, 'index'])->name('admin.bookings.index');
    Route::patch('/admin/bookings/{booking}/status', [AdminBookingController::class, 'updateStatus'])->name('admin.bookings.update-status');
    Route::delete('/admin/bookings/{booking}', [AdminBookingController::class, 'destroy'])->name('admin.bookings.destroy');
    Route::get('/admin/payments', [AdminPaymentController::class, 'index'])->name('admin.payments.index');
    Route::patch('/admin/payments/{payment}/status', [AdminPaymentController::class, 'updateStatus'])->name('admin.payments.update-status');
    Route::get('/admin/supplier-payments', [AdminSupplierPaymentController::class, 'index'])->name('admin.supplier-payments.index');
    Route::patch('/admin/supplier-payments/{supplierPayment}/status', [AdminSupplierPaymentController::class, 'updateStatus'])->name('admin.supplier-payments.update-status');
    Route::get('/admin/reports', [AdminReportController::class, 'index'])->name('admin.reports.index');
    Route::get('/admin/reports/export', [AdminReportController::class, 'export'])->name('admin.reports.export');
    Route::get('/admin/users', [AdminUserController::class, 'index'])->name('admin.users.index');
    Route::patch('/admin/users/{user}/role', [AdminUserController::class, 'updateRole'])->name('admin.users.update-role');
});

Route::middleware(['auth', 'verified', 'hotel'])->group(function () {
    Route::get('/hotel', HotelDashboardController::class)->name('hotel.dashboard');
    Route::get('/hotel/bookings', [HotelBookingController::class, 'index'])->name('hotel.bookings.index');
    Route::get('/hotel/users', [HotelUserController::class, 'index'])->name('hotel.users.index');
    Route::post('/hotel/users', [HotelUserController::class, 'store'])->name('hotel.users.store');
    Route::patch('/hotel/users/{user}', [HotelUserController::class, 'update'])->name('hotel.users.update');
    Route::delete('/hotel/users/{user}', [HotelUserController::class, 'destroy'])->name('hotel.users.destroy');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
