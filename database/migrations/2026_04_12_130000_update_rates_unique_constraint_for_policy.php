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
            $table->dropUnique('rates_unique_combo');
            $table->unique(
                ['hotel_id', 'room_type_id', 'meal_plan_id', 'cancellation_policy'],
                'rates_unique_combo_policy'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rates', function (Blueprint $table) {
            $table->dropUnique('rates_unique_combo_policy');
            $table->unique(['hotel_id', 'room_type_id', 'meal_plan_id'], 'rates_unique_combo');
        });
    }
};
