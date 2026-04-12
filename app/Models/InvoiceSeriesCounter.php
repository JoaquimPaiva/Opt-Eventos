<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoiceSeriesCounter extends Model
{
    use HasFactory;

    protected $fillable = [
        'series_code',
        'document_type',
        'validation_code',
        'next_number',
    ];

    protected function casts(): array
    {
        return [
            'next_number' => 'integer',
        ];
    }
}

