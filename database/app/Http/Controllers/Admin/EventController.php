<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreEventRequest;
use App\Http\Requests\Admin\UpdateEventRequest;
use App\Models\Event;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(): Response
    {
        $events = Event::query()
            ->latest()
            ->get()
            ->map(fn (Event $event) => [
                'id' => $event->id,
                'name' => $event->name,
                'slug' => $event->slug,
                'location' => $event->location,
                'start_date' => $event->start_date->toDateString(),
                'end_date' => $event->end_date->toDateString(),
                'booking_start' => $event->booking_start->toDateString(),
                'booking_end' => $event->booking_end->toDateString(),
                'is_active' => $event->is_active,
            ])
            ->values();

        return Inertia::render('Admin/Events/Index', [
            'events' => $events,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Events/Create');
    }

    public function store(StoreEventRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['slug'] = filled($data['slug'] ?? null) ? Str::slug((string) $data['slug']) : Str::slug((string) $data['name']);

        Event::query()->create($data);

        return to_route('admin.events.index')->with('success', 'Event created successfully.');
    }

    public function edit(Event $event): Response
    {
        return Inertia::render('Admin/Events/Edit', [
            'event' => [
                'id' => $event->id,
                'name' => $event->name,
                'slug' => $event->slug,
                'description' => $event->description,
                'location' => $event->location,
                'latitude' => $event->latitude !== null ? (string) $event->latitude : '',
                'longitude' => $event->longitude !== null ? (string) $event->longitude : '',
                'start_date' => $event->start_date->toDateString(),
                'end_date' => $event->end_date->toDateString(),
                'booking_start' => $event->booking_start->toDateString(),
                'booking_end' => $event->booking_end->toDateString(),
                'is_active' => $event->is_active,
            ],
        ]);
    }

    public function update(UpdateEventRequest $request, Event $event): RedirectResponse
    {
        $data = $request->validated();
        $data['slug'] = filled($data['slug'] ?? null) ? Str::slug((string) $data['slug']) : Str::slug((string) $data['name']);

        $event->update($data);

        return to_route('admin.events.index')->with('success', 'Event updated successfully.');
    }

    public function destroy(Event $event): RedirectResponse
    {
        $event->delete();

        return to_route('admin.events.index')->with('success', 'Event deleted successfully.');
    }
}
