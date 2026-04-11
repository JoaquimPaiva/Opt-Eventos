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
        Schema::table('events', function (Blueprint $table) {
            $table->date('start_date')->nullable()->change();
            $table->date('end_date')->nullable()->change();
            $table->date('booking_start')->nullable()->change();
            $table->date('booking_end')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->date('start_date')->nullable(false)->change();
            $table->date('end_date')->nullable(false)->change();
            $table->date('booking_start')->nullable(false)->change();
            $table->date('booking_end')->nullable(false)->change();
        });
    }
};
