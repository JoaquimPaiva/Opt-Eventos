import { Link } from "@inertiajs/react";

export interface PublicHotelItem {
    id: number;
    event_id: number;
    event_name: string;
    event_location: string | null;
    event_start_date: string | null;
    event_end_date: string | null;
    name: string;
    description: string | null;
    address: string;
    supplier_name: string;
    website_url: string | null;
    cover_image_url: string | null;
    images: string[];
    active_rates_count: number;
    min_sale_price: number | null;
    currency: string;
}

const dateLabel = (value: string | null): string => value ?? "data a definir";

interface PublicHoteisHeroSectionProps {
    hotels: PublicHotelItem[];
}

export function PublicHoteisHeroSection({ hotels }: PublicHoteisHeroSectionProps) {
    const heroImage = hotels.find((hotel) => hotel.cover_image_url)?.cover_image_url ?? null;

    return (
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.85)]">
            {heroImage ? (
                <img
                    src={heroImage}
                    alt="Hotéis parceiros OptEventos"
                    className="h-[280px] w-full object-cover sm:h-[340px]"
                />
            ) : (
                <div className="h-[280px] bg-gradient-to-r from-[#0f172a] via-[#102f63] to-[#1d4b8f] sm:h-[340px]" />
            )}

            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(2,6,23,0.85)_12%,rgba(2,6,23,0.45)_48%,rgba(2,6,23,0.82)_100%)]" />

            <div className="absolute inset-x-0 top-0 p-6 text-white sm:p-8 lg:p-10">
                <p className="inline-flex rounded-full border border-white/35 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.17em] text-white/90">
                    Rede de parcerias
                </p>
                <h1 className="mt-3 max-w-3xl text-1xl font-black leading-tight sm:text-4xl">
                    Conhece todos os hotéis parceiros do projeto OptEventos.
                </h1>
                <p className="mt-3 max-w-2xl text-sm text-slate-100/95 sm:text-base">
                    Trabalhamos com hotéis selecionados para garantir disponibilidade
                    alinhada com eventos ativos, tarifas claras e experiência de reserva segura.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                    <a
                        href="#lista-hoteis"
                        className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                    >
                        Ver hotéis parceiros
                    </a>
                    <Link
                        href={route("events.index")}
                        className="rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                        Ver eventos
                    </Link>
                </div>
            </div>
        </section>
    );
}

interface PublicHoteisSummarySectionProps {
    hotels: PublicHotelItem[];
}

export function PublicHoteisSummarySection({ hotels }: PublicHoteisSummarySectionProps) {
    const totalRates = hotels.reduce((sum, hotel) => sum + hotel.active_rates_count, 0);
    const withWebsite = hotels.filter((hotel) => hotel.website_url !== null).length;

    return (
        <section className="grid gap-4 sm:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Hotéis parceiros</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{hotels.length}</p>
                <p className="mt-1 text-sm text-slate-600">unidades ativas na plataforma</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Tarifas ativas</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{totalRates}</p>
                <p className="mt-1 text-sm text-slate-600">opções com disponibilidade para reserva</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Sites oficiais</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{withWebsite}</p>
                <p className="mt-1 text-sm text-slate-600">hotéis com website institucional disponível</p>
            </article>
        </section>
    );
}

interface PublicHoteisHeadingSectionProps {
    totalHotels: number;
}

export function PublicHoteisHeadingSection({ totalHotels }: PublicHoteisHeadingSectionProps) {
    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Parcerias</p>
                <h2 className="mt-1 text-3xl font-black text-slate-900">Hotéis parceiros</h2>
                <p className="mt-1 text-sm text-slate-600">
                    Todos os hotéis desta página fazem parte da nossa rede de colaboração para eventos.
                </p>
            </div>
            <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                {totalHotels} hotel(éis)
            </span>
        </div>
    );
}

interface PublicHoteisGridSectionProps {
    hotels: PublicHotelItem[];
}

export function PublicHoteisGridSection({ hotels }: PublicHoteisGridSectionProps) {
    if (hotels.length === 0) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
                Ainda não existem hotéis parceiros ativos para mostrar.
            </div>
        );
    }

    return (
        <section id="lista-hoteis" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {hotels.map((hotel) => (
                <article
                    key={hotel.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                    {hotel.cover_image_url ? (
                        <img
                            src={hotel.cover_image_url}
                            alt={hotel.name}
                            className="mb-4 h-44 w-full rounded-xl object-cover"
                        />
                    ) : (
                        <div className="mb-4 grid h-44 place-items-center rounded-xl bg-slate-100 text-sm text-slate-500">
                            Sem imagem disponível
                        </div>
                    )}

                    <div className="mb-2 flex flex-wrap gap-2">
                        <span className="inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-semibold uppercase text-sky-700">
                            Parceiro oficial
                        </span>
                        <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold uppercase text-emerald-700">
                            {hotel.active_rates_count} tarifa(s) ativa(s)
                        </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900">{hotel.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{hotel.supplier_name}</p>
                    <p className="mt-2 text-sm text-slate-700">{hotel.address}</p>

                    {hotel.description ? (
                        <p className="mt-2 line-clamp-3 text-sm text-slate-600">{hotel.description}</p>
                    ) : null}

                    <div className="mt-4 space-y-1.5 text-sm text-slate-700">
                        <p>
                            <span className="font-semibold text-slate-900">Evento:</span> {hotel.event_name}
                        </p>
                        <p>
                            <span className="font-semibold text-slate-900">Local do evento:</span> {hotel.event_location ?? "A definir"}
                        </p>
                        <p>
                            <span className="font-semibold text-slate-900">Datas do evento:</span> {dateLabel(hotel.event_start_date)} até {dateLabel(hotel.event_end_date)}
                        </p>
                        <p>
                            <span className="font-semibold text-slate-900">Preço base:</span>{" "}
                            {hotel.min_sale_price !== null
                                ? `desde ${hotel.min_sale_price.toFixed(2)} ${hotel.currency}/noite`
                                : "a consultar"}
                        </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <Link
                            href={route("checkout", { event_id: hotel.event_id })}
                            className="rounded-lg bg-[#0f3a8a] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#0c2f6f]"
                        >
                            Ver opções do evento
                        </Link>
                        {hotel.website_url ? (
                            <a
                                href={hotel.website_url}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                            >
                                Site do hotel
                            </a>
                        ) : null}
                    </div>
                </article>
            ))}
        </section>
    );
}

export function PublicHoteisCtaSection() {
    return (
        <section className="rounded-3xl border border-orange-200 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-300 p-6 text-slate-900 shadow-[0_24px_70px_-45px_rgba(251,146,60,0.75)] sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="max-w-2xl">
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-100">Parceria + confiança</p>
                    <h3 className="mt-1 text-2xl font-black text-white sm:text-3xl">
                        Queres reservar num dos nossos hotéis parceiros?
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
