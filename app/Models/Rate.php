<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Rate extends Model
{
    use HasFactory;

    public const CANCELLATION_POLICY_FREE = 'FREE_CANCELLATION';
    public const CANCELLATION_POLICY_NON_REFUNDABLE = 'NON_REFUNDABLE';
    public const CANCELLATION_POLICY_DEPOSIT_NON_REFUNDABLE = 'DEPOSIT_NON_REFUNDABLE';

    protected $fillable = [
        'hotel_id',
        'room_type_id',
        'meal_plan_id',
        'cost_price',
        'sale_price',
        'currency',
        'stock',
        'cancellation_policy',
        'deposit_amount',
        'balance_due_days_before_checkin',
        'cancellation_deadline',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'cost_price' => 'decimal:2',
            'sale_price' => 'decimal:2',
            'deposit_amount' => 'decimal:2',
            'balance_due_days_before_checkin' => 'integer',
            'cancellation_deadline' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class);
    }

    public function mealPlan(): BelongsTo
    {
        return $this->belongsTo(MealPlan::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
}
