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
        Schema::table('rates', function (Blueprint $table) {
            $table->string('cancellation_policy')
                ->default('FREE_CANCELLATION')
                ->after('stock');
            $table->decimal('deposit_percentage', 5, 2)
                ->nullable()
                ->after('cancellation_policy');
            $table->unsignedSmallInteger('balance_due_days_before_checkin')
                ->nullable()
                ->after('deposit_percentage');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rates', function (Blueprint $table) {
            $table->dropColumn([
                'cancellation_policy',
                'deposit_percentage',
                'balance_due_days_before_checkin',
            ]);
        });
    }
};
