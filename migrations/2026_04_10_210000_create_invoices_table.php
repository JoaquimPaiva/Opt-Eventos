<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payment_id')->nullable()->constrained()->nullOnDelete();
            $table->string('installment_type', 16);
            $table->string('invoice_number')->unique();
            $table->decimal('amount', 10, 2);
            $table->string('currency', 10);
            $table->string('file_path')->nullable();
            $table->timestamp('issued_at');
            $table->timestamps();

            $table->unique(['booking_id', 'installment_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
