<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table): void {
            $table->string('series_code', 30)->nullable()->after('document_type');
            $table->string('series_validation_code', 40)->nullable()->after('series_code');
            $table->unsignedBigInteger('sequential_number')->nullable()->after('series_validation_code');
            $table->string('atcud', 80)->nullable()->after('sequential_number');
            $table->text('qr_payload')->nullable()->after('atcud');
            $table->decimal('tax_base', 10, 2)->nullable()->after('amount');
            $table->decimal('vat_amount', 10, 2)->nullable()->after('tax_base');
            $table->decimal('vat_rate_percent', 6, 2)->nullable()->after('vat_amount');

            $table->unique(['series_code', 'sequential_number'], 'invoices_series_sequential_unique');
            $table->index('atcud');
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table): void {
            $table->dropUnique('invoices_series_sequential_unique');
            $table->dropIndex(['atcud']);
            $table->dropColumn([
                'series_code',
                'series_validation_code',
                'sequential_number',
                'atcud',
                'qr_payload',
                'tax_base',
                'vat_amount',
                'vat_rate_percent',
            ]);
        });
    }
};

