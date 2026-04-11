<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->string('installment_type')
                ->default('FULL')
                ->after('status');
            $table->decimal('deposit_amount', 10, 2)
                ->nullable()
                ->after('due_date');
            $table->decimal('balance_amount', 10, 2)
                ->nullable()
                ->after('deposit_amount');
            $table->date('deposit_due_date')
                ->nullable()
                ->after('balance_amount');
            $table->date('balance_due_date')
                ->nullable()
                ->after('deposit_due_date');
            $table->timestamp('deposit_paid_at')
                ->nullable()
                ->after('balance_due_date');
            $table->timestamp('balance_paid_at')
                ->nullable()
                ->after('deposit_paid_at');
            $table->string('deposit_provider_reference')
                ->nullable()
                ->after('provider_reference');
            $table->string('balance_provider_reference')
                ->nullable()
                ->after('deposit_provider_reference');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn([
                'installment_type',
                'deposit_amount',
                'balance_amount',
                'deposit_due_date',
                'balance_due_date',
                'deposit_paid_at',
                'balance_paid_at',
                'deposit_provider_reference',
                'balance_provider_reference',
            ]);
        });
    }
};
