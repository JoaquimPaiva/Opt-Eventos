<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Event;
use App\Models\Hotel;
use App\Models\MealPlan;
use App\Models\Payment;
use App\Models\Rate;
use App\Models\RoomType;
use App\Models\SupplierPayment;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::factory()->admin()->create([
            'name' => 'Admin User',
            'email' => 'admin@opteventos.test',
            'password' => Hash::make('password'),
        ]);

        $testClient = User::factory()->create([
            'name' => 'Test Client',
            'email' => 'client@opteventos.test',
            'password' => Hash::make('password'),
            'role' => 'CLIENT',
        ]);

        $clients = User::factory(8)->create();

        foreach ([
            ['name' => 'single', 'max_guests' => 1],
            ['name' => 'double', 'max_guests' => 2],
            ['name' => 'triple', 'max_guests' => 3],
            ['name' => 'quad', 'max_guests' => 4],
        ] as $roomTypeData) {
            RoomType::query()->firstOrCreate(['name' => $roomTypeData['name']], $roomTypeData);
        }

        foreach (['breakfast', 'half-board', 'all-inclusive'] as $mealPlanName) {
            MealPlan::query()->firstOrCreate(['name' => $mealPlanName]);
        }

        $roomTypes = RoomType::all();
        $mealPlans = MealPlan::all();

        $events = collect([
            [
                'name' => 'Lisbon Summer Music Week',
                'slug' => 'lisbon-summer-music-week',
                'description' => 'Major music event in Lisbon with partner hotel deals.',
                'cover_image' => $this->eventCoverImage('lisbon-summer-music-week'),
                'location' => 'Lisbon, Portugal',
                'latitude' => 38.7223,
                'longitude' => -9.1393,
                'start_date' => Carbon::parse('2026-07-10'),
                'end_date' => Carbon::parse('2026-07-14'),
                'booking_start' => Carbon::parse('2026-03-01'),
                'booking_end' => Carbon::parse('2026-07-05'),
                'is_active' => true,
            ],
            [
                'name' => 'Barcelona Tech Expo',
                'slug' => 'barcelona-tech-expo',
                'description' => 'Annual technology and innovation expo.',
                'cover_image' => $this->eventCoverImage('barcelona-tech-expo'),
                'location' => 'Barcelona, Spain',
                'latitude' => 41.3874,
                'longitude' => 2.1686,
                'start_date' => Carbon::parse('2026-09-20'),
                'end_date' => Carbon::parse('2026-09-24'),
                'booking_start' => Carbon::parse('2026-05-01'),
                'booking_end' => Carbon::parse('2026-09-15'),
                'is_active' => true,
            ],
            [
                'name' => 'Milan Design Fair',
                'slug' => 'milan-design-fair',
                'description' => 'Design fair with curated accommodation packages.',
                'cover_image' => $this->eventCoverImage('milan-design-fair'),
                'location' => 'Milan, Italy',
                'latitude' => 45.4642,
                'longitude' => 9.1900,
                'start_date' => Carbon::parse('2026-11-05'),
                'end_date' => Carbon::parse('2026-11-09'),
                'booking_start' => Carbon::parse('2026-06-01'),
                'booking_end' => Carbon::parse('2026-11-01'),
                'is_active' => true,
            ],
        ])->map(fn (array $eventData) => Event::query()->create($eventData));

        foreach ($events as $event) {
            $hotels = Hotel::factory(3)->create([
                'event_id' => $event->id,
                'latitude' => $event->latitude + fake()->randomFloat(4, -0.08, 0.08),
                'longitude' => $event->longitude + fake()->randomFloat(4, -0.08, 0.08),
            ]);

            foreach ($hotels as $hotel) {
                $hotel->update([
                    'gallery_images' => $this->hotelGalleryImages($event->slug, $hotel->name),
                ]);

                foreach ($roomTypes as $roomType) {
                    foreach ($mealPlans as $mealPlan) {
                        $cost = fake()->numberBetween(60, 180);
                        $margin = fake()->numberBetween(25, 90);

                        Rate::query()->create([
                            'hotel_id' => $hotel->id,
                            'room_type_id' => $roomType->id,
                            'meal_plan_id' => $mealPlan->id,
                            'cost_price' => $cost,
                            'sale_price' => $cost + $margin,
                            'currency' => 'EUR',
                            'stock' => fake()->numberBetween(8, 30),
                            'cancellation_deadline' => $event->start_date->copy()->subDays(7),
                            'is_active' => true,
                        ]);
                    }
                }
            }
        }

        $usersForBookings = $clients->prepend($admin)->push($testClient);

        foreach (range(1, 16) as $index) {
            $event = $events->random();
            $rate = Rate::query()
                ->whereHas('hotel', fn ($query) => $query->where('event_id', $event->id))
                ->inRandomOrder()
                ->first();

            $nights = fake()->numberBetween(2, 5);
            $checkIn = $event->start_date->copy()->subDays(fake()->numberBetween(1, 3));
            $checkOut = $checkIn->copy()->addDays($nights);
            $subtotal = (float) $rate->sale_price * $nights;
            $fees = fake()->randomFloat(2, 0, 25);
            $status = fake()->randomElement(['PENDING', 'CONFIRMED', 'CONFIRMED', 'CANCELLED']);

            $booking = Booking::query()->create([
                'id' => (string) Str::uuid(),
                'user_id' => $usersForBookings->random()->id,
                'event_id' => $event->id,
                'hotel_id' => $rate->hotel_id,
                'rate_id' => $rate->id,
                'check_in' => $checkIn,
                'check_out' => $checkOut,
                'guests' => fake()->numberBetween(1, 4),
                'nights' => $nights,
                'subtotal' => $subtotal,
                'fees_total' => $fees,
                'total_price' => $subtotal + $fees,
                'status' => $status,
                'cancellation_reason' => $status === 'CANCELLED' ? 'Customer requested cancellation.' : null,
                'cancelled_at' => $status === 'CANCELLED' ? now()->subDays(fake()->numberBetween(1, 20)) : null,
            ]);

            $isPaid = $status === 'CONFIRMED' && fake()->boolean(70);

            Payment::query()->create([
                'booking_id' => $booking->id,
                'provider' => 'STRIPE_MOCK',
                'amount' => $booking->total_price,
                'currency' => 'EUR',
                'status' => $isPaid ? 'PAID' : 'PENDING',
                'due_date' => now()->addDays(3),
                'paid_at' => $isPaid ? now()->subDays(fake()->numberBetween(0, 10)) : null,
                'provider_reference' => 'mock_'.Str::upper(Str::random(10)),
            ]);

            SupplierPayment::query()->create([
                'booking_id' => $booking->id,
                'amount' => (float) $rate->cost_price * $nights,
                'currency' => 'EUR',
                'due_date' => now()->addDays(15),
                'status' => $status === 'CONFIRMED' ? fake()->randomElement(['PENDING', 'PAID']) : 'PENDING',
                'paid_at' => null,
            ]);
        }
    }

    private function eventCoverImage(string $eventSlug): string
    {
        return sprintf(
            'https://picsum.photos/seed/%s/1600/900',
            rawurlencode('opteventos-event-'.$eventSlug)
        );
    }

    /**
     * @return array<int, string>
     */
    private function hotelGalleryImages(string $eventSlug, string $hotelName): array
    {
        $hotelSeed = Str::slug($hotelName).'-'.substr(md5($hotelName), 0, 8);

        return collect(range(1, 5))
            ->map(fn (int $index) => sprintf(
                'https://picsum.photos/seed/%s/1600/900',
                rawurlencode("opteventos-hotel-{$eventSlug}-{$hotelSeed}-{$index}")
            ))
            ->values()
            ->all();
    }
}
