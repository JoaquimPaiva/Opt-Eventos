<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\Hotel;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class EnsureMediaSeeder extends Seeder
{
    public function run(): void
    {
        Event::query()
            ->orderBy('id')
            ->get()
            ->each(function (Event $event): void {
                if (! is_string($event->cover_image) || trim($event->cover_image) === '') {
                    $event->update([
                        'cover_image' => $this->eventCoverImage($event),
                    ]);
                }
            });

        Hotel::query()
            ->with('event:id,slug')
            ->orderBy('id')
            ->get()
            ->each(function (Hotel $hotel): void {
                $existing = collect($hotel->gallery_images ?? [])
                    ->filter(fn ($value) => is_string($value) && trim($value) !== '')
                    ->values()
                    ->all();

                if (count($existing) >= 5) {
                    return;
                }

                $slug = (string) ($hotel->event?->slug ?: 'event-'.$hotel->event_id);
                $images = $existing;

                foreach (range(1, 12) as $index) {
                    if (count($images) >= 5) {
                        break;
                    }

                    $candidate = $this->hotelImage($slug, $hotel->name, $index);
                    if (! in_array($candidate, $images, true)) {
                        $images[] = $candidate;
                    }
                }

                $hotel->update([
                    'gallery_images' => array_values($images),
                ]);
            });
    }

    private function eventCoverImage(Event $event): string
    {
        $slug = trim((string) $event->slug) !== '' ? $event->slug : 'event-'.$event->id;

        return sprintf(
            'https://picsum.photos/seed/%s/1600/900',
            rawurlencode('opteventos-event-'.$slug)
        );
    }

    private function hotelImage(string $eventSlug, string $hotelName, int $index): string
    {
        $hotelSeed = Str::slug($hotelName).'-'.substr(md5($hotelName), 0, 8);

        return sprintf(
            'https://picsum.photos/seed/%s/1600/900',
            rawurlencode("opteventos-hotel-{$eventSlug}-{$hotelSeed}-{$index}")
        );
    }
}
