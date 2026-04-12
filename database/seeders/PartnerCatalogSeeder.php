<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\Hotel;
use App\Models\MealPlan;
use App\Models\Rate;
use App\Models\RoomType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class PartnerCatalogSeeder extends Seeder
{
    /**
     * Seed 6 events, 12 hotels and full rate combinations.
     */
    public function run(): void
    {
        $roomTypes = collect([
            ['name' => 'single', 'max_guests' => 1],
            ['name' => 'double', 'max_guests' => 2],
            ['name' => 'triple', 'max_guests' => 3],
            ['name' => 'quad', 'max_guests' => 4],
        ])->map(fn (array $roomType) => RoomType::query()->firstOrCreate(
            ['name' => $roomType['name']],
            ['max_guests' => $roomType['max_guests']]
        ));

        $mealPlans = collect(['breakfast', 'half-board', 'all-inclusive'])
            ->map(fn (string $name) => MealPlan::query()->firstOrCreate(['name' => $name]));

        $eventsData = [
            [
                'name' => 'Lisbon Business Summit 2026',
                'slug' => 'lisbon-business-summit-2026',
                'description' => 'Conferência internacional focada em negócios e inovação.',
                'location' => 'Lisboa, Portugal',
                'latitude' => 38.7223,
                'longitude' => -9.1393,
                'start_date' => '2026-06-18',
                'end_date' => '2026-06-21',
                'booking_start' => '2026-02-15',
                'booking_end' => '2026-06-14',
                'is_active' => true,
            ],
            [
                'name' => 'Porto Wine & Culture Week',
                'slug' => 'porto-wine-culture-week-2026',
                'description' => 'Experiência cultural com provas, gastronomia e programação urbana.',
                'location' => 'Porto, Portugal',
                'latitude' => 41.1579,
                'longitude' => -8.6291,
                'start_date' => '2026-07-03',
                'end_date' => '2026-07-07',
                'booking_start' => '2026-03-01',
                'booking_end' => '2026-06-28',
                'is_active' => true,
            ],
            [
                'name' => 'Algarve Sports Festival',
                'slug' => 'algarve-sports-festival-2026',
                'description' => 'Festival desportivo com várias modalidades e atividades de praia.',
                'location' => 'Faro, Portugal',
                'latitude' => 37.0194,
                'longitude' => -7.9304,
                'start_date' => '2026-08-12',
                'end_date' => '2026-08-16',
                'booking_start' => '2026-04-01',
                'booking_end' => '2026-08-08',
                'is_active' => true,
            ],
            [
                'name' => 'Madrid Creative Expo',
                'slug' => 'madrid-creative-expo-2026',
                'description' => 'Evento criativo com foco em design, media e experiências digitais.',
                'location' => 'Madrid, Espanha',
                'latitude' => 40.4168,
                'longitude' => -3.7038,
                'start_date' => '2026-09-10',
                'end_date' => '2026-09-13',
                'booking_start' => '2026-05-01',
                'booking_end' => '2026-09-06',
                'is_active' => true,
            ],
            [
                'name' => 'Barcelona Tech Connect',
                'slug' => 'barcelona-tech-connect-2026',
                'description' => 'Encontro de tecnologia com networking empresarial e startups.',
                'location' => 'Barcelona, Espanha',
                'latitude' => 41.3874,
                'longitude' => 2.1686,
                'start_date' => '2026-10-15',
                'end_date' => '2026-10-19',
                'booking_start' => '2026-06-01',
                'booking_end' => '2026-10-10',
                'is_active' => true,
            ],
            [
                'name' => 'Milan Design Forum',
                'slug' => 'milan-design-forum-2026',
                'description' => 'Fórum internacional de design com exposições e talks premium.',
                'location' => 'Milão, Itália',
                'latitude' => 45.4642,
                'longitude' => 9.1900,
                'start_date' => '2026-11-05',
                'end_date' => '2026-11-09',
                'booking_start' => '2026-06-15',
                'booking_end' => '2026-11-02',
                'is_active' => true,
            ],
        ];

        $hotelCatalog = [
            ['Hotel Tejo Riverside', 'Avenida Ribeirinha 18, Lisboa'],
            ['Hotel Alfama Palace', 'Rua da Sé 40, Lisboa'],
            ['Hotel Douro Prime', 'Rua do Infante 121, Porto'],
            ['Hotel Aliados Premium', 'Praça dos Aliados 54, Porto'],
            ['Hotel Marina Sul', 'Avenida da Marina 99, Faro'],
            ['Hotel Ria Blue Resort', 'Rua das Salinas 12, Faro'],
            ['Hotel Castellana Select', 'Paseo de la Castellana 200, Madrid'],
            ['Hotel Retiro Grand', 'Calle de Alcalá 145, Madrid'],
            ['Hotel Gaudi Urban', 'Gran Via de les Corts 410, Barcelona'],
            ['Hotel Montjuic View', 'Avinguda del Paral·lel 88, Barcelona'],
            ['Hotel Navigli Elite', 'Via Torino 21, Milão'],
            ['Hotel Duomo Collection', 'Corso Vittorio Emanuele II 10, Milão'],
        ];

        $policies = [
            Rate::CANCELLATION_POLICY_FREE,
            Rate::CANCELLATION_POLICY_NON_REFUNDABLE,
            Rate::CANCELLATION_POLICY_DEPOSIT_NON_REFUNDABLE,
        ];

        foreach ($eventsData as $eventIndex => $eventData) {
            $event = Event::query()->updateOrCreate(
                ['slug' => $eventData['slug']],
                [
                    ...$eventData,
                    'start_date' => Carbon::parse($eventData['start_date'])->toDateString(),
                    'end_date' => Carbon::parse($eventData['end_date'])->toDateString(),
                    'booking_start' => Carbon::parse($eventData['booking_start'])->toDateString(),
                    'booking_end' => Carbon::parse($eventData['booking_end'])->toDateString(),
                ]
            );

            $hotelStart = $eventIndex * 2;
            $eventHotels = array_slice($hotelCatalog, $hotelStart, 2);

            foreach ($eventHotels as $hotelOffset => [$hotelName, $hotelAddress]) {
                $hotel = Hotel::query()->updateOrCreate(
                    [
                        'event_id' => $event->id,
                        'name' => $hotelName,
                    ],
                    [
                        'description' => 'Hotel parceiro oficial com disponibilidade dedicada ao evento.',
                        'address' => $hotelAddress,
                        'latitude' => (float) $event->latitude + (($hotelOffset + 1) * 0.0045),
                        'longitude' => (float) $event->longitude - (($hotelOffset + 1) * 0.0035),
                        'supplier_name' => 'OptEventos Partner Network',
                        'website_url' => 'https://opteventos.pt',
                        'is_active' => true,
                    ]
                );

                $expectedRateKeys = [];

                foreach ($roomTypes as $roomIndex => $roomType) {
                    foreach ($mealPlans as $mealIndex => $mealPlan) {
                        $costPrice = 55 + ($eventIndex * 8) + ($hotelOffset * 6) + ($roomIndex * 12) + ($mealIndex * 10);
                        $salePrice = $costPrice + 40 + ($roomIndex * 7) + ($mealIndex * 8);

                        foreach ($policies as $policy) {
                            $depositAmount = null;
                            $balanceDueDays = null;
                            $cancellationDeadline = Carbon::parse($event->start_date)->subDays(7)->startOfDay();

                            if ($policy === Rate::CANCELLATION_POLICY_NON_REFUNDABLE) {
                                $cancellationDeadline = Carbon::parse($event->booking_start)->subDay()->endOfDay();
                            }

                            if ($policy === Rate::CANCELLATION_POLICY_DEPOSIT_NON_REFUNDABLE) {
                                $fixedDepositByRoom = [65, 90, 120, 150];
                                $depositAmount = min(
                                    $fixedDepositByRoom[$roomIndex] + ($mealIndex * 10),
                                    $salePrice - 10
                                );
                                $balanceDueDays = 21 + ($mealIndex * 7);
                            }

                            Rate::query()->updateOrCreate(
                                [
                                    'hotel_id' => $hotel->id,
                                    'room_type_id' => $roomType->id,
                                    'meal_plan_id' => $mealPlan->id,
                                    'cancellation_policy' => $policy,
                                ],
                                [
                                    'cost_price' => $costPrice,
                                    'sale_price' => $salePrice,
                                    'currency' => 'EUR',
                                    'stock' => 8 + ($roomIndex * 3) + $mealIndex,
                                    'deposit_amount' => $depositAmount,
                                    'balance_due_days_before_checkin' => $balanceDueDays,
                                    'cancellation_deadline' => $cancellationDeadline,
                                    'is_active' => true,
                                ]
                            );

                            $expectedRateKeys[] = $roomType->id.'|'.$mealPlan->id.'|'.$policy;
                        }
                    }
                }

                $hotel->rates()
                    ->get()
                    ->filter(
                        fn (Rate $rate) => ! in_array(
                            $rate->room_type_id.'|'.$rate->meal_plan_id.'|'.$rate->cancellation_policy,
                            $expectedRateKeys,
                            true
                        )
                    )
                    ->each
                    ->delete();
            }
        }
    }
}
