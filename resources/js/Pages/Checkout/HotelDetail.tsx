import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useMemo, useState } from 'react';

interface RateOption {
    id: number;
    room_type: string;
    meal_plan: string;
    price: number;
    currency: string;
    stock: number;
    max_guests: number;
}

interface HotelDetailProps {
    event: {
        id: number;
        name: string;
        booking_start: string | null;
        booking_end: string | null;
    };
    filters: {
        event_id: string;
        check_in: string;
        check_out: string;
    };
    hotel: {
        id: number;
        name: string;
        address: string;
        description: string | null;
        images: string[];
        website_url: string | null;
    };
    rates: RateOption[];
}

export default function CheckoutHotelDetail({ event, filters, hotel, rates }: HotelDetailProps) {
    const [rateId, setRateId] = useState<string>(rates[0] ? String(rates[0].id) : '');
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const selectedRate = useMemo(
        () => rates.find((rate) => String(rate.id) === rateId),
        [rateId, rates],
    );

    const submit = (eventSubmit: FormEvent) => {
        eventSubmit.preventDefault();
        if (!selectedRate) {
            return;
        }

        router.get(route('checkout.payment'), {
            ...filters,
            rate_id: selectedRate.id,
        });
    };

    const selectedImage = hotel.images[activeImageIndex] ?? null;

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Detalhes do Hotel</h2>}>
            <Head title="Detalhes do Hotel" />

            <div className="bg-gradient-to-b from-slate-100 via-white to-slate-100 py-10">
                <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <Link
                        href={route('checkout', filters)}
                        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                    >
                        Voltar à lista de hotéis
                    </Link>

                    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h1 className="text-2xl font-black text-slate-900">{hotel.name}</h1>
                            <p className="text-sm text-slate-600">
                                {event.name} | {filters.check_in} até {filters.check_out}
                            </p>
                            <p className="text-sm text-slate-600">{hotel.address}</p>
                            {hotel.description ? <p className="text-sm text-slate-700">{hotel.description}</p> : null}
                            {hotel.website_url ? (
                                <a
                                    href={hotel.website_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex text-sm font-medium text-indigo-700 underline"
                                >
                                    Visitar website do hotel
                                </a>
                            ) : null}

                            {selectedImage ? (
                                <img src={selectedImage} alt={hotel.name} className="h-64 w-full rounded-xl object-cover" />
                            ) : (
                                <div className="grid h-64 place-items-center rounded-xl bg-slate-100 text-sm text-slate-500">Sem imagem</div>
                            )}
                            {hotel.images.length > 1 ? (
                                <div className="grid grid-cols-5 gap-2">
                                    {hotel.images.map((image, index) => (
                                        <button
                                            key={`${image}-${index}`}
                                            type="button"
                                            onClick={() => setActiveImageIndex(index)}
                                            className={`overflow-hidden rounded-lg border ${
                                                index === activeImageIndex ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-200'
                                            }`}
                                        >
                                            <img src={image} alt={`${hotel.name} ${index + 1}`} className="h-12 w-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            ) : null}
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-slate-900">3. Escolhe quarto e refeição</h2>
                            <p className="mt-1 text-sm text-slate-600">
                                Esta seleção define o valor final no checkout.
                            </p>

                            <form onSubmit={submit} className="mt-5 space-y-4">
                                <div>
                                    <label htmlFor="rate_id" className="mb-1 block text-sm font-medium text-slate-700">
                                        Modalidade
                                    </label>
                                    <select
                                        id="rate_id"
                                        value={rateId}
                                        onChange={(eventOption) => setRateId(eventOption.target.value)}
                                        className="w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        {rates.map((rate) => (
                                            <option key={rate.id} value={rate.id}>
                                                {rate.room_type} | {rate.meal_plan} | {rate.price.toFixed(2)} {rate.currency}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedRate ? (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                                        <p>
                                            <span className="font-semibold text-slate-900">Preço/noite:</span> {selectedRate.price.toFixed(2)} {selectedRate.currency}
                                        </p>
                                        <p>
                                            <span className="font-semibold text-slate-900">Capacidade:</span> até {selectedRate.max_guests} hóspedes
                                        </p>
                                        <p>
                                            <span className="font-semibold text-slate-900">Stock:</span> {selectedRate.stock}
                                        </p>
                                    </div>
                                ) : null}

                                <button
                                    type="submit"
                                    disabled={!selectedRate}
                                    className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Continuar para checkout e pagamento
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
