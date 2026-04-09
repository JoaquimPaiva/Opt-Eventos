import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';

interface BookingListItem {
    id: string;
    event_name: string;
    hotel_name: string;
    check_in: string;
    check_out: string;
    room_type: string;
    meal_plan: string;
    total_price: number;
    currency: string;
    booking_status: string;
    payment_status?: string | null;
    can_delete: boolean;
}

interface BookingsIndexProps {
    bookings: BookingListItem[];
}

function badgeClass(status?: string | null): string {
    return status === 'PAID' || status === 'CONFIRMED'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : status === 'CANCELLED' || status === 'FAILED'
            ? 'border-rose-200 bg-rose-50 text-rose-700'
            : status === 'REFUNDED'
                ? 'border-amber-200 bg-amber-50 text-amber-700'
                : 'border-slate-200 bg-slate-100 text-slate-700';
}

export default function BookingsIndex({ bookings }: BookingsIndexProps) {
    const pageErrors = usePage<PageProps & { errors?: Record<string, string> }>().props.errors ?? {};

    const deleteBooking = (booking: BookingListItem) => {
        if (!window.confirm('Queres mesmo apagar esta reserva? Esta ação é permanente.')) {
            return;
        }

        router.delete(route('dashboard.bookings.destroy', booking.id), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-slate-800">As Minhas Reservas</h2>}
        >
            <Head title="As Minhas Reservas" />

            <div className="bg-gradient-to-b from-slate-100 via-white to-slate-100 py-10">
                <div className="mx-auto max-w-6xl space-y-4 px-4 sm:px-6 lg:px-8">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Histórico</p>
                        <h1 className="mt-1 text-2xl font-black text-slate-900">Acompanha cada reserva com clareza</h1>
                        <p className="mt-1 text-sm text-slate-600">
                            Vê o estado da reserva, pagamento e ações disponíveis sem perder contexto.
                        </p>
                    </div>

                    {pageErrors.booking_delete ? (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                            {pageErrors.booking_delete}
                        </div>
                    ) : null}

                    {bookings.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm">
                            Ainda não tens reservas.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                >
                                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="text-sm text-slate-600">ID da reserva: {booking.id}</p>
                                            <p className="text-sm text-slate-500">{booking.event_name}</p>
                                            <h3 className="text-lg font-semibold text-slate-900">{booking.hotel_name}</h3>
                                            <p className="text-sm text-slate-600">
                                                {booking.room_type} / {booking.meal_plan}
                                            </p>
                                            <p className="text-sm text-slate-600">
                                                {booking.check_in} até {booking.check_out}
                                            </p>
                                        </div>

                                        <div className="text-left md:text-right">
                                            <p className="text-lg font-semibold text-slate-900">
                                                {booking.total_price.toFixed(2)} {booking.currency}
                                            </p>
                                            <div className="mt-2 flex flex-wrap justify-start gap-2 md:justify-end">
                                                <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase ${badgeClass(booking.booking_status)}`}>
                                                    Reserva: {booking.booking_status}
                                                </span>
                                                <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase ${badgeClass(booking.payment_status ?? 'N/D')}`}>
                                                    Pagamento: {booking.payment_status ?? 'N/D'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <Link
                                            href={route('dashboard.bookings.show', booking.id)}
                                            className="inline-flex rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                                        >
                                            Ver detalhes
                                        </Link>
                                        {booking.can_delete ? (
                                            <button
                                                type="button"
                                                onClick={() => deleteBooking(booking)}
                                                className="inline-flex rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-50"
                                            >
                                                Apagar reserva
                                            </button>
                                        ) : null}
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
