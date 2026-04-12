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
    cancellation_policy: string;
    deposit_amount?: number | null;
    balance_due_days_before_checkin?: number | null;
    cancellation_deadline?: string | null;
}

interface HotelDetailProps {
    event: {
        id: number;
        name: string;
        location: string;
        start_date: string | null;
        end_date: string | null;
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

const formatDate = (date: string | null | undefined): string => {
    if (!date) {
        return 'Data a definir';
    }

    return new Date(date).toLocaleDateString('pt-PT');
};

const policyLabel = (policy: string): string => {
    if (policy === 'FREE_CANCELLATION') {
        return 'Cancelamento gratuito';
    }

    if (policy === 'NON_REFUNDABLE') {
        return 'Tarifa não reembolsável';
    }

    return 'Sinal não reembolsável';
};

export default function CheckoutHotelDetail({ event, filters, hotel, rates }: HotelDetailProps) {
    const [rateId, setRateId] = useState<string>(rates[0] ? String(rates[0].id) : '');
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const selectedRate = useMemo(
        () => rates.find((rate) => String(rate.id) === rateId),
        [rateId, rates],
    );

    const nights = useMemo(() => {
        const checkIn = new Date(filters.check_in);
        const checkOut = new Date(filters.check_out);

        if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
            return 0;
        }

        return Math.max(0, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
    }, [filters.check_in, filters.check_out]);

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
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Checkout</h2>}>
            <Head title="Detalhes do Hotel" />

            <div className="bg-gradient-to-b from-slate-100 via-white to-slate-100 py-10">
                <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <Link
                            href={route('checkout', filters)}
                            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                        >
                            Voltar à lista de hotéis
                        </Link>
                        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
                            Passo 3 de 4
                        </span>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h1 className="text-2xl font-black text-slate-900">{hotel.name}</h1>
                            <p className="text-sm text-slate-600">{event.name} • {event.location}</p>
                            <p className="text-sm text-slate-600">{hotel.address}</p>
                            <p className="text-sm text-slate-600">
                                Evento: {formatDate(event.start_date)} até {formatDate(event.end_date)}
                            </p>
                            <p className="text-sm text-slate-600">
                                Estadia selecionada: {formatDate(filters.check_in)} até {formatDate(filters.check_out)} ({nights} {nights === 1 ? 'noite' : 'noites'})
                            </p>
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
                                <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                                    {hotel.images.map((image, index) => (
                                        <button
                                            key={`${image}-${index}`}
                                            type="button"
                                            onClick={() => setActiveImageIndex(index)}
                                            className={`overflow-hidden rounded-lg border ${
                                                index === activeImageIndex ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-200'
                                            }`}
                                        >
                                            <img src={image} alt={`${hotel.name} ${index + 1}`} className="h-10 w-full object-cover sm:h-12" />
                                        </button>
                                    ))}
                                </div>
                            ) : null}
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-slate-900">Escolhe tarifa, quarto e refeição</h2>
                            <p className="mt-1 text-sm text-slate-600">
                                Esta escolha define as condições de cancelamento e o modelo de pagamento da reserva.
                            </p>

                            <form onSubmit={submit} className="mt-5 space-y-4">
                                <div>
                                    <label htmlFor="rate_id" className="mb-1 block text-sm font-medium text-slate-700">
                                        Tarifa disponível
                                    </label>
                                    <select
                                        id="rate_id"
                                        value={rateId}
                                        onChange={(eventOption) => setRateId(eventOption.target.value)}
                                        className="w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        {rates.map((rate) => (
                                            <option key={rate.id} value={rate.id}>
                                                {rate.room_type} | {rate.meal_plan} | {policyLabel(rate.cancellation_policy)} | {rate.price.toFixed(2)} {rate.currency}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedRate ? (
                                    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                                        <p>
                                            <span className="font-semibold text-slate-900">Preço/noite:</span> {selectedRate.price.toFixed(2)} {selectedRate.currency}
                                        </p>
                                        <p>
                                            <span className="font-semibold text-slate-900">Total estimado:</span> {(selectedRate.price * nights).toFixed(2)} {selectedRate.currency}
                                        </p>
                                        <p>
                                            <span className="font-semibold text-slate-900">Capacidade:</span> até {selectedRate.max_guests} hóspedes
                                        </p>
                                        <p>
                                            <span className="font-semibold text-slate-900">Stock:</span> {selectedRate.stock}
                                        </p>
                                        <p>
                                            <span className="font-semibold text-slate-900">Política:</span> {policyLabel(selectedRate.cancellation_policy)}
                                        </p>
                                        {selectedRate.cancellation_policy === 'FREE_CANCELLATION' ? (
                                            <p>
                                                <span className="font-semibold text-slate-900">Cancelamento grátis até:</span>{' '}
                                                {formatDate(selectedRate.cancellation_deadline)}
                                            </p>
                                        ) : null}
                                        {selectedRate.cancellation_policy === 'DEPOSIT_NON_REFUNDABLE' ? (
                                            <p>
                                                <span className="font-semibold text-slate-900">Pagamento:</span>{' '}
                                                sinal de {Number(selectedRate.deposit_amount ?? 0).toFixed(2)} {selectedRate.currency}
                                                {' '}agora + restante {selectedRate.balance_due_days_before_checkin ?? 0} dias antes do check-in
                                            </p>
                                        ) : null}
                                    </div>
                                ) : null}

                                <button
                                    type="submit"
                                    disabled={!selectedRate}
                                    className="w-full rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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
