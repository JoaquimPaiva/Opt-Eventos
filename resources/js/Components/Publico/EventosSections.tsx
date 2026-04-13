import { Link } from "@inertiajs/react";

export interface PublicEventItem {
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

const dateLabel = (value: string | null): string => value ?? "data a definir";

const isBookingOpenToday = (event: PublicEventItem, today: string): boolean => {
    const startOpen = event.booking_start === null || event.booking_start <= today;
    const endOpen = event.booking_end === null || event.booking_end >= today;

    return startOpen && endOpen;
};

interface PublicEventosHeroSectionProps {
    events: PublicEventItem[];
}

export function PublicEventosHeroSection({ events }: PublicEventosHeroSectionProps) {
    const heroImage = events.find((event) => event.cover_image_url)?.cover_image_url ?? null;

    return (
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.85)]">
            {heroImage ? (
                <img
                    src={heroImage}
                    alt="Evento em destaque"
                    className="h-[280px] w-full object-cover sm:h-[340px]"
                />
            ) : (
                <div className="h-[280px] bg-gradient-to-r from-[#0f172a] via-[#102f63] to-[#1d4b8f] sm:h-[340px]" />
            )}

            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(2,6,23,0.85)_12%,rgba(2,6,23,0.45)_48%,rgba(2,6,23,0.82)_100%)]" />

            <div className="absolute inset-x-0 top-0 p-6 text-white sm:p-8 lg:p-10">
                <p className="inline-flex rounded-full border border-white/35 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.17em] text-white/90">
                    OptEventos
                </p>
                <h1 className="mt-3 max-w-3xl text-1xl font-black leading-tight sm:text-4xl">
                    Descobre eventos ativos e reserva hotéis parceiros com total transparência.
                </h1>
                <p className="mt-3 max-w-2xl text-sm text-slate-100/95 sm:text-base">
                    Cada evento dá acesso a opções de estadia selecionadas, com informação clara de disponibilidade,
                    políticas e condições antes da reserva.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                    <a
                        href="#lista-eventos"
                        className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                    >
                        Ver eventos
                    </a>
                    <Link
                        href={route("contacts.index")}
                        className="rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                        Falar com suporte
                    </Link>
                </div>
            </div>
        </section>
    );
}

interface PublicEventosSummarySectionProps {
    events: PublicEventItem[];
}

export function PublicEventosSummarySection({ events }: PublicEventosSummarySectionProps) {
    const activeEvents = events.filter((event) => event.is_active).length;
    const totalHotels = events.reduce((sum, event) => sum + Number(event.hotels_count ?? 0), 0);

    return (
        <section className="grid gap-4 sm:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Eventos</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{events.length}</p>
                <p className="mt-1 text-sm text-slate-600">catálogo disponível para consulta</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Ativos</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{activeEvents}</p>
                <p className="mt-1 text-sm text-slate-600">eventos com estado ativo</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Hotéis parceiros</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{totalHotels}</p>
                <p className="mt-1 text-sm text-slate-600">ligações diretas entre evento e estadia</p>
            </article>
        </section>
    );
}

interface PublicEventosHeadingSectionProps {
    totalEvents: number;
}

export function PublicEventosHeadingSection({ totalEvents }: PublicEventosHeadingSectionProps) {
    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Catálogo</p>
                <h2 className="mt-1 text-3xl font-black text-slate-900">Todos os eventos</h2>
                <p className="mt-1 text-sm text-slate-600">
                    Explora eventos, compara datas e avança para opções de hotéis associados.
                </p>
            </div>
            <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                {totalEvents} evento(s)
            </span>
        </div>
    );
}

interface PublicEventosGridSectionProps {
    events: PublicEventItem[];
}

export function PublicEventosGridSection({ events }: PublicEventosGridSectionProps) {
    if (events.length === 0) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
                Ainda não existem eventos registados.
            </div>
        );
    }

    const today = new Date().toISOString().slice(0, 10);

    return (
        <section id="lista-eventos" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => {
                const bookingOpen = isBookingOpenToday(event, today);

                return (
                    <article
                        key={event.id}
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                        {event.cover_image_url ? (
                            <img
                                src={event.cover_image_url}
                                alt={event.name}
                                className="mb-4 h-44 w-full rounded-xl object-cover"
                            />
                        ) : (
                            <div className="mb-4 grid h-44 place-items-center rounded-xl bg-slate-100 text-sm text-slate-500">
                                Sem imagem de capa
                            </div>
                        )}

                        <div className="mb-2 flex flex-wrap gap-2">
                            <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${
                                    bookingOpen
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-amber-100 text-amber-700"
                                }`}
                            >
                                {bookingOpen ? "Reservas abertas" : "Janela fechada"}
                            </span>
                            <span className="inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-semibold uppercase text-sky-700">
                                {event.hotels_count} hotéis
                            </span>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900">{event.name}</h3>

                        {event.description ? (
                            <p className="mt-2 line-clamp-3 text-sm text-slate-600">{event.description}</p>
                        ) : (
                            <p className="mt-2 text-sm text-slate-500">Sem descrição.</p>
                        )}

                        <div className="mt-4 space-y-1.5 text-sm text-slate-700">
                            <p>
                                <span className="font-semibold text-slate-900">Local:</span> {event.location ?? "A definir"}
                            </p>
                            <p>
                                <span className="font-semibold text-slate-900">Data do evento:</span> {dateLabel(event.start_date)} até {dateLabel(event.end_date)}
                            </p>
                            <p>
                                <span className="font-semibold text-slate-900">Janela de reservas:</span> {dateLabel(event.booking_start)} até {dateLabel(event.booking_end)}
                            </p>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <Link
                                href={route("checkout", { event_id: event.id })}
                                className="rounded-lg bg-[#0f3a8a] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#0c2f6f]"
                            >
                                Ver hotéis
                            </Link>
                            <Link
                                href={route("contacts.index")}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                            >
                                Pedir ajuda
                            </Link>
                        </div>
                    </article>
                );
            })}
        </section>
    );
}

export function PublicEventosCtaSection() {
    return (
        <section className="rounded-3xl m-0 border border-orange-200 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-300 p-6 text-slate-900 shadow-[0_24px_70px_-45px_rgba(251,146,60,0.75)] sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="max-w-2xl">
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-100">Próximo passo</p>
                    <h3 className="mt-1 text-2xl font-black text-white sm:text-3xl">
                        Escolhe um evento e continua para a seleção de hotéis parceiros.
                    </h3>
                </div>
                <Link
                    href="/#search-reserva"
                    className="rounded-xl bg-[#0f3a8a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0c2f6f]"
                >
                    Começar pesquisa
                </Link>
            </div>
        </section>
    );
}
