<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    use HasFactory;

    public const TYPE_INVOICE = 'INVOICE';
    public const TYPE_RECEIPT = 'RECEIPT';

    protected $fillable = [
        'booking_id',
        'payment_id',
        'document_type',
        'series_code',
        'series_validation_code',
        'sequential_number',
        'atcud',
        'qr_payload',
        'installment_type',
        'invoice_number',
        'amount',
        'tax_base',
        'vat_amount',
        'vat_rate_percent',
        'currency',
        'file_path',
        'issued_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'tax_base' => 'decimal:2',
            'vat_amount' => 'decimal:2',
            'vat_rate_percent' => 'decimal:2',
            'sequential_number' => 'integer',
            'issued_at' => 'datetime',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }
}
