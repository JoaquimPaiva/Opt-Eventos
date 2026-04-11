<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $rows = DB::table('payments')
            ->join('bookings', 'bookings.id', '=', 'payments.booking_id')
            ->join('rates', 'rates.id', '=', 'bookings.rate_id')
            ->where('rates.cancellation_policy', 'DEPOSIT_NON_REFUNDABLE')
            ->where('payments.installment_type', 'FULL')
            ->whereIn('payments.status', ['PENDING', 'FAILED'])
            ->whereNull('payments.paid_at')
            ->select([
                'payments.id as payment_id',
                'payments.amount as total_amount',
                'bookings.check_in as check_in',
                'rates.deposit_amount as rate_deposit_amount',
                'rates.balance_due_days_before_checkin as rate_balance_days',
            ])
            ->get();

        foreach ($rows as $row) {
            $depositAmount = min((float) $row->rate_deposit_amount, (float) $row->total_amount);
            $balanceAmount = max(0.0, (float) $row->total_amount - $depositAmount);
            $balanceDays = (int) $row->rate_balance_days;
            $balanceDueDate = Carbon::parse((string) $row->check_in)->subDays($balanceDays)->toDateString();
            $depositDueDate = Carbon::today()->toDateString();

            DB::table('payments')
                ->where('id', $row->payment_id)
                ->update([
                    'installment_type' => 'DEPOSIT',
                    'amount' => $depositAmount,
                    'due_date' => $depositDueDate,
                    'deposit_amount' => $depositAmount,
                    'balance_amount' => $balanceAmount,
                    'deposit_due_date' => $depositDueDate,
                    'balance_due_date' => $balanceDueDate,
                    'provider_reference' => null,
                    'deposit_provider_reference' => null,
                    'balance_provider_reference' => null,
                    'updated_at' => now(),
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No rollback for data backfill.
    }
};
