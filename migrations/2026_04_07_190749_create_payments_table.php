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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->string('provider')->default('STRIPE_MOCK');
            $table->decimal('amount', 10, 2);
            $table->char('currency', 3)->default('EUR');
            $table->string('status')->default('PENDING');
            $table->date('due_date');
            $table->timestamp('paid_at')->nullable();
            $table->string('provider_reference')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
