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
        Schema::create('rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hotel_id')->constrained()->cascadeOnDelete();
            $table->foreignId('room_type_id')->constrained()->restrictOnDelete();
            $table->foreignId('meal_plan_id')->constrained()->restrictOnDelete();
            $table->decimal('cost_price', 10, 2);
            $table->decimal('sale_price', 10, 2);
            $table->char('currency', 3)->default('EUR');
            $table->unsignedInteger('stock');
            $table->dateTime('cancellation_deadline');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['hotel_id', 'room_type_id', 'meal_plan_id'], 'rates_unique_combo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rates');
    }
};
