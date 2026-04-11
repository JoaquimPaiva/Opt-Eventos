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
                    'rate_id' => 'A tarifa selecionada já não está disponível para reserva.',
                ]);
            }

            if ($rate->stock <= 0) {
                throw ValidationException::withMessages([
                    'rate_id' => 'A tarifa selecionada está esgotada.',
                ]);
            }

            $checkIn = CarbonImmutable::parse((string) $payload['check_in'])->startOfDay();
            $checkOut = CarbonImmutable::parse((string) $payload['check_out'])->startOfDay();
            $nights = $checkIn->diffInDays($checkOut, false);

            if ($nights <= 0) {
                throw ValidationException::withMessages([
                    'check_out' => 'A data de check-out tem de ser posterior à data de check-in.',
                ]);
            }

            $today = CarbonImmutable::now()->startOfDay();
            $bookingStart = $event->booking_start?->startOfDay();
            $bookingEnd = $event->booking_end?->startOfDay();
            if (($bookingStart && $today->lt($bookingStart))
                || ($bookingEnd && $today->gt($bookingEnd))
            ) {
                throw ValidationException::withMessages([
                    'rate_id' => 'Este evento não está com reservas abertas na data atual.',
                ]);
            }

            $guests = (int) $payload['guests'];
            if ($guests > $rate->roomType->max_guests) {
                throw ValidationException::withMessages([
                    'guests' => 'O número de hóspedes excede a capacidade máxima deste quarto.',
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

            $isDepositFlow = (string) $rate->cancellation_policy === Rate::CANCELLATION_POLICY_DEPOSIT_NON_REFUNDABLE
                && $rate->deposit_amount !== null
                && $rate->balance_due_days_before_checkin !== null;

            if ($isDepositFlow) {
                $depositAmount = min((float) $rate->deposit_amount, $totalPrice);
                $balanceAmount = max(0, $totalPrice - $depositAmount);
                $depositDueDate = now()->toDateString();
                $balanceDueDate = $checkIn->subDays((int) $rate->balance_due_days_before_checkin)->toDateString();

                Payment::query()->create([
                    'booking_id' => $booking->id,
                    'provider' => (string) config('payment.provider', 'STRIPE_MOCK'),
                    'amount' => $depositAmount,
                    'currency' => $rate->currency,
                    'status' => 'PENDING',
                    'installment_type' => Payment::INSTALLMENT_DEPOSIT,
                    'due_date' => $depositDueDate,
                    'deposit_amount' => $depositAmount,
                    'balance_amount' => $balanceAmount,
                    'deposit_due_date' => $depositDueDate,
                    'balance_due_date' => $balanceDueDate,
                    'deposit_paid_at' => null,
                    'balance_paid_at' => null,
                    'paid_at' => null,
                    'provider_reference' => null,
                    'deposit_provider_reference' => null,
                    'balance_provider_reference' => null,
                ]);
            } else {
                Payment::query()->create([
                    'booking_id' => $booking->id,
                    'provider' => (string) config('payment.provider', 'STRIPE_MOCK'),
                    'amount' => $totalPrice,
                    'currency' => $rate->currency,
                    'status' => 'PENDING',
                    'installment_type' => Payment::INSTALLMENT_FULL,
                    'due_date' => now()->addDays(3)->toDateString(),
                    'deposit_amount' => null,
                    'balance_amount' => null,
                    'deposit_due_date' => null,
                    'balance_due_date' => null,
                    'deposit_paid_at' => null,
                    'balance_paid_at' => null,
                    'paid_at' => null,
                    'provider_reference' => (string) ($payload['payment_reference'] ?? sprintf('pm_%s', $booking->id)),
                    'deposit_provider_reference' => null,
                    'balance_provider_reference' => null,
                ]);
            }

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
