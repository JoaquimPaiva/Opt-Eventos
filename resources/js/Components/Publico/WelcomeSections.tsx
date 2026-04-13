import { Link } from "@inertiajs/react";
import { ReactNode } from "react";

export interface WelcomeEventOption {
    id: number;
    name: string;
}

export interface WelcomeDestinationCard {
    id: number;
    name: string;
    image: string | null;
    offers: number;
    isFeatured: boolean;
}

export interface WelcomeLogoItem {
    id: number;
    name: string;
    image: string | null;
}

export interface WelcomeHotelCard {
    id: number;
    name: string;
    event: string;
    image: string | null;
    price: number;
    currency: string;
    room: string;
    meal: string;
}

export interface WelcomeHowItWorksStep {
    title: string;
    text: string;
}

export interface WelcomeTrustHighlight {
    title: string;
    text: string;
}

export interface WelcomeAudienceCard {
    title: string;
    text: string;
}

export interface WelcomeFaqItem {
    question: string;
    answer: string;
}

interface SearchGridProps {
    selectedEventId: string;
    setSelectedEventId: (value: string) => void;
    eventOptions: WelcomeEventOption[];
    checkIn: string;
    setCheckIn: (value: string) => void;
    checkOut: string;
    setCheckOut: (value: string) => void;
}

interface WelcomeHeroSectionProps extends SearchGridProps {
    heroImage: string | null;
    nextHref: string;
    nextLabel: string;
    canProceed: boolean;
    hasEventSelected: boolean;
    availableCount: number;
}

export function PublicWelcomeHeroSection({
    heroImage,
    nextHref,
    nextLabel,
    canProceed,
    hasEventSelected,
    availableCount,
    selectedEventId,
    setSelectedEventId,
    eventOptions,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
}: WelcomeHeroSectionProps) {
    return (
        <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-sky-50 to-sky pb-10 sm:pb-24">
            <div className="relative mx-auto w-full overflow-hidden border-b border-slate-200/70 bg-slate-900 shadow-[0_35px_80px_-50px_rgba(15,23,42,0.85)] rounded-b-[10%] sm:rounded-b-[15%]">
                {heroImage ? (
                    <img
                        src={heroImage}
                        alt="Vista de hotel parceiro para eventos"
                        className="h-[430px] w-full object-cover sm:h-[560px]"
                    />
                ) : (
                    <div className="h-[430px] bg-gradient-to-r from-[#0f172a] via-[#102f63] to-[#1d4b8f] sm:h-[560px]" />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(2,6,23,0.88)_12%,rgba(2,6,23,0.6)_40%,rgba(15,58,138,0.34)_70%,rgba(2,6,23,0.72)_100%)]" />

                <div className="absolute inset-x-0 top-12 z-10 mx-auto max-w-7xl px-4 text-white sm:top-16 sm:px-6 lg:px-8">
                    <div className="max-w-3xl space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.17em] text-white/95">
                            Reservas de hotel para eventos
                        </div>
                        <h1 className="text-3xl font-black leading-tight sm:text-5xl lg:text-6xl">
                            Reserva hotéis para os teus eventos com acesso
                            exclusivo a parceiros oficiais.
                        </h1>
                        <p className="max-w-2xl text-sm text-slate-100/95 sm:text-base">
                            Explora eventos, compara estadias disponíveis e
                            conclui a tua reserva com pagamento seguro,
                            condições transparentes e acompanhamento completo.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1 text-xs font-semibold">
                            <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1">
                                Hotéis parceiros verificados
                            </span>
                            <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1">
                                Disponibilidade 100% validada
                            </span>
                            <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1">
                                Checkout seguro
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-20 mx-auto -mt-20 hidden w-full max-w-7xl px-4 sm:block lg:px-8">
                <div id="search-reserva" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.45)] lg:p-6">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                Pesquisa principal
                            </p>
                            <h2 className="mt-1 text-xl font-black text-slate-900">
                                Encontra ofertas disponíveis para o teu evento
                            </h2>
                        </div>
                        <p className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
                            {availableCount} oferta(s) disponível(is)
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
                        <SearchGrid
                            selectedEventId={selectedEventId}
                            setSelectedEventId={setSelectedEventId}
                            eventOptions={eventOptions}
                            checkIn={checkIn}
                            setCheckIn={setCheckIn}
                            checkOut={checkOut}
                            setCheckOut={setCheckOut}
                        />
                        <Link
                            href={nextHref}
                            className={`w-full rounded-xl px-6 py-3 text-center text-sm font-semibold text-white transition xl:min-w-[250px] xl:w-auto ${
                                canProceed
                                    ? "bg-[#0f3a8a] hover:bg-[#0c2f6f]"
                                    : "pointer-events-none bg-slate-400"
                            }`}
                        >
                            {nextLabel}
                        </Link>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                            Disponibilidade validada antes da confirmação
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                            Pagamentos protegidos e processo acompanhado
                        </span>
                    </div>
                </div>
            </div>

            <div className="mx-auto mt-4 max-w-7xl px-4 sm:hidden lg:px-8">
                <div id="search-reserva" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Pesquisa principal
                    </p>
                    <h2 className="mt-1 text-lg font-black text-slate-900">
                        Pesquisa por evento e datas
                    </h2>
                    <div className="mt-3">
                        <SearchGrid
                            selectedEventId={selectedEventId}
                            setSelectedEventId={setSelectedEventId}
                            eventOptions={eventOptions}
                            checkIn={checkIn}
                            setCheckIn={setCheckIn}
                            checkOut={checkOut}
                            setCheckOut={setCheckOut}
                        />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-slate-600">
                            {availableCount} oferta(s) disponível(is)
                        </span>
                        <Link
                            href={nextHref}
                            className={`rounded-xl px-5 py-2 text-sm font-semibold text-white transition ${
                                canProceed
                                    ? "bg-[#0f3a8a] hover:bg-[#0c2f6f]"
                                    : "pointer-events-none bg-slate-400"
                            }`}
                        >
                            {hasEventSelected ? "Ver hotéis" : "Ver eventos"}
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

interface WelcomeLogosSectionProps {
    logos: WelcomeLogoItem[];
}

export function PublicWelcomeLogosSection({ logos }: WelcomeLogosSectionProps) {
    const stripItems = logos.length > 0 ? [...logos, ...logos] : [];
    const animationDuration = Math.max(logos.length * 5, 22);

    return (
        <section className="mx-auto mb-12 max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden py-4">
                <div className="mb-2 px-4 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:text-left">
                    Eventos em parceria
                </div>

                {logos.length > 0 ? (
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-sky to-transparent" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-sky to-transparent" />

                        <div
                            className="flex w-max items-center gap-3 px-3 [animation:welcome-logos-marquee_linear_infinite] hover:[animation-play-state:paused] motion-reduce:animate-none"
                            style={{ animationDuration: `${animationDuration}s` }}
                        >
                            {stripItems.map((logo, index) => (
                                <Link
                                    key={`${logo.id}-${index}`}
                                    href={route("events.index")}
                                    className="group flex h-24 w-24 flex-col justify-center items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-700 transition hover:border-slate-300 hover:bg-white"
                                    aria-hidden={index >= logos.length}
                                >
                                    <span className="inline-flex h-16 w-16 items-center justify-center overflow-hidden text-[11px] font-bold text-slate-700">
                                        {logo.image ? (
                                            <img
                                                src={logo.image}
                                                alt={logo.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            logo.name
                                                .split(" ")
                                                .slice(0, 2)
                                                .map((part) => part.charAt(0))
                                                .join("")
                                                .toUpperCase()
                                        )}
                                    </span>
                                    <span className="hidden text-xs font-semibold sm:text-sm">
                                        {logo.name}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="px-4 text-sm text-slate-500">
                        Ainda não existem eventos para apresentar.
                    </div>
                )}
            </div>
            <style>
                {`@keyframes welcome-logos-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}
            </style>
        </section>
    );
}

interface WelcomeAlertsSectionProps {
    checkIn: string;
    checkOut: string;
    hasValidDateRange: boolean;
    selectedEventId: string;
    selectedEventRatesCount: number;
    availableRatesCount: number;
}

export function PublicWelcomeAlertsSection({
    checkIn,
    checkOut,
    hasValidDateRange,
    selectedEventId,
    selectedEventRatesCount,
    availableRatesCount,
}: WelcomeAlertsSectionProps) {
    return (
        <section className="mx-auto mt-4 max-w-7xl space-y-2 px-4 sm:px-6 lg:px-8">
            {checkIn !== "" && checkOut !== "" && !hasValidDateRange ? (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    A data de check-out deve ser posterior ao check-in.
                </p>
            ) : null}

            {selectedEventId !== "" &&
            hasValidDateRange &&
            selectedEventRatesCount === 0 ? (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Este evento não tem hotéis disponíveis nas datas
                    selecionadas.
                </p>
            ) : null}

            {selectedEventId === "" &&
            hasValidDateRange &&
            availableRatesCount === 0 ? (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Não existem eventos disponíveis para o período escolhido.
                </p>
            ) : null}
        </section>
    );
}

export function PublicWelcomeStatsSection() {
    return (
        <section className="mx-auto mt-0 grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
            <MetricCard
                title="Hotéis parceiros"
                value="+120"
                text="Seleção associada a eventos reais e parceiros oficiais"
            />
            <MetricCard
                title="Reserva em minutos"
                value="~5"
                text="Fluxo simples e guiado para reduzir fricção"
            />
            <MetricCard
                title="Checkout seguro"
                value="100%"
                text="Pagamentos protegidos e validação de estado"
            />
            <MetricCard
                title="Suporte dedicado"
                value="24/7"
                text="Acompanhamento antes, durante e após a reserva"
            />
        </section>
    );
}

export function PublicWelcomeOrangeCtaSection() {
    return (
        <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-orange-200 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-300 p-6 text-slate-900 shadow-[0_24px_70px_-45px_rgba(251,146,60,0.75)] sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="max-w-2xl">
                        <p className="text-xs uppercase tracking-[0.14em] text-slate-100">
                            Reserva exclusiva
                        </p>
                        <h3 className="mt-1 text-2xl font-black text-white  sm:text-3xl">
                            Planeia a tua próxima estadia com acesso exclusivo
                            a hotéis parceiros dos teus eventos.
                        </h3>
                    </div>
                    <Link
                        href={route("events.index")}
                        className="rounded-xl bg-[#0f3a8a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0c2f6f]"
                    >
                        Explorar eventos
                    </Link>
                </div>
            </div>
        </section>
    );
}

interface WelcomeDestinationsSectionProps {
    destinationCards: WelcomeDestinationCard[];
}

export function PublicWelcomeDestinationsSection({
    destinationCards,
}: WelcomeDestinationsSectionProps) {
    const carouselCards =
        destinationCards.length > 0
            ? [...destinationCards, ...destinationCards]
            : [];

    const animationDuration = Math.max(destinationCards.length * 7, 28);

    return (
        <section id="eventos-destaque" className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
                eyebrow="Eventos"
                title="Eventos em destaque"
                subtitle="Descobre experiências com estadias disponíveis através da nossa rede de hotéis parceiros."
            />
            <div className="relative">
                {destinationCards.length > 0 ? (
                    <div className="relative overflow-hidden rounded-3xl">
                        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-slate-100 to-transparent" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-slate-100 to-transparent" />

                        <div
                            className="flex w-max gap-4 py-1 [animation:welcome-events-marquee_linear_infinite] hover:[animation-play-state:paused] motion-reduce:animate-none"
                            style={{ animationDuration: `${animationDuration}s` }}
                        >
                            {carouselCards.map((destination, index) => (
                                <article
                                    key={`${destination.id}-${index}`}
                                    className="group w-[280px] flex-none overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:w-[320px]"
                                    aria-hidden={index >= destinationCards.length}
                                >
                                    <div className="relative">
                                        {destination.image ? (
                                            <img
                                                src={destination.image}
                                                alt={destination.name}
                                                className="h-44 w-full object-cover transition duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="h-44 bg-slate-200" />
                                        )}
                                        {destination.isFeatured ? (
                                            <span className="absolute left-3 top-3 rounded-full bg-[#0f3a8a] px-2.5 py-1 text-[11px] font-semibold text-white">
                                                Destaque
                                            </span>
                                        ) : null}
                                    </div>
                                    <div className="space-y-2 p-4">
                                        <p className="text-sm font-bold text-slate-900">
                                            {destination.name}
                                        </p>
                                        <p className="text-xs text-slate-600">
                                            {destination.offers} oferta(s)
                                            disponíveis
                                        </p>
                                        <Link
                                            href={route("events.index")}
                                            className="inline-flex rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                                        >
                                            Ver opções
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                ) : (
                    <EmptyState
                        message="Neste momento ainda não existem eventos em destaque."
                        ctaLabel="Ver todos os eventos"
                        ctaHref={route("events.index")}
                    />
                )}
            </div>
            <style>
                {`@keyframes welcome-events-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}
            </style>
        </section>
    );
}

interface WelcomeHotelsSectionProps {
    hotelCards: WelcomeHotelCard[];
}

export function PublicWelcomeHotelsSection({
    hotelCards,
}: WelcomeHotelsSectionProps) {
    const carouselCards = hotelCards.length > 0 ? [...hotelCards, ...hotelCards] : [];
    const animationDuration = Math.max(hotelCards.length * 6, 26);

    return (
        <section id="hoteis-premium" className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
                eyebrow="Hotéis"
                title="Hotéis premium para cada evento"
                subtitle="Compara opções selecionadas para cada experiência, com disponibilidade, regime e preço visíveis desde o primeiro momento."
            />
            <div className="relative">
                {hotelCards.length > 0 ? (
                    <div className="relative overflow-hidden rounded-3xl">
                        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-slate-100 to-transparent" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-slate-100 to-transparent" />

                        <div
                            className="flex w-max gap-4 py-1 [animation:welcome-hotels-marquee_linear_infinite] hover:[animation-play-state:paused] motion-reduce:animate-none"
                            style={{ animationDuration: `${animationDuration}s` }}
                        >
                            {carouselCards.map((hotel, index) => (
                                <article
                                    key={`${hotel.id}-${index}`}
                                    className="group w-[280px] flex-none overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:w-[320px]"
                                    aria-hidden={index >= hotelCards.length}
                                >
                                    {hotel.image ? (
                                        <img
                                            src={hotel.image}
                                            alt={hotel.name}
                                            className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="h-48 bg-slate-200" />
                                    )}
                                    <div className="space-y-2 p-4">
                                        <p className="text-base font-bold text-slate-900">
                                            {hotel.name}
                                        </p>
                                        <p className="text-sm text-slate-600">{hotel.event}</p>
                                        <p className="text-xs text-slate-600">
                                            {hotel.room} • {hotel.meal}
                                        </p>
                                        <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                                            <span className="rounded-full bg-sky-100 px-2.5 py-1 text-sky-700">
                                                Parceiro oficial
                                            </span>
                                            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-700">
                                                Disponível
                                            </span>
                                            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-700">
                                                Flexível
                                            </span>
                                        </div>
                                        <p className="pt-1 text-sm font-semibold text-slate-900">
                                            Desde {hotel.price.toFixed(2)} {hotel.currency}
                                            /noite
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                ) : (
                    <EmptyState message="Ainda não existem hotéis em destaque para mostrar." />
                )}
            </div>
            <style>
                {`@keyframes welcome-hotels-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}
            </style>
        </section>
    );
}

interface WelcomeHowItWorksSectionProps {
    steps: WelcomeHowItWorksStep[];
}

export function PublicWelcomeHowItWorksSection({
    steps,
}: WelcomeHowItWorksSectionProps) {
    return (
        <section id="como-funciona" className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
                eyebrow="Como funciona"
                title="Reservar é simples"
                subtitle="Da escolha do evento à confirmação do pagamento, todo o processo foi pensado para ser claro e seguro."
            />
            <div className="grid gap-4 lg:grid-cols-3">
                {steps.map((step, index) => (
                    <article
                        key={step.title}
                        className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0f3a8a] text-sm font-black text-white">
                            {index + 1}
                        </span>
                        <h4 className="mt-3 text-lg font-bold text-slate-900">
                            {step.title}
                        </h4>
                        <p className="mt-2 text-sm text-slate-600">{step.text}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}

interface WelcomeVisualSectionProps {
    showcaseImages: string[];
    trustHighlights: WelcomeTrustHighlight[];
}

export function PublicWelcomeVisualSection({
    showcaseImages,
    trustHighlights,
}: WelcomeVisualSectionProps) {
    return (
        <section className="hidden mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
                eyebrow="Confiança"
                title="Uma plataforma pensada para reservar com mais confiança"
                subtitle="Disponibilidade validada, políticas claras e acompanhamento completo para decisões sem incerteza."
            />
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="grid min-h-[320px] grid-cols-2 gap-3 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 p-3 shadow-sm sm:min-h-[360px] sm:grid-cols-3">
                    {(showcaseImages.length > 0
                        ? showcaseImages
                        : [
                              "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop",
                              "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=1200&auto=format&fit=crop",
                              "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop",
                          ]
                    ).map((image, index) => (
                        <div
                            key={`${image}-${index}`}
                            className={`overflow-hidden rounded-2xl ${
                                index % 3 === 0 ? "col-span-2 row-span-2" : "col-span-1"
                            }`}
                        >
                            <img
                                src={image}
                                alt="Ambiente de hotel e evento"
                                className="h-full w-full object-cover transition duration-500 hover:scale-105"
                            />
                        </div>
                    ))}
                </div>

                <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Destaques de credibilidade
                    </p>
                    <div className="mt-3 space-y-2">
                        {trustHighlights.map((item) => (
                            <div
                                key={item.title}
                                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                            >
                                <p className="text-sm font-semibold text-slate-900">
                                    {item.title}
                                </p>
                                <p className="mt-1 text-xs text-slate-600">
                                    {item.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </article>
            </div>
        </section>
    );
}

export function PublicWelcomeTickerSection() {
    const chips = [
        "Reserva simples",
        "Hotéis parceiros",
        "Pagamento seguro",
        "Políticas claras",
        "Disponibilidade validada",
        "Suporte dedicado",
    ];

    return (
        <section className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white py-3 shadow-sm">
                <div className="flex flex-wrap items-center gap-2 px-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 sm:text-sm">
                    {chips.map((chip) => (
                        <span
                            key={chip}
                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1"
                        >
                            {chip}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}

interface WelcomeAudienceSectionProps {
    cards: WelcomeAudienceCard[];
}

export function PublicWelcomeAudienceSection({
    cards,
}: WelcomeAudienceSectionProps) {
    return (
        <section className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
                eyebrow="Para quem"
                title="Uma plataforma pensada para diferentes necessidades"
            />
            <div className="grid gap-4 md:grid-cols-3">
                {cards.map((card) => (
                    <article
                        key={card.title}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                        <h4 className="text-lg font-bold text-slate-900">{card.title}</h4>
                        <p className="mt-2 text-sm text-slate-600">{card.text}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}

export function PublicWelcomeTransparencySection() {
    return (
        <section className="hidden mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
                eyebrow="Transparência"
                title="Transparência em cada etapa da reserva"
            />
            <div className="grid gap-4 lg:grid-cols-2">
                <article className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-sky-50 p-6 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">
                        Pagamentos e cancelamentos claros
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                        Consulta as condições da tarifa antes de confirmar,
                        incluindo políticas de cancelamento, pagamentos por
                        sinal e restantes valores.
                    </p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-sky-50 p-6 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">
                        Disponibilidade e confirmação acompanhadas
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                        A plataforma valida disponibilidade, sincroniza o estado
                        do pagamento e ajuda-te a acompanhar a confirmação da
                        reserva com mais segurança.
                    </p>
                </article>
            </div>
        </section>
    );
}

interface WelcomeFaqSectionProps {
    faqItems: WelcomeFaqItem[];
}

export function PublicWelcomeFaqSection({ faqItems }: WelcomeFaqSectionProps) {
    return (
        <section id="faq" className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader eyebrow="FAQ" title="Perguntas frequentes" />
            <div className="grid gap-3">
                {faqItems.map((faq) => (
                    <details
                        key={faq.question}
                        className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm open:border-slate-300"
                    >
                        <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900">
                            <span className="flex items-center justify-between gap-3">
                                {faq.question}
                                <span className="text-slate-500 transition group-open:rotate-45">
                                    +
                                </span>
                            </span>
                        </summary>
                        <p className="mt-3 text-sm text-slate-600">{faq.answer}</p>
                    </details>
                ))}
            </div>
        </section>
    );
}

export function PublicWelcomeFinalCtaSection() {
    return (
        <section className="mx-auto mt-12 max-w-7xl px-4 pb-2 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-950 via-[#0f2347] to-[#133f88] px-6 py-10 text-white shadow-[0_24px_70px_-45px_rgba(15,23,42,0.8)] sm:px-8">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                    Pronto para avançar?
                </p>
                <h3 className="mt-2 text-2xl font-black sm:text-3xl">
                    Pronto para encontrar a melhor estadia para o teu próximo
                    evento?
                </h3>
                <p className="mt-2 max-w-3xl text-sm text-slate-300">
                    Começa pelos filtros do topo e descobre hotéis
                    disponíveis, preços e condições em poucos passos.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                        href="/#search-reserva"
                        className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                    >
                        Começar agora
                    </Link>
                    <Link
                        href={route("events.index")}
                        className="rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                        Explorar eventos
                    </Link>
                </div>
            </div>
        </section>
    );
}

function SearchGrid({
    selectedEventId,
    setSelectedEventId,
    eventOptions,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
}: SearchGridProps) {
    const fieldClass =
        "w-full rounded-xl border-slate-300 bg-white text-sm shadow-sm focus:border-[#0f3a8a] focus:ring-[#0f3a8a]";

    return (
        <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Evento">
                <select
                    value={selectedEventId}
                    onChange={(event) => setSelectedEventId(event.target.value)}
                    className={fieldClass}
                    disabled={eventOptions.length === 0}
                >
                    <option value="">
                        {eventOptions.length === 0
                            ? "Sem eventos disponíveis"
                            : "Seleciona um evento"}
                    </option>
                    {eventOptions.map((eventOption) => (
                        <option key={eventOption.id} value={eventOption.id}>
                            {eventOption.name}
                        </option>
                    ))}
                </select>
            </Field>

            <Field label="Check-in">
                <input
                    type="date"
                    value={checkIn}
                    onChange={(event) => setCheckIn(event.target.value)}
                    className={fieldClass}
                />
            </Field>

            <Field label="Check-out">
                <input
                    type="date"
                    value={checkOut}
                    onChange={(event) => setCheckOut(event.target.value)}
                    className={fieldClass}
                />
            </Field>
        </div>
    );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {label}
            </span>
            {children}
        </label>
    );
}

function MetricCard({
    title,
    value,
    text,
}: {
    title: string;
    value: string;
    text: string;
}) {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{title}</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
            <p className="mt-1 text-sm text-slate-600">{text}</p>
        </article>
    );
}

function SectionHeader({
    eyebrow,
    title,
    subtitle,
}: {
    eyebrow: string;
    title: string;
    subtitle?: string;
}) {
    return (
        <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {eyebrow}
            </p>
            <h3 className="mt-1 text-2xl font-black text-slate-900">{title}</h3>
            {subtitle ? <p className="mt-2 max-w-3xl text-sm text-slate-600">{subtitle}</p> : null}
        </div>
    );
}

function EmptyState({
    message,
    ctaLabel,
    ctaHref,
}: {
    message: string;
    ctaLabel?: string;
    ctaHref?: string;
}) {
    return (
        <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-sm text-slate-600">
            <p>{message}</p>
            {ctaLabel && ctaHref ? (
                <Link
                    href={ctaHref}
                    className="mt-3 inline-flex rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                >
                    {ctaLabel}
                </Link>
            ) : null}
        </div>
    );
}
