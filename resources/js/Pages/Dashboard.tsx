import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Dashboard() {
    
    const pageProps = usePage<PageProps>().props;
    const unreadNotifications = pageProps.notifications?.unread_count ?? 0;

    const quickActions = [
        {
            title: 'Nova reserva',
            description: 'Inicia uma reserva com seleção de evento, hotel e datas.',
            href: '/',
            style: 'bg-slate-900 text-white hover:bg-black',
        },
        {
            title: 'As minhas reservas',
            description: 'Consulta estados, detalhes e ações disponíveis por reserva.',
            href: route('dashboard.bookings.index'),
            style: 'bg-indigo-600 text-white hover:bg-indigo-500',
        },
        {
            title: 'Pagamentos',
            description: 'Acede às reservas para pagar, confirmar estado e sincronizar.',
            href: route('dashboard.bookings.index'),
            style: 'bg-emerald-600 text-white hover:bg-emerald-500',
        },
        {
            title: 'Faturas',
            description: 'Consulta e descarrega todos os documentos num único local.',
            href: route('dashboard.billing.index'),
            style: 'bg-amber-500 text-slate-950 hover:bg-amber-400',
        },
    ];

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Painel</h2>}
        >
            <Head title="Painel" />

            <div className="bg-gradient-to-b from-slate-100 via-white to-slate-100 py-10">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Área de cliente</p>
                        <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">Tudo o que precisas, à distância de um clique</h1>
                        <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-base">
                            Gere reservas, pagamentos e documentos de faturação no mesmo lugar. Mantém também acesso rápido ao perfil e às páginas de apoio.
                        </p>
                        <div className="mt-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                            Notificações por ler: {unreadNotifications}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Ações rápidas</p>
                                <h2 className="mt-1 text-xl font-black text-slate-900">Atalhos principais</h2>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {quickActions.map((action) => (
                                <article key={action.title} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                                    <h3 className="text-sm font-bold text-slate-900">{action.title}</h3>
                                    <p className="mt-2 min-h-14 text-sm text-slate-600">{action.description}</p>
                                    <Link
                                        href={action.href}
                                        className={`mt-3 inline-flex rounded-lg px-3 py-2 text-xs font-semibold transition ${action.style}`}
                                    >
                                        Abrir
                                    </Link>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="grid gap-5 lg:grid-cols-3">
                        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Conta</p>
                            <h3 className="mt-1 text-lg font-bold text-slate-900">Perfil e dados pessoais</h3>
                            <p className="mt-2 text-sm text-slate-600">
                                Atualiza dados, email, palavra-passe e preferências da tua conta.
                            </p>
                            <Link
                                href={route('profile.edit')}
                                className="mt-4 inline-flex rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
                            >
                                Gerir perfil
                            </Link>
                        </article>

                        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Explorar</p>
                            <h3 className="mt-1 text-lg font-bold text-slate-900">Eventos e contactos</h3>
                            <p className="mt-2 text-sm text-slate-600">
                                Procura novos eventos e obtém suporte da equipa quando necessário.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <Link
                                    href={route('events.index')}
                                    className="inline-flex rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
                                >
                                    Ver eventos
                                </Link>
                                <Link
                                    href={route('contacts.index')}
                                    className="inline-flex rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
                                >
                                    Contactar suporte
                                </Link>
                            </div>
                        </article>

                        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Legal</p>
                            <h3 className="mt-1 text-lg font-bold text-slate-900">Transparência e direitos</h3>
                            <p className="mt-2 text-sm text-slate-600">
                                Consulta facilmente políticas, termos e informação legal relevante.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <Link href={route('legal.privacy')} className="inline-flex rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900">
                                    Privacidade
                                </Link>
                                <Link href={route('legal.cookies')} className="inline-flex rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900">
                                    Cookies
                                </Link>
                                <Link href={route('legal.terms')} className="inline-flex rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900">
                                    Termos
                                </Link>
                            </div>
                        </article>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
