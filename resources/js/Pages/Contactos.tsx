import ErrorToasts from '@/Components/ErrorToasts';
import { assetUrl } from '@/lib/assetUrl';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Contactos({ auth }: PageProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
            <Head title="Contactos" />
            <ErrorToasts />

            <div className="min-h-screen bg-slate-100 text-slate-900">
                <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
                    <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <img className="max-w-[110px]" src={assetUrl('/optviagens.png')} alt="OptViagens" />
                            <span className="hidden rounded-full bg-[#0f172a] px-3 py-1 text-xs font-semibold text-white sm:inline-block">
                                OptEventos
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen((current) => !current)}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold sm:hidden"
                        >
                            {isMobileMenuOpen ? 'Fechar' : 'Menu'}
                        </button>

                        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 sm:flex">
                            <Link href="/" className="transition hover:text-slate-900">
                                Home
                            </Link>
                            <Link href={route('events.index')} className="transition hover:text-slate-900">
                                Eventos
                            </Link>
                            <Link href={route('contacts.index')} className="text-slate-900">
                                Contactos
                            </Link>
                        </nav>

                        <div className="hidden items-center gap-2 sm:flex">
                            {auth.user ? (
                                <>
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
                                    >
                                        Painel
                                    </Link>
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="rounded-full bg-[#0f172a] px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                                    >
                                        Logout
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
                                    >
                                        Entrar
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="rounded-full bg-[#0f172a] px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                                    >
                                        Criar conta
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {isMobileMenuOpen ? (
                        <div className="border-t border-slate-200 bg-white px-4 py-3 sm:hidden">
                            <div className="grid gap-2">
                                <Link
                                    href="/"
                                    className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Home
                                </Link>
                                <Link
                                    href={route('events.index')}
                                    className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Eventos
                                </Link>
                                <Link
                                    href={route('contacts.index')}
                                    className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Contactos
                                </Link>
                                {auth.user ? (
                                    <>
                                        <Link
                                            href={route('dashboard')}
                                            className="rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Painel
                                        </Link>
                                        <Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Logout
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Entrar
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="rounded-lg bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Criar conta
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : null}
                </header>

                <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    <section className="rounded-3xl border border-slate-200 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 p-6 text-white shadow-[0_24px_70px_-45px_rgba(249,115,22,0.75)] sm:p-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">Contacto</p>
                        <h1 className="mt-2 text-3xl font-black">Fala com a equipa OptEventos</h1>
                        <p className="mt-2 max-w-2xl text-sm text-white/90">
                            Estamos disponíveis para ajudar com reservas, dúvidas sobre eventos e suporte de pagamentos.
                        </p>
                    </section>

                    <section className="mt-6 grid gap-4 md:grid-cols-3">
                        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                            <p className="text-sm font-semibold text-slate-900">Email</p>
                            <p className="mt-2 text-sm text-slate-600">support@optviagens.pt</p>
                        </article>
                        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                            <p className="text-sm font-semibold text-slate-900">Telefone</p>
                            <p className="mt-2 text-sm text-slate-600">+351 210 000 000</p>
                        </article>
                        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                            <p className="text-sm font-semibold text-slate-900">Morada</p>
                            <p className="mt-2 text-sm text-slate-600">Lisboa, Portugal</p>
                        </article>
                    </section>

                    <section className="mt-6 grid gap-4 lg:grid-cols-2">
                        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Horário de suporte</p>
                            <h2 className="mt-2 text-xl font-black text-slate-900">Segunda a sábado, 09:00 - 21:00</h2>
                            <p className="mt-2 text-sm text-slate-600">
                                Respondemos com prioridade a pedidos relacionados com reservas em andamento e pagamentos.
                            </p>
                            <div className="mt-4 space-y-2 text-sm text-slate-700">
                                <p>Tempo médio de resposta por email: até 2h úteis</p>
                                <p>Tempo médio de resposta por telefone: imediato em horário ativo</p>
                            </div>
                        </article>

                        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Perguntas frequentes</p>
                            <h2 className="mt-2 text-xl font-black text-slate-900">Como te podemos ajudar?</h2>
                            <div className="mt-4 space-y-3 text-sm text-slate-700">
                                <p>
                                    <span className="font-semibold text-slate-900">Alterar uma reserva:</span> usa o teu painel e abre o detalhe da reserva.
                                </p>
                                <p>
                                    <span className="font-semibold text-slate-900">Problemas no pagamento:</span> envia o ID da reserva para acelerarmos a validação.
                                </p>
                                <p>
                                    <span className="font-semibold text-slate-900">Parcerias de hotéis:</span> contacta-nos por email com os dados comerciais.
                                </p>
                            </div>
                        </article>
                    </section>
                </main>

                <footer className="mt-10 bg-[#0b1220] px-6 py-8 text-slate-300 sm:px-8">
                    <div className="mx-auto grid max-w-7xl px-10 gap-6 md:grid-cols-4">
                        <div className="md:col-span-2">
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">OptEventos</p>
                            <p className="mt-2 text-xl font-bold text-white">Estamos disponíveis para apoiar a tua viagem de evento.</p>
                            <p className="mt-2 text-sm text-slate-400">
                                Equipa dedicada para reservas, alterações e suporte de pagamentos.
                            </p>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-white">Navegação</p>
                            <div className="mt-2 space-y-1 text-sm text-slate-400">
                                <Link href="/" className="block transition hover:text-white">
                                    Home
                                </Link>
                                <Link href={route('events.index')} className="block transition hover:text-white">
                                    Eventos
                                </Link>
                                <Link href={route('contacts.index')} className="block transition hover:text-white">
                                    Contactos
                                </Link>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-white">Contacto</p>
                            <div className="mt-2 space-y-1 text-sm text-slate-400">
                                <p>support@optviagens.pt</p>
                                <p>+351 210 000 000</p>
                                <p>Lisboa, Portugal</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 border-t border-slate-800 pt-4 text-xs text-slate-500">
                        OptViagens © {new Date().getFullYear()} - Todos os direitos reservados.
                    </div>
                </footer>
            </div>
        </>
    );
}
