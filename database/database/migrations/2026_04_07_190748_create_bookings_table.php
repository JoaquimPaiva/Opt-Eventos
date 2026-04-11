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
        Schema::create('bookings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('event_id')->constrained()->restrictOnDelete();
            $table->foreignId('hotel_id')->constrained()->restrictOnDelete();
            $table->foreignId('rate_id')->constrained()->restrictOnDelete();
            $table->date('check_in');
            $table->date('check_out');
            $table->unsignedTinyInteger('guests');
            $table->unsignedTinyInteger('nights');
            $table->decimal('subtotal', 10, 2);
            $table->decimal('fees_total', 10, 2)->default(0);
            $table->decimal('total_price', 10, 2);
            $table->string('status')->default('PENDING');
            $table->string('cancellation_reason')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
