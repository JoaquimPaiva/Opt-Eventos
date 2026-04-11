import ErrorToasts from "@/Components/ErrorToasts";
import { assetUrl } from "@/lib/assetUrl";
import { PageProps } from "@/types";
import { Head, Link } from "@inertiajs/react";
import {
    PropsWithChildren,
    ReactNode,
    useEffect,
    useMemo,
    useState,
} from "react";

interface RateOption {
    id: number;
    event_id: number;
    hotel_id: number;
    event_name: string;
    event_cover_image: string | null;
    hotel_name: string;
    hotel_images: string[];
    room_type: string;
    meal_plan: string;
    sale_price: number;
    currency: string;
    stock: number;
    booking_start: string | null;
    booking_end: string | null;
    max_guests: number;
}

interface WelcomeProps {
    [key: string]: unknown;
    laravelVersion: string;
    phpVersion: string;
    featured_event_ids: number[];
    rates: RateOption[];
}

function isDateWithinWindow(
    date: string,
    start: string | null,
    end: string | null,
): boolean {
    if (date === "") {
        return true;
    }

    if (start !== null && date < start) {
        return false;
    }

    if (end !== null && date > end) {
        return false;
    }

    return true;
}

export default function Welcome({
    auth,
    laravelVersion,
    phpVersion,
    rates,
    featured_event_ids,
}: PageProps<WelcomeProps>) {
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [selectedEventId, setSelectedEventId] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const availableRates = useMemo(() => {
        return rates.filter((rate) => {
            if (rate.stock <= 0) {
                return false;
            }

            const checkInInside = isDateWithinWindow(
                checkIn,
                rate.booking_start,
                rate.booking_end,
            );
            const checkOutInside = isDateWithinWindow(
                checkOut,
                rate.booking_start,
                rate.booking_end,
            );

            return checkInInside && checkOutInside;
        });
    }, [rates, checkIn, checkOut]);

    const eventOptions = useMemo(() => {
        const map = new Map<number, string>();
        availableRates.forEach((rate) => {
            if (!map.has(rate.event_id)) {
                map.set(rate.event_id, rate.event_name);
            }
        });

        return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
    }, [availableRates]);

    const selectedEventRates = useMemo(() => {
        const eventId = Number.parseInt(selectedEventId, 10);
        if (!Number.isFinite(eventId)) {
            return [];
        }

        return availableRates.filter((rate) => rate.event_id === eventId);
    }, [availableRates, selectedEventId]);

    useEffect(() => {
        if (selectedEventId === "") {
            return;
        }

        const existsInOptions = eventOptions.some(
            (eventOption) => String(eventOption.id) === selectedEventId,
        );
        if (!existsInOptions) {
            setSelectedEventId("");
        }
    }, [eventOptions, selectedEventId]);

    const hasValidDateRange =
        checkIn !== "" && checkOut !== "" && checkOut > checkIn;
    const hasEventSelected = selectedEventId !== "";
    const canProceedWithSelectedEvent =
        hasEventSelected && hasValidDateRange && selectedEventRates.length > 0;
    const canProceedWithDatesOnly =
        !hasEventSelected && hasValidDateRange && availableRates.length > 0;
    const canProceed = canProceedWithSelectedEvent || canProceedWithDatesOnly;

    const hotelsQuery: Record<string, string> = {};
    if (selectedEventId !== "") {
        hotelsQuery.event_id = selectedEventId;
    }
    if (checkIn !== "") {
        hotelsQuery.check_in = checkIn;
    }
    if (checkOut !== "") {
        hotelsQuery.check_out = checkOut;
    }

    const eventsQuery: Record<string, string> = {};
    if (checkIn !== "") {
        eventsQuery.check_in = checkIn;
    }
    if (checkOut !== "") {
        eventsQuery.check_out = checkOut;
    }

    const hotelsHref = route("checkout", hotelsQuery);
    const eventsHref = route("checkout.events", eventsQuery);
    const nextHref = hasEventSelected ? hotelsHref : eventsHref;
    const nextLabel = hasEventSelected
        ? "Ver hotéis disponíveis"
        : "Ver eventos disponíveis";

    const heroImage =
        selectedEventRates[0]?.event_cover_image ??
        selectedEventRates[0]?.hotel_images?.[0] ??
        availableRates[0]?.event_cover_image ??
        availableRates[0]?.hotel_images?.[0] ??
        null;

    const featuredSet = useMemo(
        () => new Set(featured_event_ids),
        [featured_event_ids],
    );

    const destinationCards = useMemo(() => {
        const map = new Map<
            number,
            {
                id: number;
                name: string;
                image: string | null;
                offers: number;
                isFeatured: boolean;
            }
        >();

        availableRates.forEach((rate) => {
            const existing = map.get(rate.event_id);
            if (!existing) {
                map.set(rate.event_id, {
                    id: rate.event_id,
                    name: rate.event_name,
                    image:
                        rate.event_cover_image ?? rate.hotel_images[0] ?? null,
                    offers: 1,
                    isFeatured: featuredSet.has(rate.event_id),
                });
                return;
            }

            existing.offers += 1;
        });

        const allEvents = Array.from(map.values());
        const hasAnyFeatured = allEvents.some((event) => event.isFeatured);
        if (hasAnyFeatured) {
            return allEvents
                .sort(
                    (a, b) =>
                        Number(b.isFeatured) - Number(a.isFeatured) ||
                        b.offers - a.offers,
                )
                .slice(0, 4);
        }

        return allEvents.sort((a, b) => b.offers - a.offers).slice(0, 4);
    }, [availableRates, featuredSet]);

    const hotelCards = useMemo(() => {
        return availableRates.slice(0, 8).map((rate) => ({
            id: rate.id,
            name: rate.hotel_name,
            event: rate.event_name,
            image: rate.hotel_images[0] ?? null,
            price: rate.sale_price,
            currency: rate.currency,
            room: rate.room_type,
            meal: rate.meal_plan,
        }));
    }, [availableRates]);

    return (
        <>
            <Head title="OptEventos" />
            <ErrorToasts />

            <div className="min-h-screen bg-slate-100 text-slate-900">
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
                            <Link href="/" className="text-slate-900">
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
                                <Link
                                    href={route("events.index")}
                                    className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Eventos
                                </Link>
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

                <main>
                    <section className="relative border-slate-200 bg-white pb-0 sm:pb-0">
                        <div className="relative mx-auto w-full overflow-hidden bg-slate-900 shadow-[0_35px_70px_-45px_rgba(15,23,42,0.7)] sm:mt-0">
                            {heroImage ? (
                                // <img src={heroImage} alt="OptEventos Hero" className="h-[360px] w-full object-cover sm:h-[500px]" />
                                // <div className="h-[360px] bg-gradient-to-r from-[#0f172a] via-[#1d3557] to-[#334155] sm:h-[500px]" />
                                <img src="https://www.santander.pt/images/particulares/blogue/artigos/topo/desktop/Maratonas_Portugal_2048x768_desktop.jpg" alt="OptEventos Hero" className="h-[360px] w-full object-cover sm:h-[500px]" />
                            ) : (
                                <div className="h-[360px] bg-gradient-to-r from-[#0f172a] via-[#1d3557] to-[#334155] sm:h-[500px]" />
                            )}

                            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/25 via-slate-900/25 to-slate-950/70" />

                            <div className="absolute inset-x-0 top-12 z-10 mx-auto max-w-7xl px-5 text-white sm:top-16 sm:px-10">
                                <div className="max-w-3xl">
                                    <p className="inline-flex rounded-full border border-white/35 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90">
                                        Reserva hotéis para eventos
                                    </p>
                                    <h1 className="mt-4 text-3xl font-black leading-tight sm:text-6xl">
                                        Encontra o hotel certo para o teu
                                        evento,
                                        <br />
                                        compara preços
                                        <br />e reserva com confiança.
                                    </h1>
                                    <p className="mt-3 max-w-2xl text-sm text-slate-100/90 sm:text-base">
                                        Escolhe o teu evento, encontra o hotel
                                        ideal e confirma em poucos passos.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mx-auto mt-0 hidden w-full max-w-5xl px-5 sm:mt-0 sm:block">
                            <div className="absolute w-full max-w-5xl rounded-[20px] border border-slate-200 bg-white p-4 shadow-2xl lg:p-5 -translate-y-1/2">
                                <div className="flex items-end justify-between gap-4">
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
                                        className={`min-w-[220px] rounded-xl px-6 py-2.5 text-center text-sm font-semibold text-white transition ${
                                            canProceed
                                                ? "bg-[#0f172a] hover:bg-slate-800"
                                                : "pointer-events-none bg-slate-400"
                                        }`}
                                    >
                                        {nextLabel}
                                    </Link>
                                </div>

                                <div className="mt-4 flex items-center justify-end">
                                    <span className="text-xs font-medium text-slate-500">
                                        {selectedEventRates.length ||
                                            availableRates.length}{" "}
                                        oferta(s) disponíveis
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="mx-auto mt-4 max-w-7xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:hidden">
                        <SearchGrid
                            selectedEventId={selectedEventId}
                            setSelectedEventId={setSelectedEventId}
                            eventOptions={eventOptions}
                            checkIn={checkIn}
                            setCheckIn={setCheckIn}
                            checkOut={checkOut}
                            setCheckOut={setCheckOut}
                        />

                        <div className="mt-3 flex items-center justify-between gap-3">
                            <span className="text-xs font-medium text-slate-500">
                                {selectedEventRates.length ||
                                    availableRates.length}{" "}
                                oferta(s)
                            </span>
                            <Link
                                href={nextHref}
                                className={`rounded-xl px-5 py-2 text-sm font-semibold text-white transition ${
                                    canProceed
                                        ? "bg-[#0f172a] hover:bg-slate-800"
                                        : "pointer-events-none bg-slate-400"
                                }`}
                            >
                                {hasEventSelected
                                    ? "Ver hotéis"
                                    : "Ver eventos"}
                            </Link>
                        </div>
                    </section>

                    {checkIn !== "" && checkOut !== "" && !hasValidDateRange ? (
                        <p className="mx-auto mt-3 max-w-7xl rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                            A data de check-out tem de ser posterior ao
                            check-in.
                        </p>
                    ) : null}

                    {selectedEventId !== "" &&
                    hasValidDateRange &&
                    selectedEventRates.length === 0 ? (
                        <p className="mx-auto mt-3 max-w-7xl rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                            Não existem hotéis disponíveis para este evento nas
                            datas escolhidas.
                        </p>
                    ) : null}

                    {selectedEventId === "" &&
                    hasValidDateRange &&
                    availableRates.length === 0 ? (
                        <p className="mx-auto mt-3 max-w-7xl rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                            Não existem eventos disponíveis para estas datas.
                        </p>
                    ) : null}

                    <div className="h-[100px] w-full"></div>

                    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <article className="rounded-2xl border border-slate-200 bg-white p-5">
                            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                                Cobertura
                            </p>
                            <p className="mt-2 font-display text-3xl font-black text-slate-900">
                                +120
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                                hotéis em destinos de evento
                            </p>
                        </article>
                        <article className="rounded-2xl border border-slate-200 bg-white p-5">
                            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                                Rapidez
                            </p>
                            <p className="mt-2 font-display text-3xl font-black text-slate-900">
                                -5 min
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                                para concluir uma reserva
                            </p>
                        </article>
                        <article className="rounded-2xl border border-slate-200 bg-white p-5">
                            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                                Confiança
                            </p>
                            <p className="mt-2 font-display text-3xl font-black text-slate-900">
                                100%
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                                checkout com pagamento seguro
                            </p>
                        </article>
                        <article className="rounded-2xl border border-slate-200 bg-white p-5">
                            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                                Suporte
                            </p>
                            <p className="mt-2 font-display text-3xl font-black text-slate-900">
                                24h
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                                acompanhamento em toda a jornada
                            </p>
                        </article>
                    </section>

                    <section className="max-w-7xl mx-auto mt-10 rounded-3xl border border-slate-200 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 p-6 text-white shadow-[0_24px_70px_-45px_rgba(249,115,22,0.75)] sm:p-8">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="max-w-2xl">
                                <p className="text-xs uppercase tracking-[0.14em] text-white/80">
                                    Pronto para reservar?
                                </p>
                                <h3 className="font-display mt-1 text-2xl font-black sm:text-3xl">
                                    Escolhe o teu próximo evento e garante já a
                                    melhor oferta de hotel.
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

                    <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
                        <SectionHeader
                            eyebrow="Popular events"
                            title="Eventos em destaque"
                        />
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {destinationCards.length > 0 ? (
                                destinationCards.map((destination) => (
                                    <article
                                        key={destination.id}
                                        className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                                    >
                                        {destination.image ? (
                                            <img
                                                src={destination.image}
                                                alt={destination.name}
                                                className="h-44 w-full object-cover transition duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="h-44 bg-slate-200" />
                                        )}
                                        <div className="p-4">
                                            <p className="text-sm font-semibold text-slate-900">
                                                {destination.name}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {destination.offers} oferta(s)
                                                disponíveis
                                            </p>
                                        </div>
                                    </article>
                                ))
                            ) : (
                                <EmptyState message="Sem eventos disponíveis para os filtros atuais." />
                            )}
                        </div>
                    </section>

                    <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
                        <SectionHeader
                            eyebrow="Explore hotels"
                            title="Seleção premium de hotéis"
                        />
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {hotelCards.length > 0 ? (
                                hotelCards.map((hotel) => (
                                    <article
                                        key={hotel.id}
                                        className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                                    >
                                        {hotel.image ? (
                                            <img
                                                src={hotel.image}
                                                alt={hotel.name}
                                                className="h-40 w-full object-cover transition duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="h-40 bg-slate-200" />
                                        )}
                                        <div className="p-4">
                                            <p className="text-sm font-semibold text-slate-900">
                                                {hotel.name}
                                            </p>
                                            <p className="mt-0.5 text-xs text-slate-500">
                                                {hotel.event}
                                            </p>
                                            <p className="mt-2 text-xs text-slate-600">
                                                {hotel.room} • {hotel.meal}
                                            </p>
                                            <p className="mt-3 text-sm font-semibold text-slate-900">
                                                desde {hotel.price.toFixed(2)}{" "}
                                                {hotel.currency}/noite
                                            </p>
                                        </div>
                                    </article>
                                ))
                            ) : (
                                <EmptyState message="Sem hotéis disponíveis para os filtros atuais." />
                            )}
                        </div>
                    </section>

                    <footer
                        id="contacto"
                        className="mt-10 bg-[#0b1220] px-6 py-8 text-slate-300 sm:px-8"
                    >
                        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-4 px-8">
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
                                    <Link href={route("contacts.index")} className="block transition hover:text-white">
                                        Contactos
                                    </Link>
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

                        <div className="mt-6 max-w-7xl mx-auto border-t px-8 border-slate-800 pt-4 text-xs text-slate-500">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <p>
                                    OptViagens © {new Date().getFullYear()} -
                                    Todos os direitos reservados.
                                </p>
                                <p>
                                    Laravel v{laravelVersion} | PHP v
                                    {phpVersion}
                                </p>
                            </div>
                        </div>
                    </footer>
                </main>
            </div>
        </>
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
}: {
    selectedEventId: string;
    setSelectedEventId: (value: string) => void;
    eventOptions: Array<{ id: number; name: string }>;
    checkIn: string;
    setCheckIn: (value: string) => void;
    checkOut: string;
    setCheckOut: (value: string) => void;
}) {
    const fieldClass =
        "w-full rounded-xl border-slate-300 bg-white text-sm shadow-sm focus:border-[#0f172a] focus:ring-[#0f172a]";

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
                            ? "Sem eventos"
                            : "Seleciona"}
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

function FeatureCard({ title, text }: { title: string; text: string }) {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="h-11 w-11 rounded-xl bg-slate-100"></div>
            <p className="mt-4 text-lg font-bold text-slate-900">{title}</p>
            <p className="mt-2 text-sm text-slate-600">{text}</p>
        </article>
    );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
    return (
        <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {eyebrow}
            </p>
            <h3 className="mt-1 text-2xl font-black text-slate-900">{title}</h3>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-sm text-slate-600">
            {message}
        </div>
    );
}
