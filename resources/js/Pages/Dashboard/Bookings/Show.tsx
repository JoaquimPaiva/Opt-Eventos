import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';

interface BookingDetail {
    id: string;
    event_name: string;
    hotel_name: string;
    check_in: string;
    check_out: string;
    guests: number;
    nights: number;
    room_type: string;
    meal_plan: string;
    subtotal: number;
    fees_total: number;
    total_price: number;
    currency: string;
    booking_status: string;
    payment_status?: string | null;
    payment_due_date?: string | null;
    supplier_payment_status?: string | null;
    supplier_due_date?: string | null;
    can_cancel: boolean;
    can_delete: boolean;
    cancellation_policy?: string | null;
    cancellation_deadline?: string | null;
}

interface BookingShowProps {
    booking: BookingDetail;
}

export default function BookingShow({ booking }: BookingShowProps) {
    const pageErrors = usePage<PageProps & { errors?: Record<string, string> }>().props.errors ?? {};
    const { data, setData, post, processing, errors } = useForm({
        cancellation_reason: '',
    });
    const { delete: destroy, processing: deleting } = useForm({});

    const submitCancel = (event: FormEvent) => {
        event.preventDefault();
        post(route('dashboard.bookings.cancel', booking.id), {
            preserveScroll: true,
        });
    };

    const submitDelete = () => {
        if (!window.confirm('Queres mesmo apagar esta reserva? Esta ação é permanente.')) {
            return;
        }

        destroy(route('dashboard.bookings.destroy', booking.id), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-slate-800">Detalhe da Reserva</h2>}
        >
            <Head title={`Reserva ${booking.id}`} />

            <div className="bg-gradient-to-b from-slate-100 via-white to-slate-100 py-10">
                <div className="mx-auto max-w-5xl space-y-5 px-4 sm:px-6 lg:px-8">
                    <div>
                        <Link
                            href={route('dashboard.bookings.index')}
                            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                        >
                            Voltar às reservas
                        </Link>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Resumo</p>
                        <h3 className="text-lg font-semibold text-slate-900">{booking.hotel_name}</h3>
                        <p className="text-sm text-slate-500">{booking.event_name}</p>

                        <div className="mt-4 grid gap-4 text-sm text-slate-700 md:grid-cols-2">
                            <p>ID da reserva: {booking.id}</p>
                            <p>
                                Estadia: {booking.check_in} até {booking.check_out}
                            </p>
                            <p>Hóspedes: {booking.guests}</p>
                            <p>Noites: {booking.nights}</p>
                            <p>
                                Quarto / Regime: {booking.room_type} / {booking.meal_plan}
                            </p>
                            <p>Estado da reserva: {booking.booking_status}</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Valores</h4>
                        <div className="mt-3 space-y-1 text-sm text-slate-700">
                            <p>
                                Subtotal: {booking.subtotal.toFixed(2)} {booking.currency}
                            </p>
                            <p>
                                Taxas: {booking.fees_total.toFixed(2)} {booking.currency}
                            </p>
                            <p className="text-base font-semibold text-slate-900">
                                Total: {booking.total_price.toFixed(2)} {booking.currency}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Pagamentos</h4>
                        <div className="mt-3 space-y-1 text-sm text-slate-700">
                            <p>Estado do pagamento do cliente: {booking.payment_status ?? 'N/D'}</p>
                            <p>Vencimento do pagamento do cliente: {booking.payment_due_date ?? 'N/D'}</p>
                            <p>Estado do pagamento ao fornecedor: {booking.supplier_payment_status ?? 'N/D'}</p>
                            <p>Vencimento do pagamento ao fornecedor: {booking.supplier_due_date ?? 'N/D'}</p>
                        </div>
                        <div className="mt-4">
                            <Link
                                href={route('dashboard.bookings.payment', booking.id)}
                                className="inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
                            >
                                Abrir área de pagamento
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Cancelamento</h4>
                        <p className="mt-2 text-sm text-slate-600">
                            Política: {booking.cancellation_policy === 'FREE_CANCELLATION'
                                ? 'Cancelamento gratuito'
                                : booking.cancellation_policy === 'NON_REFUNDABLE'
                                    ? 'Tarifa não reembolsável'
                                    : booking.cancellation_policy === 'DEPOSIT_NON_REFUNDABLE'
                                        ? 'Sinal não reembolsável'
                                        : 'N/D'}
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                            Limite para cancelar: {booking.cancellation_deadline ?? 'N/D'}
                        </p>

                        {pageErrors.booking ? (
                            <p className="mt-2 text-sm font-medium text-rose-700">{pageErrors.booking}</p>
                        ) : null}

                        {booking.can_cancel ? (
                            <form onSubmit={submitCancel} className="mt-4 space-y-3">
                                <label htmlFor="cancellation_reason" className="block text-sm font-medium text-gray-700">
                                    Motivo (opcional)
                                </label>
                                <input
                                    id="cancellation_reason"
                                    type="text"
                                    value={data.cancellation_reason}
                                    onChange={(event) => setData('cancellation_reason', event.target.value)}
                                    className="w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                {errors.cancellation_reason ? (
                                    <p className="text-sm text-rose-700">{errors.cancellation_reason}</p>
                                ) : null}

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {processing ? 'A cancelar...' : 'Cancelar reserva'}
                                </button>
                            </form>
                        ) : (
                            <p className="mt-3 text-sm font-medium text-slate-700">
                                Esta reserva já não pode ser cancelada.
                            </p>
                        )}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Limpeza de dados</h4>
                        <p className="mt-2 text-sm text-slate-600">
                            Podes apagar reservas canceladas ou reservas cuja data de checkout já passou.
                        </p>

                        {pageErrors.booking_delete ? (
                            <p className="mt-3 text-sm font-medium text-rose-700">{pageErrors.booking_delete}</p>
                        ) : null}

                        {booking.can_delete ? (
                            <button
                                type="button"
                                onClick={submitDelete}
                                disabled={deleting}
                                className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {deleting ? 'A apagar...' : 'Apagar reserva'}
                            </button>
                        ) : (
                            <p className="mt-3 text-sm font-medium text-slate-700">
                                Esta reserva ainda não está elegível para ser apagada.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
