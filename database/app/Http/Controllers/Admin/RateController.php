<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRateRequest;
use App\Http\Requests\Admin\UpdateRateRequest;
use App\Models\Hotel;
use App\Models\MealPlan;
use App\Models\Rate;
use App\Models\RoomType;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class RateController extends Controller
{
    public function index(): Response
    {
        $rates = Rate::query()
            ->with(['hotel.event', 'roomType', 'mealPlan'])
            ->latest()
            ->get()
            ->map(fn (Rate $rate) => [
                'id' => $rate->id,
                'event_name' => $rate->hotel->event->name,
                'hotel_name' => $rate->hotel->name,
                'room_type' => $rate->roomType->name,
                'meal_plan' => $rate->mealPlan->name,
                'cost_price' => (float) $rate->cost_price,
                'sale_price' => (float) $rate->sale_price,
                'currency' => $rate->currency,
                'stock' => $rate->stock,
                'cancellation_deadline' => $rate->cancellation_deadline->toDateTimeString(),
                'is_active' => $rate->is_active,
            ])
            ->values();

        return Inertia::render('Admin/Rates/Index', [
            'rates' => $rates,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Rates/Create', $this->formOptions());
    }

    public function store(StoreRateRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['currency'] = strtoupper((string) $data['currency']);

        Rate::query()->create($data);

        return to_route('admin.rates.index')->with('success', 'Rate created successfully.');
    }

    public function edit(Rate $rate): Response
    {
        return Inertia::render('Admin/Rates/Edit', [
            ...$this->formOptions(),
            'rate' => [
                'id' => $rate->id,
                'hotel_id' => $rate->hotel_id,
                'room_type_id' => $rate->room_type_id,
                'meal_plan_id' => $rate->meal_plan_id,
                'cost_price' => (string) $rate->cost_price,
                'sale_price' => (string) $rate->sale_price,
                'currency' => $rate->currency,
                'stock' => $rate->stock,
                'cancellation_deadline' => $rate->cancellation_deadline->format('Y-m-d\TH:i'),
                'is_active' => $rate->is_active,
            ],
        ]);
    }

    public function update(UpdateRateRequest $request, Rate $rate): RedirectResponse
    {
        $data = $request->validated();
        $data['currency'] = strtoupper((string) $data['currency']);

        $rate->update($data);

        return to_route('admin.rates.index')->with('success', 'Rate updated successfully.');
    }

    public function destroy(Rate $rate): RedirectResponse
    {
        $rate->delete();

        return to_route('admin.rates.index')->with('success', 'Rate deleted successfully.');
    }

    /**
     * @return array{
     *   hotels: array<int, array{id:int,name:string,event_name:string}>,
     *   room_types: array<int, array{id:int,name:string}>,
     *   meal_plans: array<int, array{id:int,name:string}>
     * }
     */
    private function formOptions(): array
    {
        $hotels = Hotel::query()
            ->with('event')
            ->orderBy('name')
            ->get()
            ->map(fn (Hotel $hotel) => [
                'id' => $hotel->id,
                'name' => $hotel->name,
                'event_name' => $hotel->event->name,
            ])
            ->all();

        $roomTypes = RoomType::query()
            ->orderBy('name')
            ->get()
            ->map(fn (RoomType $roomType) => [
                'id' => $roomType->id,
                'name' => $roomType->name,
            ])
            ->all();

        $mealPlans = MealPlan::query()
            ->orderBy('name')
            ->get()
            ->map(fn (MealPlan $mealPlan) => [
                'id' => $mealPlan->id,
                'name' => $mealPlan->name,
            ])
            ->all();

        return [
            'hotels' => $hotels,
            'room_types' => $roomTypes,
            'meal_plans' => $mealPlans,
        ];
    }
}
