import ErrorToasts from "@/Components/ErrorToasts";
import { assetUrl } from "@/lib/assetUrl";
import { PageProps } from "@/types";
import { Head, Link } from "@inertiajs/react";
import { useState } from "react";

interface EventItem {
    id: number;
    name: string;
    description: string | null;
    cover_image_url: string | null;
    location: string | null;
    start_date: string | null;
    end_date: string | null;
    booking_start: string | null;
    booking_end: string | null;
    is_active: boolean;
    hotels_count: number;
}

interface EventosProps {
    [key: string]: unknown;
    events: EventItem[];
}

export default function Eventos({ auth, events }: PageProps<EventosProps>) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
            <Head title="Eventos" />
            <ErrorToasts />

            <div className="min-h-screen bg-[#eef2f6] text-slate-900">
                <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
                    <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <img
                                className="max-w-[110px]"
                                src={assetUrl("/optviagens.png")}
                                alt="OptViagens"
                            />
                            <span className="hidden rounded-full bg-[#0f172a] px-3 py-1 text-xs font-semibold text-white sm:inline-block">
                                OptEventos
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setIsMobileMenuOpen((current) => !current)
                            }
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold sm:hidden"
                        >
                            {isMobileMenuOpen ? "Fechar" : "Menu"}
                        </button>

                        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 sm:flex">
                            <Link
                                href="/"
                                className="transition hover:text-slate-900"
                            >
                                Home
                            </Link>
                            <Link
                                href={route("events.index")}
                                className="transition hover:text-slate-900"
                            >
                                Eventos
                            </Link>
                            <Link href={route("contacts.index")} className="transition hover:text-slate-900">
                                Contactos
                            </Link>
                        </nav>

                        <div className="hidden items-center gap-2 sm:flex">
                            {auth.user ? (
                                <>
                                    <Link
                                        href={route("dashboard")}
                                        className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
                                    >
                                        Painel
                                    </Link>
                                    <Link
                                        href={route("logout")}
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
                                        href={route("login")}
                                        className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
                                    >
                                        Entrar
                                    </Link>
                                    <Link
                                        href={route("register")}
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
                                <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900">
                                    Eventos
                                </span>
                                <Link
                                    href={route("contacts.index")}
                                    className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Contactos
                                </Link>
                                {auth.user ? (
                                    <>
                                        <Link
                                            href={route("dashboard")}
                                            className="rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700"
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                        >
                                            Painel
                                        </Link>
                                        <Link
                                            href={route("logout")}
                                            method="post"
                                            as="button"
                                            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                        >
                                            Logout
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href={route("login")}
                                            className="rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700"
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                        >
                                            Entrar
                                        </Link>
                                        <Link
                                            href={route("register")}
                                            className="rounded-lg bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white"
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                        >
                                            Criar conta
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : null}
                </header>

                <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
                    <section className="max-w-7xl mx-auto rounded-3xl border border-slate-200 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 p-6 text-white shadow-[0_24px_70px_-45px_rgba(249,115,22,0.75)] sm:p-8">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="max-w-5xl">
                                <p className="text-xs uppercase tracking-[0.14em] text-white/80">
                                    OptEventos
                                </p>
                                <h3 className="font-display mt-1 text-2xl font-black sm:text-3xl">
                                    O OptEventos é a sua plataforma de reservas
                                    para eventos, que oferece uma seleção
                                    exclusiva de hotéis para garantir que a sua
                                    experiência seja inesquecível.
                                </h3>
                            </div>
                            {/* <Link
                                    href={checkoutHref}
                                    className={`rounded-xl px-5 py-3 text-sm font-bold transition ${
                                        selectedRate && hasValidDateRange
                                            ? "bg-white text-slate-900 hover:bg-slate-100"
                                            : "pointer-events-none bg-white/40 text-white/80"
                                    }`}
                                >
                                    Começar reserva
                                </Link> */}
                        </div>
                    </section>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                OptEventos
                            </p>
                            <h1 className="mt-1 text-3xl font-black text-slate-900">
                                Todos os eventos
                            </h1>
                        </div>
                    </div>

                    {events.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
                            Ainda não existem eventos registados.
                        </div>
                    ) : (
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {events.map((event) => (
                                <article
                                    key={event.id}
                                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                                >
                                    {event.cover_image_url ? (
                                        <img
                                            src={event.cover_image_url}
                                            alt={event.name}
                                            className="mb-4 h-40 w-full rounded-xl object-cover"
                                        />
                                    ) : (
                                        <div className="mb-4 grid h-40 place-items-center rounded-xl bg-slate-100 text-sm text-slate-500">
                                            Sem imagem de capa
                                        </div>
                                    )}
                                    <div className="flex items-start justify-between gap-3">
                                        <h2 className="text-lg font-bold text-slate-900">
                                            {event.name}
                                        </h2>
                                        {/* <span
                                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase ${
                                                event.is_active
                                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                    : 'border-slate-200 bg-slate-100 text-slate-600'
                                            }`}
                                        >
                                            {event.is_active ? 'Ativo' : 'Inativo'}
                                        </span> */}
                                    </div>

                                    {event.description ? (
                                        <p className="mt-2 text-sm text-slate-600">
                                            {event.description}
                                        </p>
                                    ) : (
                                        <p className="mt-2 text-sm text-slate-500">
                                            Sem descrição.
                                        </p>
                                    )}

                                    <div className="mt-4 space-y-1.5 text-sm text-slate-700">
                                        <p>
                                            <span className="font-semibold text-slate-900">
                                                Local:
                                            </span>{" "}
                                            {event.location ?? "A definir"}
                                        </p>
                                        <p>
                                            <span className="font-semibold text-slate-900">
                                                Data do evento:
                                            </span>{" "}
                                            {event.start_date ?? "Datas a definir"} até{" "}
                                            {event.end_date ?? ""}
                                        </p>
                                        <p>
                                            <span className="font-semibold text-slate-900">
                                                Janela de reservas:
                                            </span>{" "}
                                            {event.booking_start ?? "Datas a definir"} até{" "}
                                            {event.booking_end ?? ""}
                                        </p>
                                        <p>
                                            <span className="font-semibold text-slate-900">
                                                Hotéis associados:
                                            </span>{" "}
                                            {event.hotels_count}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </main>

                <footer
                    id="contacto"
                    className="mt-10 bg-[#0b1220] px-6 py-8 text-slate-300 sm:px-8"
                >
                    <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-4">
                        <div className="md:col-span-2">
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                                OptEventos
                            </p>
                            <p className="mt-2 text-xl font-bold text-white">
                                Hotel matching profissional para eventos.
                            </p>
                            <p className="mt-2 text-sm text-slate-400">
                                Design moderno, reservas seguras e operação
                                centralizada entre cliente, hotel e admin.
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">
                                Navegação
                            </p>
                            <div className="mt-2 space-y-1 text-sm text-slate-400">
                                <Link
                                    href="/"
                                    className="block transition hover:text-white"
                                >
                                    Home
                                </Link>
                                <Link
                                    href={route("events.index")}
                                    className="block transition hover:text-white"
                                >
                                    Eventos
                                </Link>
                                <a
                                    href="#contacto"
                                    className="block transition hover:text-white"
                                >
                                    Contacto
                                </a>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">
                                Contacto
                            </p>
                            <div className="mt-2 space-y-1 text-sm text-slate-400">
                                <p>support@optviagens.pt</p>
                                <p>+351 210 000 000</p>
                                <p>Lisboa, Portugal</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 border-t max-w-7xl mx-auto border-slate-800 pt-4 text-xs text-slate-500">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <p>
                                OptViagens © {new Date().getFullYear()} - Todos
                                os direitos reservados.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
