import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useMemo } from 'react';

interface HotelItem {
    id: number;
    name: string;
    address: string;
    description: string | null;
    image: string | null;
    available_rates: number;
    policies: string[];
    from_price: number;
    currency: string;
}

interface HotelsProps {
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
    hotels: HotelItem[];
}

const formatDate = (date: string | null): string => {
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
        return 'Não reembolsável';
    }

    return 'Sinal não reembolsável';
};

export default function CheckoutHotels({ event, filters, hotels }: HotelsProps) {
    const nights = useMemo(() => {
        const checkIn = new Date(filters.check_in);
        const checkOut = new Date(filters.check_out);

        if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
            return 0;
        }

        return Math.max(0, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
    }, [filters.check_in, filters.check_out]);

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Checkout</h2>}>
            <Head title="Hotéis Disponíveis" />

            <div className="bg-gradient-to-b from-slate-100 via-white to-slate-100 py-10">
                <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <Link
                            href={route('checkout.events', {
                                check_in: filters.check_in,
                                check_out: filters.check_out,
                            })}
                            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                        >
                            Voltar aos eventos
                        </Link>
                        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
                            Passo 2 de 4
                        </span>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h1 className="text-2xl font-black text-slate-900">Escolhe o hotel parceiro</h1>
                        <p className="mt-1 text-sm text-slate-600">
                            <strong>{event.name}</strong> em {event.location}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                            Evento: {formatDate(event.start_date)} até {formatDate(event.end_date)}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                            Estadia: {formatDate(filters.check_in)} até {formatDate(filters.check_out)} ({nights} {nights === 1 ? 'noite' : 'noites'})
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                            Janela de reserva do evento: {formatDate(event.booking_start)} até {formatDate(event.booking_end)}
                        </p>
                    </div>

                    {hotels.length === 0 ? (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
                            Não encontrámos hotéis disponíveis para esta seleção. Altera o evento ou as datas para veres novas opções.
                        </div>
                    ) : (
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {hotels.map((hotel) => (
                                <div key={hotel.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                    {hotel.image ? (
                                        <img src={hotel.image} alt={hotel.name} className="h-48 w-full object-cover" />
                                    ) : (
                                        <div className="grid h-48 place-items-center bg-slate-100 text-sm text-slate-500">Sem imagem</div>
                                    )}
                                    <div className="space-y-3 p-5">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900">{hotel.name}</h3>
                                            <p className="text-sm text-slate-600">{hotel.address}</p>
                                        </div>

                                        {hotel.description ? <p className="text-sm text-slate-600">{hotel.description}</p> : null}

                                        <p className="text-sm text-slate-700">
                                            Desde <strong>{hotel.from_price.toFixed(2)} {hotel.currency}</strong> por noite
                                        </p>

                                        <p className="text-xs uppercase tracking-wide text-slate-500">
                                            {hotel.available_rates} opções disponíveis para esta pesquisa
                                        </p>

                                        <div className="flex flex-wrap gap-2">
                                            {hotel.policies.map((policy) => (
                                                <span
                                                    key={`${hotel.id}-${policy}`}
                                                    className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                                                >
                                                    {policyLabel(policy)}
                                                </span>
                                            ))}
                                        </div>

                                        <Link
                                            href={route('checkout.hotels.show', { hotel: hotel.id, ...filters })}
                                            className="inline-flex w-full justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-black sm:w-auto"
                                        >
                                            Ver quartos e tarifas
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
