<?php

namespace App\Http\Requests\Admin;

use App\Models\Rate;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRateRequest extends FormRequest
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
        /** @var Rate $rate */
        $rate = $this->route('rate');

        return [
            'hotel_id' => [
                'required',
                'integer',
                'exists:hotels,id',
                Rule::unique('rates', 'hotel_id')->ignore($rate->id)->where(fn ($query) => $query
                    ->where('room_type_id', $this->integer('room_type_id'))
                    ->where('meal_plan_id', $this->integer('meal_plan_id'))),
            ],
            'room_type_id' => ['required', 'integer', 'exists:room_types,id'],
            'meal_plan_id' => ['required', 'integer', 'exists:meal_plans,id'],
            'cost_price' => ['required', 'numeric', 'min:0'],
            'sale_price' => ['required', 'numeric', 'gte:cost_price'],
            'currency' => ['required', 'string', 'size:3'],
            'stock' => ['required', 'integer', 'min:0'],
            'cancellation_policy' => [
                'required',
                'string',
                Rule::in([
                    Rate::CANCELLATION_POLICY_FREE,
                    Rate::CANCELLATION_POLICY_NON_REFUNDABLE,
                    Rate::CANCELLATION_POLICY_DEPOSIT_NON_REFUNDABLE,
                ]),
            ],
            'deposit_amount' => [
                'nullable',
                'numeric',
                'min:0.01',
                'lte:sale_price',
                'required_if:cancellation_policy,'.Rate::CANCELLATION_POLICY_DEPOSIT_NON_REFUNDABLE,
            ],
            'balance_due_days_before_checkin' => [
                'nullable',
                'integer',
                'min:1',
                'max:365',
                'required_if:cancellation_policy,'.Rate::CANCELLATION_POLICY_DEPOSIT_NON_REFUNDABLE,
            ],
            'cancellation_deadline' => ['required', 'date'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
