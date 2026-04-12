<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoice_series_counters', function (Blueprint $table): void {
            $table->id();
            $table->string('series_code', 30)->unique();
            $table->string('document_type', 16);
            $table->string('validation_code', 40)->nullable();
            $table->unsignedBigInteger('next_number')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_series_counters');
    }
};

