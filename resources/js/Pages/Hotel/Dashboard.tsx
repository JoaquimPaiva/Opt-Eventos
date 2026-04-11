import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

interface HotelData {
    id: number;
    name: string;
    supplier_name: string;
    address: string;
}

interface HotelMetrics {
    bookings_total: number;
    bookings_pending: number;
    bookings_confirmed: number;
    bookings_cancelled: number;
    average_nights: number;
    supplier_received_paid: number;
    supplier_pending_to_receive: number;
    supplier_overdue_to_receive: number;
    currency: string;
}

interface NextCheckInItem {
    id: string;
    customer_name: string;
    event_name: string;
    check_in: string;
    check_out: string;
    nights: number;
    booking_status: string;
    customer_payment_status: string;
    supplier_amount: number;
    currency: string;
    supplier_payment_status: string;
    supplier_due_date?: string | null;
}

interface HotelDashboardProps {
    hotel: HotelData;
    metrics: HotelMetrics;
    next_checkins: NextCheckInItem[];
}

const formatMoney = (value: number, currency: string): string =>
    `${value.toFixed(2)} ${currency}`;

export default function HotelDashboard({ hotel, metrics, next_checkins }: HotelDashboardProps) {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Painel do Hotel</h2>}
        >
            <Head title="Painel do Hotel" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hotel</p>
                        <h1 className="mt-2 text-2xl font-bold text-slate-900">{hotel.name}</h1>
                        <p className="mt-1 text-sm text-slate-600">{hotel.supplier_name}</p>
                        <p className="text-sm text-slate-500">{hotel.address}</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <MetricCard title="Reservas totais" value={String(metrics.bookings_total)} subtitle="Todas as reservas do hotel" />
                        <MetricCard title="Reservas confirmadas" value={String(metrics.bookings_confirmed)} subtitle="Estado CONFIRMED" />
                        <MetricCard title="Reservas pendentes" value={String(metrics.bookings_pending)} subtitle="Estado PENDING" />
                        <MetricCard title="Reservas canceladas" value={String(metrics.bookings_cancelled)} subtitle="Estado CANCELLED" />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <MetricCard title="Já recebido" value={formatMoney(metrics.supplier_received_paid, metrics.currency)} subtitle="Pagamentos ao hotel com estado PAID" />
                        <MetricCard title="Por receber" value={formatMoney(metrics.supplier_pending_to_receive, metrics.currency)} subtitle="Pagamentos ao hotel com estado PENDING" />
                        <MetricCard title="Em atraso" value={formatMoney(metrics.supplier_overdue_to_receive, metrics.currency)} subtitle="PENDING com data de pagamento ultrapassada" />
                        <MetricCard title="Média de noites" value={String(metrics.average_nights)} subtitle="Reservas ativas (PENDING + CONFIRMED)" />
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">Próximos check-ins</h3>
                                <p className="text-sm text-slate-600">Visão rápida das próximas entradas e valores associados ao hotel.</p>
                            </div>
                            <Link
                                href={route('hotel.bookings.index')}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-400 hover:text-slate-900"
                            >
                                Ver todas as reservas
                            </Link>
                        </div>

                        {next_checkins.length === 0 ? (
                            <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-600">
                                Sem check-ins próximos de momento.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200 text-sm">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-semibold text-slate-600">Reserva</th>
                                            <th className="px-3 py-2 text-left font-semibold text-slate-600">Cliente</th>
                                            <th className="px-3 py-2 text-left font-semibold text-slate-600">Estadia</th>
                                            <th className="px-3 py-2 text-left font-semibold text-slate-600">Valor hotel</th>
                                            <th className="px-3 py-2 text-left font-semibold text-slate-600">Estados</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {next_checkins.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-3 py-2">
                                                    <p className="font-semibold text-slate-900">{item.event_name}</p>
                                                    <p className="text-xs text-slate-500">{item.id}</p>
                                                </td>
                                                <td className="px-3 py-2 text-slate-700">{item.customer_name}</td>
                                                <td className="px-3 py-2 text-slate-700">
                                                    <p>{item.check_in} ate {item.check_out}</p>
                                                    <p className="text-xs text-slate-500">{item.nights} noite(s)</p>
                                                </td>
                                                <td className="px-3 py-2 text-slate-700">
                                                    <p className="font-semibold">{formatMoney(item.supplier_amount, item.currency)}</p>
                                                    <p className="text-xs text-slate-500">Vencimento: {item.supplier_due_date ?? 'N/D'}</p>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <p className="text-xs font-semibold uppercase text-slate-700">
                                                        Reserva: {item.booking_status}
                                                    </p>
                                                    <p className="text-xs uppercase text-slate-500">
                                                        Cliente: {item.customer_payment_status}
                                                    </p>
                                                    <p className="text-xs uppercase text-slate-500">
                                                        Hotel: {item.supplier_payment_status}
                                                    </p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function MetricCard({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
    );
}

