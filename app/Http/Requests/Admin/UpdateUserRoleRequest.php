<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRoleRequest extends FormRequest
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
            'role' => ['required', 'string', 'in:ADMIN,CLIENT,HOTEL'],
            'hotel_id' => [
                'nullable',
                'integer',
                Rule::exists('hotels', 'id'),
                Rule::requiredIf(fn () => $this->input('role') === 'HOTEL'),
            ],
        ];
    }
}
