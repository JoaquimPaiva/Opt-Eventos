<?php

use App\Http\Controllers\Booking\BookingController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Admin\EventController;
use App\Http\Controllers\Admin\HotelController;
use App\Http\Controllers\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Admin\RateController;
use App\Http\Controllers\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Admin\SupplierPaymentController as AdminSupplierPaymentController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Dashboard\BookingDashboardController;
use App\Http\Controllers\Hotel\BookingController as HotelBookingController;
use App\Http\Controllers\Hotel\UserController as HotelUserController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PushSubscriptionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Webhooks\PaymentWebhookController;
use App\Models\Rate;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Foundation\Application;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    $today = Carbon::today()->toDateString();

    $rates = Rate::query()
        ->with(['hotel.event', 'roomType', 'mealPlan'])
        ->where('is_active', true)
        ->where('stock', '>', 0)
        ->whereHas('hotel.event', function ($query) use ($today) {
            $query
                ->where('is_active', true)
                ->whereDate('booking_end', '>=', $today);
        })
        ->orderByDesc('id')
        ->get()
        ->map(fn (Rate $rate) => [
            'id' => $rate->id,
            'event_id' => $rate->hotel->event->id,
            'hotel_id' => $rate->hotel->id,
            'event_name' => $rate->hotel->event->name,
            'hotel_name' => $rate->hotel->name,
            'hotel_images' => collect($rate->hotel->gallery_images ?? [])
                ->filter(fn ($path) => is_string($path) && $path !== '')
                ->map(fn (string $path) => str_starts_with($path, 'http://') || str_starts_with($path, 'https://')
                    ? $path
                    : '/storage/'.ltrim($path, '/'))
                ->values()
                ->all(),
            'room_type' => $rate->roomType->name,
            'meal_plan' => $rate->mealPlan->name,
            'sale_price' => (float) $rate->sale_price,
            'currency' => $rate->currency,
            'stock' => $rate->stock,
            'booking_start' => $rate->hotel->event->booking_start->toDateString(),
            'booking_end' => $rate->hotel->event->booking_end->toDateString(),
            'max_guests' => $rate->roomType->max_guests,
        ])
        ->values();

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'rates' => $rates,
    ]);
});

Route::post('/webhooks/payments', PaymentWebhookController::class)
    ->withoutMiddleware([VerifyCsrfToken::class])
    ->name('webhooks.payments.handle');
Route::post('/webhooks/stripe', PaymentWebhookController::class)
    ->defaults('provider', 'stripe')
    ->withoutMiddleware([VerifyCsrfToken::class])
    ->name('webhooks.stripe.handle');

Route::get('/dashboard', function (\Illuminate\Http\Request $request) {
    if ($request->user()?->role === 'HOTEL') {
        return redirect()->route('hotel.bookings.index');
    }

    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::middleware('not_hotel')->group(function () {
        Route::get('/checkout', [BookingController::class, 'create'])->name('checkout');
        Route::post('/checkout/payment-intent', [BookingController::class, 'createPaymentIntent'])->name('checkout.payment-intent');
        Route::post('/checkout', [BookingController::class, 'store'])->name('checkout.store');
        Route::get('/dashboard/bookings', [BookingDashboardController::class, 'index'])->name('dashboard.bookings.index');
        Route::get('/dashboard/bookings/{booking}', [BookingDashboardController::class, 'show'])->name('dashboard.bookings.show');
        Route::get('/dashboard/bookings/{booking}/payment', [BookingDashboardController::class, 'payment'])->name('dashboard.bookings.payment');
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
    Route::resource('/admin/events', EventController::class)->names('admin.events')->except('show');
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
