<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'hotel_id' => [
                'required',
                'integer',
                'exists:hotels,id',
                Rule::unique('rates', 'hotel_id')->where(fn ($query) => $query
                    ->where('room_type_id', $this->integer('room_type_id'))
                    ->where('meal_plan_id', $this->integer('meal_plan_id'))),
            ],
            'room_type_id' => ['required', 'integer', 'exists:room_types,id'],
            'meal_plan_id' => ['required', 'integer', 'exists:meal_plans,id'],
            'cost_price' => ['required', 'numeric', 'min:0'],
            'sale_price' => ['required', 'numeric', 'gte:cost_price'],
            'currency' => ['required', 'string', 'size:3'],
            'stock' => ['required', 'integer', 'min:0'],
            'cancellation_deadline' => ['required', 'date'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
