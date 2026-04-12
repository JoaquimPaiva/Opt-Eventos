<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table): void {
            $table->string('document_type', 16)->default('INVOICE')->after('payment_id');
            $table->dropUnique('invoices_booking_id_installment_type_unique');
            $table->unique(['booking_id', 'installment_type', 'document_type'], 'invoices_booking_installment_document_unique');
            $table->index('document_type');
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table): void {
            $table->dropUnique('invoices_booking_installment_document_unique');
            $table->dropIndex(['document_type']);
            $table->dropColumn('document_type');
            $table->unique(['booking_id', 'installment_type']);
        });
    }
};
