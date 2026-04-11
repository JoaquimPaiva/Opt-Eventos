<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    public const INSTALLMENT_FULL = 'FULL';
    public const INSTALLMENT_DEPOSIT = 'DEPOSIT';
    public const INSTALLMENT_BALANCE = 'BALANCE';

    protected $fillable = [
        'booking_id',
        'provider',
        'amount',
        'currency',
        'status',
        'installment_type',
        'due_date',
        'deposit_amount',
        'balance_amount',
        'deposit_due_date',
        'balance_due_date',
        'deposit_paid_at',
        'balance_paid_at',
        'paid_at',
        'provider_reference',
        'deposit_provider_reference',
        'balance_provider_reference',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'due_date' => 'date',
            'deposit_amount' => 'decimal:2',
            'balance_amount' => 'decimal:2',
            'deposit_due_date' => 'date',
            'balance_due_date' => 'date',
            'deposit_paid_at' => 'datetime',
            'balance_paid_at' => 'datetime',
            'paid_at' => 'datetime',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }
}
