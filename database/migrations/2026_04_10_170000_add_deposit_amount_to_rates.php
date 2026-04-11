<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('rates', function (Blueprint $table) {
            $table->decimal('deposit_amount', 10, 2)
                ->nullable()
                ->after('cancellation_policy');
        });

        DB::statement('UPDATE rates SET deposit_amount = ROUND((sale_price * deposit_percentage) / 100, 2) WHERE deposit_percentage IS NOT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rates', function (Blueprint $table) {
            $table->dropColumn('deposit_amount');
        });
    }
};
