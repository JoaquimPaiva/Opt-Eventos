<?php

namespace App\Http\Controllers\Booking;

use App\Actions\Booking\CreateBookingAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\CreatePaymentIntentRequest;
use App\Http\Requests\Booking\StoreBookingRequest;
use App\Models\Rate;
use App\Models\User;
use App\Notifications\AdminBookingCreatedNotification;
use App\Notifications\BookingCreatedNotification;
use App\Notifications\HotelBookingCreatedNotification;
use App\Services\Payments\PaymentIntentService;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class BookingController extends Controller
{
    public function create(Request $request): Response
    {
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

        return Inertia::render('Checkout', [
            'rates' => $rates,
            'prefill' => [
                'rate_id' => $request->string('rate_id')->toString(),
                'check_in' => $request->string('check_in')->toString(),
                'check_out' => $request->string('check_out')->toString(),
                'guests' => $request->string('guests')->toString(),
            ],
        ]);
    }

    public function store(StoreBookingRequest $request, CreateBookingAction $createBookingAction): RedirectResponse
    {
        $booking = $createBookingAction->execute($request->user(), $request->validated());
        $booking->loadMissing(['event', 'hotel', 'payment']);
        $request->user()->notify(new BookingCreatedNotification($booking));
        User::query()
            ->where('role', 'ADMIN')
            ->get()
            ->each(fn (User $admin) => $admin->notify(new AdminBookingCreatedNotification($booking)));
        User::query()
            ->where('role', 'HOTEL')
            ->where('hotel_id', $booking->hotel_id)
            ->get()
            ->each(fn (User $hotelUser) => $hotelUser->notify(new HotelBookingCreatedNotification($booking)));

        return to_route('dashboard.bookings.payment', $booking)
            ->with('success', "Booking {$booking->id} created successfully. Please complete payment.");
    }

    public function createPaymentIntent(CreatePaymentIntentRequest $request, PaymentIntentService $paymentIntentService): JsonResponse
    {
        /** @var Rate $rate */
        $rate = Rate::query()
            ->with(['hotel.event', 'roomType'])
            ->findOrFail((int) $request->validated('rate_id'));

        $event = $rate->hotel->event;
        $today = CarbonImmutable::now()->startOfDay();
        if (! $rate->is_active || ! $event->is_active) {
            throw ValidationException::withMessages([
                'rate_id' => 'Selected rate is not available.',
            ]);
        }

        if ($today->lt($event->booking_start->startOfDay()) || $today->gt($event->booking_end->startOfDay())) {
            throw ValidationException::withMessages([
                'rate_id' => 'This event is not open for bookings on the current date.',
            ]);
        }

        if ($rate->stock <= 0) {
            throw ValidationException::withMessages([
                'rate_id' => 'Selected rate is sold out.',
            ]);
        }

        $checkIn = CarbonImmutable::parse((string) $request->validated('check_in'))->startOfDay();
        $checkOut = CarbonImmutable::parse((string) $request->validated('check_out'))->startOfDay();
        $nights = $checkIn->diffInDays($checkOut, false);
        if ($nights <= 0) {
            throw ValidationException::withMessages([
                'check_out' => 'Check-out must be after check-in.',
            ]);
        }

        $guests = (int) $request->validated('guests');
        if ($guests > $rate->roomType->max_guests) {
            throw ValidationException::withMessages([
                'guests' => 'Guest count exceeds room capacity.',
            ]);
        }

        try {
            $intent = $paymentIntentService->create(
                amount: (float) $rate->sale_price * $nights,
                currency: (string) $rate->currency
            );
        } catch (RuntimeException $exception) {
            throw ValidationException::withMessages([
                'payment' => $exception->getMessage(),
            ]);
        }

        return response()->json($intent, 201);
    }
}
