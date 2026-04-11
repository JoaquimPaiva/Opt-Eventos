<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreEventRequest;
use App\Http\Requests\Admin\UpdateEventRequest;
use App\Models\Event;
use App\Support\MediaUrl;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
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
                'cover_image_url' => MediaUrl::fromStoragePath($event->cover_image),
                'location' => $event->location,
                'start_date' => $event->start_date?->toDateString(),
                'end_date' => $event->end_date?->toDateString(),
                'booking_start' => $event->booking_start?->toDateString(),
                'booking_end' => $event->booking_end?->toDateString(),
                'is_active' => $event->is_active,
                'is_featured' => $event->is_featured,
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
        $data = $request->safe()->except(['cover_image']);
        $data['slug'] = filled($data['slug'] ?? null) ? Str::slug((string) $data['slug']) : Str::slug((string) $data['name']);
        $data['cover_image'] = $request->file('cover_image')?->store('events', 'public');

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
                'cover_image_url' => MediaUrl::fromStoragePath($event->cover_image),
                'location' => $event->location,
                'latitude' => $event->latitude !== null ? (string) $event->latitude : '',
                'longitude' => $event->longitude !== null ? (string) $event->longitude : '',
                'start_date' => $event->start_date?->toDateString() ?? '',
                'end_date' => $event->end_date?->toDateString() ?? '',
                'booking_start' => $event->booking_start?->toDateString() ?? '',
                'booking_end' => $event->booking_end?->toDateString() ?? '',
                'is_active' => $event->is_active,
            ],
        ]);
    }

    public function update(UpdateEventRequest $request, Event $event): RedirectResponse
    {
        $data = $request->safe()->except(['cover_image', 'remove_cover_image']);
        $data['slug'] = filled($data['slug'] ?? null) ? Str::slug((string) $data['slug']) : Str::slug((string) $data['name']);

        $newCoverImage = $request->file('cover_image');
        $removeCoverImage = (bool) $request->boolean('remove_cover_image');
        if ($newCoverImage !== null) {
            if ($event->cover_image) {
                Storage::disk('public')->delete($event->cover_image);
            }
            $data['cover_image'] = $newCoverImage->store('events', 'public');
        } elseif ($removeCoverImage && $event->cover_image) {
            Storage::disk('public')->delete($event->cover_image);
            $data['cover_image'] = null;
        }

        $event->update($data);

        return to_route('admin.events.index')->with('success', 'Event updated successfully.');
    }

    public function destroy(Event $event): RedirectResponse
    {
        if ($event->bookings()->exists()) {
            return to_route('admin.events.index')->with(
                'error',
                'Não é possível apagar este evento porque existem reservas associadas.'
            );
        }

        $coverImagePath = $event->cover_image;

        try {
            $event->delete();
        } catch (QueryException) {
            return to_route('admin.events.index')->with(
                'error',
                'Não foi possível apagar este evento porque existem registos dependentes.'
            );
        }

        if ($coverImagePath) {
            Storage::disk('public')->delete($coverImagePath);
        }

        return to_route('admin.events.index')->with('success', 'Event deleted successfully.');
    }

    public function toggleFeatured(Event $event): RedirectResponse
    {
        $event->update([
            'is_featured' => ! $event->is_featured,
        ]);

        $message = $event->is_featured
            ? 'Evento adicionado aos destaques.'
            : 'Evento removido dos destaques.';

        return to_route('admin.events.index')->with('success', $message);
    }
}
