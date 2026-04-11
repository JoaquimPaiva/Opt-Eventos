<?php

namespace App\Http\Requests\Admin;

use App\Models\Event;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEventRequest extends FormRequest
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
        /** @var Event $event */
        $event = $this->route('event');

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('events', 'slug')->ignore($event->id)],
            'description' => ['nullable', 'string'],
            'cover_image' => ['nullable', 'image', 'max:4096'],
            'remove_cover_image' => ['nullable', 'boolean'],
            'location' => ['required', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'booking_start' => ['nullable', 'date'],
            'booking_end' => ['nullable', 'date', 'after_or_equal:booking_start'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
