<?php

namespace App\Actions\Booking;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\Rate;
use App\Models\SupplierPayment;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CreateBookingAction
{
    /**
     * @param array<string, mixed> $payload
     */
    public function execute(User $user, array $payload): Booking
    {
        return DB::transaction(function () use ($user, $payload): Booking {
            /** @var Rate $rate */
            $rate = Rate::query()
                ->with(['hotel.event', 'roomType'])
                ->lockForUpdate()
                ->findOrFail($payload['rate_id']);

            $event = $rate->hotel->event;

            if (! $rate->is_active || ! $event->is_active) {
                throw ValidationException::withMessages([
                    'rate_id' => 'Selected rate is not available.',
                ]);
            }

            if ($rate->stock <= 0) {
                throw ValidationException::withMessages([
                    'rate_id' => 'Selected rate is sold out.',
                ]);
            }

            $checkIn = CarbonImmutable::parse((string) $payload['check_in'])->startOfDay();
            $checkOut = CarbonImmutable::parse((string) $payload['check_out'])->startOfDay();
            $nights = $checkIn->diffInDays($checkOut, false);

            if ($nights <= 0) {
                throw ValidationException::withMessages([
                    'check_out' => 'Check-out must be after check-in.',
                ]);
            }

            $today = CarbonImmutable::now()->startOfDay();
            if ($today->lt($event->booking_start->startOfDay()) || $today->gt($event->booking_end->startOfDay())) {
                throw ValidationException::withMessages([
                    'rate_id' => 'This event is not open for bookings on the current date.',
                ]);
            }

            $guests = (int) $payload['guests'];
            if ($guests > $rate->roomType->max_guests) {
                throw ValidationException::withMessages([
                    'guests' => 'Guest count exceeds room capacity.',
                ]);
            }

            $subtotal = (float) $rate->sale_price * $nights;
            $feesTotal = 0.0;
            $totalPrice = $subtotal + $feesTotal;

            $booking = Booking::query()->create([
                'user_id' => $user->id,
                'event_id' => $event->id,
                'hotel_id' => $rate->hotel_id,
                'rate_id' => $rate->id,
                'check_in' => $checkIn->toDateString(),
                'check_out' => $checkOut->toDateString(),
                'guests' => $guests,
                'nights' => $nights,
                'subtotal' => $subtotal,
                'fees_total' => $feesTotal,
                'total_price' => $totalPrice,
                'status' => 'CONFIRMED',
                'cancellation_reason' => null,
                'cancelled_at' => null,
            ]);

            $rate->decrement('stock');

            Payment::query()->create([
                'booking_id' => $booking->id,
                'provider' => (string) config('payment.provider', 'STRIPE_MOCK'),
                'amount' => $totalPrice,
                'currency' => $rate->currency,
                'status' => 'PENDING',
                'due_date' => now()->addDays(3)->toDateString(),
                'paid_at' => null,
                'provider_reference' => (string) ($payload['payment_reference'] ?? sprintf('pm_%s', $booking->id)),
            ]);

            SupplierPayment::query()->create([
                'booking_id' => $booking->id,
                'amount' => (float) $rate->cost_price * $nights,
                'currency' => $rate->currency,
                'due_date' => now()->addDays(15)->toDateString(),
                'status' => 'PENDING',
                'paid_at' => null,
            ]);

            return $booking->fresh(['rate.roomType', 'rate.mealPlan', 'hotel', 'event', 'payment', 'supplierPayment']);
        });
    }
}
