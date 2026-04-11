<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreHotelRequest;
use App\Http\Requests\Admin\UpdateHotelRequest;
use App\Models\Event;
use App\Models\Hotel;
use App\Support\MediaUrl;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class HotelController extends Controller
{
    public function index(): Response
    {
        $hotels = Hotel::query()
            ->with('event')
            ->latest()
            ->get()
            ->map(fn (Hotel $hotel) => [
                'id' => $hotel->id,
                'event_name' => $hotel->event->name,
                'name' => $hotel->name,
                'address' => $hotel->address,
                'supplier_name' => $hotel->supplier_name,
                'website_url' => $hotel->website_url,
                'gallery_images' => $this->galleryUrls($hotel->gallery_images),
                'is_active' => $hotel->is_active,
            ])
            ->values();

        return Inertia::render('Admin/Hotels/Index', [
            'hotels' => $hotels,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Hotels/Create', [
            'events' => $this->eventOptions(),
        ]);
    }

    public function store(StoreHotelRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $galleryPaths = $this->storeGalleryImages($request->file('gallery_images', []));
        $hotelPayload = $this->baseHotelPayload($validated);

        Hotel::query()->create([
            ...$hotelPayload,
            'gallery_images' => $galleryPaths,
        ]);

        return to_route('admin.hotels.index')->with('success', 'Hotel created successfully.');
    }

    public function edit(Hotel $hotel): Response
    {
        return Inertia::render('Admin/Hotels/Edit', [
            'events' => $this->eventOptions(),
            'hotel' => [
                'id' => $hotel->id,
                'event_id' => $hotel->event_id,
                'name' => $hotel->name,
                'description' => $hotel->description,
                'address' => $hotel->address,
                'latitude' => $hotel->latitude !== null ? (string) $hotel->latitude : '',
                'longitude' => $hotel->longitude !== null ? (string) $hotel->longitude : '',
                'supplier_name' => $hotel->supplier_name,
                'website_url' => $hotel->website_url,
                'gallery_images' => $this->galleryUrls($hotel->gallery_images),
                'is_active' => $hotel->is_active,
            ],
        ]);
    }

    public function update(UpdateHotelRequest $request, Hotel $hotel): RedirectResponse
    {
        $validated = $request->validated();
        $previousPaths = $this->sanitizeGalleryPaths($hotel->gallery_images ?? []);
        $currentPaths = $this->sanitizeGalleryPaths($validated['existing_gallery_images'] ?? []);
        $newPaths = $this->storeGalleryImages($request->file('gallery_images', []));
        $hotelPayload = $this->baseHotelPayload($validated);
        $removedPaths = array_values(array_diff($previousPaths, $currentPaths));

        $hotel->update([
            ...$hotelPayload,
            'gallery_images' => array_values(array_unique(array_merge($currentPaths, $newPaths))),
        ]);

        if ($removedPaths !== []) {
            Storage::disk('public')->delete($removedPaths);
        }

        return to_route('admin.hotels.index')->with('success', 'Hotel updated successfully.');
    }

    public function destroy(Hotel $hotel): RedirectResponse
    {
        if ($hotel->bookings()->exists()) {
            return to_route('admin.hotels.index')->with(
                'error',
                'Não é possível apagar este hotel porque existem reservas associadas.'
            );
        }

        $paths = $this->sanitizeGalleryPaths($hotel->gallery_images ?? []);

        try {
            $hotel->delete();
        } catch (QueryException) {
            return to_route('admin.hotels.index')->with(
                'error',
                'Não foi possível apagar este hotel porque existem registos dependentes.'
            );
        }

        if ($paths !== []) {
            Storage::disk('public')->delete($paths);
        }

        return to_route('admin.hotels.index')->with('success', 'Hotel deleted successfully.');
    }

    /**
     * @return array<int, array{id: int, name: string}>
     */
    private function eventOptions(): array
    {
        return Event::query()
            ->orderBy('name')
            ->get()
            ->map(fn (Event $event) => [
                'id' => $event->id,
                'name' => $event->name,
            ])
            ->all();
    }

    /**
     * @param array<int, UploadedFile>|UploadedFile|null $files
     * @return array<int, string>
     */
    private function storeGalleryImages(array|UploadedFile|null $files): array
    {
        if ($files === null) {
            return [];
        }

        $normalizedFiles = is_array($files) ? $files : [$files];

        return collect($normalizedFiles)
            ->filter(fn ($file) => $file instanceof UploadedFile)
            ->map(fn (UploadedFile $file) => $file->store('hotels', 'public'))
            ->filter(fn ($path) => is_string($path) && $path !== '')
            ->values()
            ->all();
    }

    /**
     * @param mixed $paths
     * @return array<int, string>
     */
    private function sanitizeGalleryPaths(mixed $paths): array
    {
        if (! is_array($paths)) {
            return [];
        }

        return collect($paths)
            ->filter(fn ($path) => is_string($path) && $path !== '')
            ->values()
            ->all();
    }

    /**
     * @param mixed $paths
     * @return array<int, array{path:string,url:string}>
     */
    private function galleryUrls(mixed $paths): array
    {
        return collect(is_array($paths) ? $paths : [])
            ->filter(fn ($path) => is_string($path) && $path !== '')
            ->map(function (string $path): ?array {
                $url = MediaUrl::fromStoragePath($path);
                if (! is_string($url) || $url === '') {
                    return null;
                }

                return [
                    'path' => $path,
                    'url' => $url,
                ];
            })
            ->filter(fn ($item) => is_array($item))
            ->values()
            ->all();
    }

    /**
     * @param array<string, mixed> $validated
     * @return array<string, mixed>
     */
    private function baseHotelPayload(array $validated): array
    {
        return [
            'event_id' => $validated['event_id'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'address' => $validated['address'],
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'supplier_name' => $validated['supplier_name'],
            'website_url' => $validated['website_url'] ?? null,
            'is_active' => (bool) $validated['is_active'],
        ];
    }
}
