import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useMemo } from 'react';

interface EventItem {
    id: number;
    name: string;
    location: string;
    start_date: string | null;
    end_date: string | null;
    booking_start: string | null;
    booking_end: string | null;
    hotels_available: number;
    offers_available: number;
    from_price: number;
    currency: string;
    policies: string[];
    image: string | null;
}

interface EventsProps {
    filters: {
        check_in: string;
        check_out: string;
    };
    events: EventItem[];
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

export default function CheckoutEvents({ filters, events }: EventsProps) {
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
            <Head title="Eventos Disponíveis" />

            <div className="bg-gradient-to-b from-slate-100 via-white to-slate-100 py-10">
                <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <Link
                            href="/"
                            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                        >
                            Voltar e alterar datas
                        </Link>
                        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
                            Passo 1 de 4
                        </span>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h1 className="text-2xl font-black text-slate-900">Escolhe o evento da tua reserva</h1>
                        <p className="mt-1 text-sm text-slate-600">
                            Estadia de <strong>{formatDate(filters.check_in)}</strong> até <strong>{formatDate(filters.check_out)}</strong>
                            {' '}({nights} {nights === 1 ? 'noite' : 'noites'}).
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                            Mostramos apenas eventos com hotéis parceiros e tarifas válidas para estas datas.
                        </p>
                    </div>

                    {events.length === 0 ? (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
                            Não encontrámos eventos disponíveis para estas datas. Experimenta outras datas para veres novas opções.
                        </div>
                    ) : (
                        <div className="grid gap-5 md:grid-cols-3">
                            {events.map((event) => (
                                <div key={event.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                    {event.image ? (
                                        <img src={event.image} alt={event.name} className="h-48 w-full object-cover" />
                                    ) : (
                                        <div className="grid h-48 place-items-center bg-slate-100 text-sm text-slate-500">Sem imagem</div>
                                    )}
                                    <div className="space-y-3 p-5">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900">{event.name}</h3>
                                            <p className="text-sm text-slate-600">{event.location}</p>
                                            <p className="text-sm text-slate-600">
                                                Evento: {formatDate(event.start_date)} até {formatDate(event.end_date)}
                                            </p>
                                            <p className="text-sm text-slate-600">
                                                Reservas: {formatDate(event.booking_start)} até {formatDate(event.booking_end)}
                                            </p>
                                        </div>

                                        <p className="text-sm text-slate-700">
                                            Desde <strong>{event.from_price.toFixed(2)} {event.currency}</strong> por noite
                                        </p>

                                        <p className="text-xs uppercase tracking-wide text-slate-500">
                                            {event.hotels_available} hotéis parceiros • {event.offers_available} tarifas
                                        </p>

                                        <div className="flex flex-wrap gap-2">
                                            {event.policies.map((policy) => (
                                                <span
                                                    key={`${event.id}-${policy}`}
                                                    className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                                                >
                                                    {policyLabel(policy)}
                                                </span>
                                            ))}
                                        </div>

                                        <Link
                                            href={route('checkout', {
                                                event_id: event.id,
                                                check_in: filters.check_in,
                                                check_out: filters.check_out,
                                            })}
                                            className="inline-flex w-full justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-black sm:w-auto"
                                        >
                                            Ver hotéis deste evento
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
