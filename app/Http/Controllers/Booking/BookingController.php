<?php

namespace App\Http\Controllers\Booking;

use App\Actions\Booking\CreateBookingAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\CreatePaymentIntentRequest;
use App\Http\Requests\Booking\StoreBookingRequest;
use App\Models\Hotel;
use App\Models\Rate;
use App\Models\User;
use App\Notifications\AdminBookingCreatedNotification;
use App\Notifications\BookingCreatedNotification;
use App\Notifications\HotelBookingCreatedNotification;
use App\Support\MediaUrl;
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
    public function events(Request $request): Response|RedirectResponse
    {
        if (! $request->filled('check_in') || ! $request->filled('check_out')) {
            return redirect('/');
        }

        $validated = $request->validate([
            'check_in' => ['required', 'date'],
            'check_out' => ['required', 'date', 'after:check_in'],
        ]);

        $today = Carbon::today()->toDateString();
        $checkIn = (string) $validated['check_in'];
        $checkOut = (string) $validated['check_out'];
        $rates = $this->availableRates($today)
            ->filter(fn (Rate $rate) => $this->dateFitsRateWindow($checkIn, $rate) && $this->dateFitsRateWindow($checkOut, $rate))
            ->values();

        $events = $rates
            ->groupBy(fn (Rate $rate) => $rate->hotel->event->id)
            ->map(function ($group) {
                /** @var Rate $firstRate */
                $firstRate = $group->first();
                $image = MediaUrl::fromStoragePath($firstRate->hotel->event->cover_image)
                    ?? collect($firstRate->hotel->gallery_images ?? [])
                        ->filter(fn ($path) => is_string($path) && $path !== '')
                        ->map(fn (string $path) => MediaUrl::fromStoragePath($path))
                        ->filter(fn ($url) => is_string($url) && $url !== '')
                        ->first();

                return [
                    'id' => $firstRate->hotel->event->id,
                    'name' => $firstRate->hotel->event->name,
                    'location' => $firstRate->hotel->event->location,
                    'start_date' => $firstRate->hotel->event->start_date?->toDateString(),
                    'end_date' => $firstRate->hotel->event->end_date?->toDateString(),
                    'booking_start' => $firstRate->hotel->event->booking_start?->toDateString(),
                    'booking_end' => $firstRate->hotel->event->booking_end?->toDateString(),
                    'hotels_available' => $group->pluck('hotel_id')->unique()->count(),
                    'offers_available' => $group->count(),
                    'from_price' => (float) $group->min('sale_price'),
                    'currency' => (string) $firstRate->currency,
                    'policies' => $group->pluck('cancellation_policy')->unique()->values()->all(),
                    'image' => $image,
                ];
            })
            ->sortBy('name')
            ->values();

        return Inertia::render('Checkout/Events', [
            'filters' => [
                'check_in' => $checkIn,
                'check_out' => $checkOut,
            ],
            'events' => $events,
        ]);
    }

    public function hotels(Request $request): \Inertia\Response|RedirectResponse
    {
        if (! $request->filled('event_id') || ! $request->filled('check_in') || ! $request->filled('check_out')) {
            return redirect('/');
        }

        $validated = $request->validate([
            'event_id' => ['required', 'integer', 'exists:events,id'],
            'check_in' => ['required', 'date'],
            'check_out' => ['required', 'date', 'after:check_in'],
        ]);

        $today = Carbon::today()->toDateString();
        $checkIn = (string) $validated['check_in'];
        $checkOut = (string) $validated['check_out'];
        $rates = $this->availableRates($today);
        $eventId = (int) $validated['event_id'];
        $eventRates = $rates->filter(fn (Rate $rate) => (int) $rate->hotel->event_id === $eventId
            && $this->dateFitsRateWindow($checkIn, $rate)
            && $this->dateFitsRateWindow($checkOut, $rate)
        )->values();

        if ($eventRates->isEmpty()) {
            throw ValidationException::withMessages([
                'event_id' => 'Não existem hotéis disponíveis para este evento.',
            ]);
        }

        /** @var Rate $firstEventRate */
        $firstEventRate = $eventRates->first();

        $hotels = $eventRates
            ->groupBy('hotel_id')
            ->map(function ($group) {
                /** @var Rate $firstRate */
                $firstRate = $group->first();
                $images = collect($firstRate->hotel->gallery_images ?? [])
                    ->filter(fn ($path) => is_string($path) && $path !== '')
                    ->map(fn (string $path) => MediaUrl::fromStoragePath($path))
                    ->filter(fn ($url) => is_string($url) && $url !== '')
                    ->values();

                return [
                    'id' => $firstRate->hotel->id,
                    'name' => $firstRate->hotel->name,
                    'address' => $firstRate->hotel->address,
                    'description' => $firstRate->hotel->description,
                    'image' => $images->first(),
                    'available_rates' => $group->count(),
                    'policies' => $group->pluck('cancellation_policy')->unique()->values()->all(),
                    'from_price' => (float) $group->min('sale_price'),
                    'currency' => (string) $firstRate->currency,
                ];
            })
            ->sortBy('from_price')
            ->values();

        return Inertia::render('Checkout/Hotels', [
            'event' => [
                'id' => $firstEventRate->hotel->event->id,
                'name' => $firstEventRate->hotel->event->name,
                'location' => $firstEventRate->hotel->event->location,
                'start_date' => $firstEventRate->hotel->event->start_date?->toDateString(),
                'end_date' => $firstEventRate->hotel->event->end_date?->toDateString(),
                'booking_start' => $firstEventRate->hotel->event->booking_start?->toDateString(),
                'booking_end' => $firstEventRate->hotel->event->booking_end?->toDateString(),
            ],
            'filters' => [
                'event_id' => (string) $validated['event_id'],
                'check_in' => $checkIn,
                'check_out' => $checkOut,
            ],
            'hotels' => $hotels,
        ]);
    }

    public function hotel(Request $request, Hotel $hotel): Response
    {
        $validated = $request->validate([
            'event_id' => ['required', 'integer', 'exists:events,id'],
            'check_in' => ['required', 'date'],
            'check_out' => ['required', 'date', 'after:check_in'],
        ]);

        $eventId = (int) $validated['event_id'];
        if ((int) $hotel->event_id !== $eventId || ! $hotel->is_active) {
            abort(404);
        }

        $today = Carbon::today()->toDateString();
        $rates = $this->availableRates($today)
            ->filter(fn (Rate $rate) => (int) $rate->hotel_id === (int) $hotel->id)
            ->values();

        if ($rates->isEmpty()) {
            throw ValidationException::withMessages([
                'event_id' => 'Este hotel já não tem disponibilidade.',
            ]);
        }

        /** @var Rate $firstRate */
        $firstRate = $rates->first();
        $images = collect($hotel->gallery_images ?? [])
            ->filter(fn ($path) => is_string($path) && $path !== '')
            ->map(fn (string $path) => MediaUrl::fromStoragePath($path))
            ->filter(fn ($url) => is_string($url) && $url !== '')
            ->values()
            ->all();

        return Inertia::render('Checkout/HotelDetail', [
            'event' => [
                'id' => $firstRate->hotel->event->id,
                'name' => $firstRate->hotel->event->name,
                'location' => $firstRate->hotel->event->location,
                'start_date' => $firstRate->hotel->event->start_date?->toDateString(),
                'end_date' => $firstRate->hotel->event->end_date?->toDateString(),
                'booking_start' => $firstRate->hotel->event->booking_start?->toDateString(),
                'booking_end' => $firstRate->hotel->event->booking_end?->toDateString(),
            ],
            'filters' => [
                'event_id' => (string) $validated['event_id'],
                'check_in' => (string) $validated['check_in'],
                'check_out' => (string) $validated['check_out'],
            ],
            'hotel' => [
                'id' => $hotel->id,
                'name' => $hotel->name,
                'address' => $hotel->address,
                'description' => $hotel->description,
                'images' => $images,
                'website_url' => $hotel->website_url,
            ],
            'rates' => $rates->map(fn (Rate $rate) => [
                'id' => $rate->id,
                'room_type' => $rate->roomType->name,
                'meal_plan' => $rate->mealPlan->name,
                'price' => (float) $rate->sale_price,
                'currency' => $rate->currency,
                'stock' => $rate->stock,
                'max_guests' => $rate->roomType->max_guests,
                'cancellation_policy' => $rate->cancellation_policy,
                'deposit_amount' => $rate->deposit_amount !== null ? (float) $rate->deposit_amount : null,
                'balance_due_days_before_checkin' => $rate->balance_due_days_before_checkin,
                'cancellation_deadline' => $rate->cancellation_deadline?->toDateString(),
            ])->values(),
        ]);
    }

    public function payment(Request $request): Response
    {
        $validated = $request->validate([
            'rate_id' => ['required', 'integer', 'exists:rates,id'],
            'check_in' => ['required', 'date'],
            'check_out' => ['required', 'date', 'after:check_in'],
            'guests' => ['nullable', 'integer', 'min:1', 'max:10'],
        ]);

        /** @var Rate $rate */
        $rate = Rate::query()
            ->with(['hotel.event', 'roomType', 'mealPlan'])
            ->findOrFail((int) $validated['rate_id']);

        $today = Carbon::today()->toDateString();
        $availableRateIds = $this->availableRates($today)->pluck('id');
        if (! $availableRateIds->contains($rate->id)) {
            throw ValidationException::withMessages([
                'rate_id' => 'A opção de quarto/refeição selecionada não está disponível.',
            ]);
        }

        $images = collect($rate->hotel->gallery_images ?? [])
            ->filter(fn ($path) => is_string($path) && $path !== '')
            ->map(fn (string $path) => MediaUrl::fromStoragePath($path))
            ->filter(fn ($url) => is_string($url) && $url !== '')
            ->values()
            ->all();

        return Inertia::render('Checkout/Payment', [
            'rate' => [
                'id' => $rate->id,
                'event_id' => $rate->hotel->event->id,
                'hotel_id' => $rate->hotel->id,
                'event_name' => $rate->hotel->event->name,
                'event_location' => $rate->hotel->event->location,
                'event_start_date' => $rate->hotel->event->start_date?->toDateString(),
                'event_end_date' => $rate->hotel->event->end_date?->toDateString(),
                'hotel_name' => $rate->hotel->name,
                'hotel_address' => $rate->hotel->address,
                'hotel_description' => $rate->hotel->description,
                'hotel_website_url' => $rate->hotel->website_url,
                'hotel_images' => $images,
                'room_type' => $rate->roomType->name,
                'meal_plan' => $rate->mealPlan->name,
                'sale_price' => (float) $rate->sale_price,
                'currency' => $rate->currency,
                'stock' => $rate->stock,
                'booking_start' => $rate->hotel->event->booking_start?->toDateString(),
                'booking_end' => $rate->hotel->event->booking_end?->toDateString(),
                'max_guests' => $rate->roomType->max_guests,
                'cancellation_policy' => $rate->cancellation_policy,
                'deposit_amount' => $rate->deposit_amount !== null ? (float) $rate->deposit_amount : null,
                'balance_due_days_before_checkin' => $rate->balance_due_days_before_checkin,
                'cancellation_deadline' => $rate->cancellation_deadline?->toDateString(),
            ],
            'prefill' => [
                'check_in' => (string) $validated['check_in'],
                'check_out' => (string) $validated['check_out'],
                'guests' => isset($validated['guests']) ? (string) $validated['guests'] : '1',
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
            ->with('success', "Reserva {$booking->id} criada com sucesso. Conclui o pagamento para confirmar.");
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
                'rate_id' => 'A tarifa selecionada já não está disponível.',
            ]);
        }

        $bookingStart = $event->booking_start?->startOfDay();
        $bookingEnd = $event->booking_end?->startOfDay();
        if (($bookingStart && $today->lt($bookingStart))
            || ($bookingEnd && $today->gt($bookingEnd))
        ) {
            throw ValidationException::withMessages([
                'rate_id' => 'Este evento não está com reservas abertas na data atual.',
            ]);
        }

        if ($rate->stock <= 0) {
            throw ValidationException::withMessages([
                'rate_id' => 'A tarifa selecionada está esgotada.',
            ]);
        }

        $checkIn = CarbonImmutable::parse((string) $request->validated('check_in'))->startOfDay();
        $checkOut = CarbonImmutable::parse((string) $request->validated('check_out'))->startOfDay();
        $nights = $checkIn->diffInDays($checkOut, false);
        if ($nights <= 0) {
            throw ValidationException::withMessages([
                'check_out' => 'A data de check-out tem de ser posterior à data de check-in.',
            ]);
        }

        $guests = (int) $request->validated('guests');
        if ($guests > $rate->roomType->max_guests) {
            throw ValidationException::withMessages([
                'guests' => 'O número de hóspedes excede a capacidade máxima deste quarto.',
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

    /**
     * @return \Illuminate\Support\Collection<int, Rate>
     */
    private function availableRates(string $today)
    {
        return Rate::query()
            ->with(['hotel.event', 'roomType', 'mealPlan'])
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->whereHas('hotel', fn ($query) => $query->where('is_active', true))
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
            ->get();
    }

    private function dateFitsRateWindow(string $date, Rate $rate): bool
    {
        $event = $rate->hotel->event;
        $start = $event->booking_start?->toDateString();
        $end = $event->booking_end?->toDateString();

        if ($start !== null && $date < $start) {
            return false;
        }

        if ($end !== null && $date > $end) {
            return false;
        }

        return true;
    }
}
