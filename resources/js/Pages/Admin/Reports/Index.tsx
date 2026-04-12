import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

interface Filters {
    [key: string]: string;
    date_from: string;
    date_to: string;
}

interface Metrics {
    total_bookings: number;
    confirmed_bookings: number;
    pending_bookings: number;
    cancelled_bookings: number;
    cancellation_rate: number;
    client_revenue_paid: number;
    client_receivable_pending: number;
    client_refunded: number;
    supplier_paid: number;
    supplier_payable: number;
    estimated_margin: number;
}

interface TopEvent {
    id: number;
    name: string;
    bookings_count: number;
    revenue: number;
}

interface DailyTrend {
    date: string;
    total_bookings: number;
    cancelled_bookings: number;
    revenue_paid: number;
    supplier_cost: number;
    margin: number;
}

interface ReportsIndexProps {
    filters: Filters;
    metrics: Metrics;
    top_events: TopEvent[];
    daily_trends: DailyTrend[];
}

export default function ReportsIndex({ filters, metrics, top_events, daily_trends }: ReportsIndexProps) {
    const [localFilters, setLocalFilters] = useState(filters);

    const applyFilters = (event: FormEvent) => {
        event.preventDefault();
        router.get(route('admin.reports.index'), localFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const exportUrl = `/admin/reports/export?date_from=${encodeURIComponent(localFilters.date_from)}&date_to=${encodeURIComponent(localFilters.date_to)}`;
    const maxRevenue = Math.max(...daily_trends.map((trend) => trend.revenue_paid), 1);
    const maxMargin = Math.max(...daily_trends.map((trend) => Math.abs(trend.margin)), 1);

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Relatórios Financeiros</h2>}
        >
            <Head title="Relatórios Financeiros" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <p className="text-sm text-gray-600">Acompanha valores a fornecedores e estado de liquidação.</p>
                            <Link
                                href={route("admin.dashboard")}
                                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
                            >
                                Voltar ao painel
                            </Link>
                        </div>
                    <div className="rounded-lg bg-white p-4 shadow-sm">
                        <form onSubmit={applyFilters} className="grid gap-3 md:grid-cols-3">
                            <input
                                type="date"
                                value={localFilters.date_from}
                                onChange={(event) => setLocalFilters((prev) => ({ ...prev, date_from: event.target.value }))}
                                className="rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            <input
                                type="date"
                                value={localFilters.date_to}
                                onChange={(event) => setLocalFilters((prev) => ({ ...prev, date_to: event.target.value }))}
                                className="rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            <button
                                type="submit"
                                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
                            >
                                Aplicar período
                            </button>
                        </form>
                        <div className="mt-3">
                            <a
                                href={exportUrl}
                                className="inline-flex rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                            >
                                Exportar CSV
                            </a>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <KpiCard title="Total de reservas" value={metrics.total_bookings.toString()} />
                        <KpiCard title="Confirmadas" value={metrics.confirmed_bookings.toString()} />
                        <KpiCard title="Pendentes" value={metrics.pending_bookings.toString()} />
                        <KpiCard title="Canceladas" value={metrics.cancelled_bookings.toString()} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <KpiCard title="Receita recebida" value={`${metrics.client_revenue_paid.toFixed(2)} EUR`} />
                        <KpiCard title="A receber" value={`${metrics.client_receivable_pending.toFixed(2)} EUR`} />
                        <KpiCard title="Reembolsado" value={`${metrics.client_refunded.toFixed(2)} EUR`} />
                        <KpiCard title="Fornecedor pago" value={`${metrics.supplier_paid.toFixed(2)} EUR`} />
                        <KpiCard title="Fornecedor por pagar" value={`${metrics.supplier_payable.toFixed(2)} EUR`} />
                        <KpiCard title="Margem estimada" value={`${metrics.estimated_margin.toFixed(2)} EUR`} />
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Taxa de cancelamento</h3>
                        <p className="mt-2 text-2xl font-semibold text-gray-900">{metrics.cancellation_rate.toFixed(2)}%</p>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Top eventos por receita</h3>
                        {top_events.length === 0 ? (
                            <p className="mt-3 text-sm text-gray-600">Sem dados para o período selecionado.</p>
                        ) : (
                            <div className="mt-4 space-y-3">
                                {top_events.map((event) => (
                                    <div key={event.id} className="rounded-md border border-gray-200 p-3">
                                        <p className="font-medium text-gray-900">{event.name}</p>
                                        <p className="text-sm text-gray-600">Reservas: {event.bookings_count}</p>
                                        <p className="text-sm text-gray-600">Receita: {event.revenue.toFixed(2)} EUR</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Tendência diária de receita</h3>
                        {daily_trends.length === 0 ? (
                            <p className="mt-3 text-sm text-gray-600">Sem pontos diários para o período selecionado.</p>
                        ) : (
                            <div className="mt-4 space-y-3">
                                {daily_trends.map((trend) => (
                                    <div key={trend.date}>
                                        <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
                                            <span>{trend.date}</span>
                                            <span>{trend.revenue_paid.toFixed(2)} EUR</span>
                                        </div>
                                        <div className="h-3 w-full rounded-full bg-gray-100">
                                            <div
                                                className="h-3 rounded-full bg-emerald-500"
                                                style={{ width: `${(trend.revenue_paid / maxRevenue) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Tendência diária de margem</h3>
                        {daily_trends.length === 0 ? (
                            <p className="mt-3 text-sm text-gray-600">Sem pontos diários para o período selecionado.</p>
                        ) : (
                            <div className="mt-4 space-y-3">
                                {daily_trends.map((trend) => (
                                    <div key={`${trend.date}-margin`}>
                                        <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
                                            <span>{trend.date}</span>
                                            <span>{trend.margin.toFixed(2)} EUR</span>
                                        </div>
                                        <div className="h-3 w-full rounded-full bg-gray-100">
                                            <div
                                                className={`h-3 rounded-full ${trend.margin >= 0 ? 'bg-blue-500' : 'bg-red-500'}`}
                                                style={{ width: `${(Math.abs(trend.margin) / maxMargin) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function KpiCard({ title, value }: { title: string; value: string }) {
    return (
        <div className="rounded-lg bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
        </div>
    );
}
