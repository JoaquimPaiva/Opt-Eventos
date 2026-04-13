<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreEventLogoRequest;
use App\Http\Requests\Admin\UpdateEventLogoRequest;
use App\Models\EventLogo;
use App\Support\MediaUrl;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class EventLogoController extends Controller
{
    public function index(): Response
    {
        $logos = EventLogo::query()
            ->orderBy('display_order')
            ->orderBy('id')
            ->get()
            ->map(fn (EventLogo $logo) => [
                'id' => $logo->id,
                'name' => $logo->name,
                'image_path' => $logo->image_path,
                'image_url' => MediaUrl::fromStoragePath($logo->image_path),
                'display_order' => (int) $logo->display_order,
                'is_active' => (bool) $logo->is_active,
            ])
            ->values();

        return Inertia::render('Admin/EventLogos/Index', [
            'logos' => $logos,
        ]);
    }

    public function store(StoreEventLogoRequest $request): RedirectResponse
    {
        $data = $request->safe()->except(['image']);
        $data['image_path'] = $request->file('image')?->store('event-logos', 'public');
        $data['display_order'] = (int) ($data['display_order'] ?? 0);
        $data['is_active'] = (bool) ($data['is_active'] ?? true);

        EventLogo::query()->create($data);

        return to_route('admin.event-logos.index')->with('success', 'Logo adicionado com sucesso.');
    }

    public function update(UpdateEventLogoRequest $request, EventLogo $eventLogo): RedirectResponse
    {
        $data = $request->safe()->except(['image']);
        $newImage = $request->file('image');

        if ($newImage !== null) {
            if ($eventLogo->image_path) {
                Storage::disk('public')->delete($eventLogo->image_path);
            }

            $data['image_path'] = $newImage->store('event-logos', 'public');
        }

        $data['display_order'] = (int) ($data['display_order'] ?? 0);
        $data['is_active'] = (bool) ($data['is_active'] ?? false);

        $eventLogo->update($data);

        return to_route('admin.event-logos.index')->with('success', 'Logo atualizado com sucesso.');
    }

    public function destroy(EventLogo $eventLogo): RedirectResponse
    {
        if ($eventLogo->image_path) {
            Storage::disk('public')->delete($eventLogo->image_path);
        }

        $eventLogo->delete();

        return to_route('admin.event-logos.index')->with('success', 'Logo removido com sucesso.');
    }
}
