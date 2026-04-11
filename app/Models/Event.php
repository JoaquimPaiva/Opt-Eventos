<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'cover_image',
        'location',
        'latitude',
        'longitude',
        'start_date',
        'end_date',
        'booking_start',
        'booking_end',
        'is_active',
        'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'booking_start' => 'date',
            'booking_end' => 'date',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ];
    }

    public function hotels(): HasMany
    {
        return $this->hasMany(Hotel::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
}
