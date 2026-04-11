import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

interface EventItem {
    id: number;
    name: string;
    booking_start: string | null;
    booking_end: string | null;
    hotels_available: number;
    offers_available: number;
    from_price: number;
    currency: string;
    image: string | null;
}

interface EventsProps {
    filters: {
        check_in: string;
        check_out: string;
    };
    events: EventItem[];
}

export default function CheckoutEvents({ filters, events }: EventsProps) {
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Eventos Disponíveis</h2>}>
            <Head title="Eventos Disponíveis" />

            <div className="bg-gradient-to-b from-slate-100 via-white to-slate-100 py-10">
                <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <Link
                        href="/"
                        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                    >
                        Voltar e alterar datas
                    </Link>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h1 className="text-2xl font-black text-slate-900">Eventos disponíveis para as datas escolhidas</h1>
                        <p className="mt-1 text-sm text-slate-600">
                            {filters.check_in} até {filters.check_out}
                        </p>
                    </div>

                    {events.length === 0 ? (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
                            Não encontrámos eventos disponíveis para estas datas.
                        </div>
                    ) : (
                        <div className="grid gap-5 md:grid-cols-2">
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
                                            <p className="text-sm text-slate-600">
                                                Janela de reserva: {event.booking_start ?? 'Data a definir'} até {event.booking_end ?? 'Data a definir'}
                                            </p>
                                        </div>
                                        <p className="text-sm text-slate-700">
                                            Desde <strong>{event.from_price.toFixed(2)} {event.currency}</strong> por noite
                                        </p>
                                        <p className="text-xs uppercase tracking-wide text-slate-500">
                                            {event.hotels_available} hotéis • {event.offers_available} ofertas
                                        </p>
                                        <Link
                                            href={route('checkout', {
                                                event_id: event.id,
                                                check_in: filters.check_in,
                                                check_out: filters.check_out,
                                            })}
                                            className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
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
