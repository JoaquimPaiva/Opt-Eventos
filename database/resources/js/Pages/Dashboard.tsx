import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Painel
                </h2>
            }
        >
            <Head title="Painel" />

            <div className="bg-gradient-to-b from-slate-100 via-white to-slate-100 py-10">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Área de cliente</p>
                        <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">Gere as tuas reservas num só lugar</h1>
                        <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-base">
                            Cria novas reservas para os teus eventos e acompanha o estado dos pagamentos, cancelamentos e detalhes da estadia.
                        </p>
                    </section>

                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="space-y-2 p-6 text-gray-900">
                                <h3 className="text-lg font-semibold">Criar nova reserva</h3>
                                <p className="text-sm text-gray-600">
                                    Escolhe evento, hotel e regime para avançar para checkout com pagamento preparado.
                                </p>
                                <Link
                                    href={route('checkout')}
                                    className="inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
                                >
                                    Ir para checkout
                                </Link>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="space-y-2 p-6 text-gray-900">
                                <h3 className="text-lg font-semibold">As minhas reservas</h3>
                                <p className="text-sm text-gray-600">
                                    Consulta detalhes, estado de pagamento e ações disponíveis para cada reserva.
                                </p>
                                <Link
                                    href={route('dashboard.bookings.index')}
                                    className="inline-flex rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
                                >
                                    Ver reservas
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
