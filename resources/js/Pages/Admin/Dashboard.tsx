import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";

interface Metrics {
    total_bookings: number;
    confirmed_bookings: number;
    pending_bookings: number;
    cancelled_bookings: number;
    client_revenue_paid: number;
    client_receivable_pending: number;
    supplier_payable_pending: number;
    estimated_margin: number;
}

interface UpcomingEvent {
    id: number;
    name: string;
    location: string;
    start_date: string;
    end_date: string;
}

interface AdminDashboardProps {
    metrics: Metrics;
    upcoming_events: UpcomingEvent[];
}

export default function AdminDashboard({
    metrics,
    upcoming_events,
}: AdminDashboardProps) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Painel Admin
                </h2>
            }
        >
            <Head title="Painel Admin" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <KpiCard
                            title="Total de Reservas"
                            value={metrics.total_bookings.toString()}
                        />
                        <KpiCard
                            title="Confirmadas"
                            value={metrics.confirmed_bookings.toString()}
                        />
                        <KpiCard
                            title="Pendentes"
                            value={metrics.pending_bookings.toString()}
                        />
                        <KpiCard
                            title="Canceladas"
                            value={metrics.cancelled_bookings.toString()}
                        />
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
                        <KpiCard
                            title="Receita Recebida"
                            value={`${metrics.client_revenue_paid.toFixed(2)} EUR`}
                        />
                        <KpiCard
                            title="A Receber de Clientes"
                            value={`${metrics.client_receivable_pending.toFixed(2)} EUR`}
                        />
                        <KpiCard
                            title="A Pagar a Fornecedores"
                            value={`${metrics.supplier_payable_pending.toFixed(2)} EUR`}
                        />
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                            Margem Estimada
                        </h3>
                        <p className="mt-2 text-2xl font-semibold text-gray-900">
                            {metrics.estimated_margin.toFixed(2)} EUR
                        </p>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                            Ações Rápidas
                        </h3>
                        <h4 className="text-sm font-medium text-gray-400 pt-4">
                            Gestão de conteúdos
                        </h4>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <Link
                                href={route("admin.bookings.index")}
                                className="rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-500"
                            >
                                Gerir reservas
                            </Link>
                            <Link
                                href={route("admin.users.index")}
                                className="rounded-md bg-fuchsia-600 px-3 py-2 text-sm font-semibold text-white hover:bg-fuchsia-500"
                            >
                                Gerir utilizadores
                            </Link>
                            <Link
                                href={route("admin.events.index")}
                                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                            >
                                Gerir eventos
                            </Link>
                            <Link
                                href={route("admin.event-logos.index")}
                                className="rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-500"
                            >
                                Gerir logos
                            </Link>
                            <Link
                                href={route("admin.hotels.index")}
                                className="rounded-md bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-500"
                            >
                                Gerir hotéis
                            </Link>
                            <Link
                                href={route("admin.rates.index")}
                                className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                            >
                                Gerir tarifas
                            </Link>
                        </div>
                        <h4 className="text-sm font-medium text-gray-400 pt-4">
                            Gestão financeira
                        </h4>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <Link
                                href={route("admin.payments.index")}
                                className="rounded-md bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-600"
                            >
                                Pagamentos de clientes
                            </Link>
                            <Link
                                href={route("admin.supplier-payments.index")}
                                className="rounded-md bg-cyan-700 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-600"
                            >
                                Pagamentos a fornecedores
                            </Link>
                            <Link
                                href={route("admin.reports.index")}
                                className="rounded-md bg-violet-700 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-600"
                            >
                                Relatórios financeiros
                            </Link>
                        </div>
                        <h4 className="text-sm font-medium text-gray-400 pt-4">
                            Criar novo conteúdo
                        </h4>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <Link
                                href={route("admin.events.create")}
                                className="rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-black"
                            >
                                Criar evento
                            </Link>
                            <Link
                                href={route("admin.hotels.create")}
                                className="rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-600"
                            >
                                Criar hotel
                            </Link>
                            <Link
                                href={route("admin.rates.create")}
                                className="rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-500"
                            >
                                Criar tarifa
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                            Próximos Eventos
                        </h3>
                        {upcoming_events.length === 0 ? (
                            <p className="mt-3 text-sm text-gray-600">
                                Não existem eventos ativos próximos.
                            </p>
                        ) : (
                            <div className="mt-4 space-y-3">
                                {upcoming_events.map((event) => (
                                    <div
                                        key={event.id}
                                        className="rounded-md border border-gray-200 p-3"
                                    >
                                        <p className="font-medium text-gray-900">
                                            {event.name}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {event.location}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {event.start_date} até{" "}
                                            {event.end_date}
                                        </p>
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
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {title}
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
        </div>
    );
}
