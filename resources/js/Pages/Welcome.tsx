import { PageProps } from "@/types";
import { Head, Link } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";

interface RateOption {
    id: number;
    event_id: number;
    hotel_id: number;
    event_name: string;
    hotel_name: string;
    hotel_images: string[];
    room_type: string;
    meal_plan: string;
    sale_price: number;
    currency: string;
    stock: number;
    booking_start: string;
    booking_end: string;
    max_guests: number;
}

interface WelcomeProps {
    [key: string]: unknown;
    laravelVersion: string;
    phpVersion: string;
    rates: RateOption[];
}

function isDateWithinWindow(date: string, start: string, end: string): boolean {
    if (!date) {
        return true;
    }

    return date >= start && date <= end;
}

export default function Welcome({
    auth,
    laravelVersion,
    phpVersion,
    rates,
}: PageProps<WelcomeProps>) {
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [guests, setGuests] = useState("");
    const [selectedRateId, setSelectedRateId] = useState<string>("");
    const [selectedEventId, setSelectedEventId] = useState<string>("");
    const [selectedHotelId, setSelectedHotelId] = useState<string>("");
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const availableRates = useMemo(() => {
        const parsedGuestCount = Number.parseInt(guests, 10);
        const guestCount =
            Number.isFinite(parsedGuestCount) && parsedGuestCount > 0
                ? parsedGuestCount
                : null;

        return rates.filter((rate) => {
            if (rate.stock <= 0) {
                return false;
            }

            if (guestCount !== null && guestCount > rate.max_guests) {
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
    }, [rates, checkIn, checkOut, guests]);

    useEffect(() => {
        if (availableRates.length === 0) {
            setSelectedEventId("");
            setSelectedHotelId("");
            setSelectedRateId("");
            return;
        }

        if (
            selectedEventId !== "" &&
            !availableRates.some(
                (rate) => String(rate.event_id) === selectedEventId,
            )
        ) {
            setSelectedEventId("");
        }
    }, [availableRates, selectedEventId]);

    const eventOptions = useMemo(() => {
        const map = new Map<number, string>();
        availableRates.forEach((rate) => {
            if (!map.has(rate.event_id)) {
                map.set(rate.event_id, rate.event_name);
            }
        });

        return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
    }, [availableRates]);

    const hotelOptions = useMemo(() => {
        const eventId = Number.parseInt(selectedEventId, 10);
        if (!Number.isFinite(eventId)) {
            return [];
        }

        const map = new Map<number, string>();
        availableRates
            .filter((rate) => rate.event_id === eventId)
            .forEach((rate) => {
                if (!map.has(rate.hotel_id)) {
                    map.set(rate.hotel_id, rate.hotel_name);
                }
            });

        return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
    }, [availableRates, selectedEventId]);

    const mealOptions = useMemo(() => {
        const eventId = Number.parseInt(selectedEventId, 10);
        const hotelId = Number.parseInt(selectedHotelId, 10);
        if (!Number.isFinite(eventId) || !Number.isFinite(hotelId)) {
            return [];
        }

        return availableRates
            .filter(
                (rate) =>
                    rate.event_id === eventId && rate.hotel_id === hotelId,
            )
            .map((rate) => ({
                rateId: rate.id,
                label: `${rate.meal_plan} (${rate.room_type})`,
                price: `${rate.sale_price.toFixed(2)} ${rate.currency}`,
            }));
    }, [availableRates, selectedEventId, selectedHotelId]);

    useEffect(() => {
        if (hotelOptions.length === 0) {
            setSelectedHotelId("");
            return;
        }

        if (
            !hotelOptions.some((hotel) => String(hotel.id) === selectedHotelId)
        ) {
            setSelectedHotelId("");
        }
    }, [hotelOptions, selectedHotelId]);

    useEffect(() => {
        if (mealOptions.length === 0) {
            setSelectedRateId("");
            return;
        }

        if (
            !mealOptions.some((meal) => String(meal.rateId) === selectedRateId)
        ) {
            setSelectedRateId("");
        }
    }, [mealOptions, selectedRateId]);

    const selectedRate = availableRates.find(
        (rate) => rate.id.toString() === selectedRateId,
    );
    const selectedImages = selectedRate?.hotel_images ?? [];
    const selectedImageUrl = selectedImages[activeImageIndex] ?? null;

    useEffect(() => {
        setActiveImageIndex(0);
        setZoomLevel(1);
        setIsImageViewerOpen(false);
    }, [selectedRateId]);

    useEffect(() => {
        if (!isImageViewerOpen) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsImageViewerOpen(false);
            }
            if (event.key === "ArrowRight" && selectedImages.length > 1) {
                setActiveImageIndex(
                    (previous) => (previous + 1) % selectedImages.length,
                );
                setZoomLevel(1);
            }
            if (event.key === "ArrowLeft" && selectedImages.length > 1) {
                setActiveImageIndex(
                    (previous) =>
                        (previous - 1 + selectedImages.length) %
                        selectedImages.length,
                );
                setZoomLevel(1);
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isImageViewerOpen, selectedImages.length]);
    const hasValidDateRange =
        checkIn !== "" && checkOut !== "" && checkOut > checkIn;
    const checkoutQuery: Record<string, string> = {};
    if (selectedRateId !== "") {
        checkoutQuery.rate_id = selectedRateId;
    }
    if (checkIn !== "") {
        checkoutQuery.check_in = checkIn;
    }
    if (checkOut !== "") {
        checkoutQuery.check_out = checkOut;
    }
    if (guests !== "") {
        checkoutQuery.guests = guests;
    }
    const checkoutHref = route("checkout", checkoutQuery);

    return (
        <>
            <Head title="OptEventos" />

            <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
                <div className="absolute inset-x-0 top-0 -z-10 h-[440px] bg-[radial-gradient(circle_at_top_left,_#fde68a_0,_transparent_45%),radial-gradient(circle_at_top_right,_#bfdbfe_0,_transparent_48%),linear-gradient(180deg,_#ffffff_0%,_#f7f9fc_80%)]" />

                <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
                    <header className="mb-5 md:mb-10 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur sm:px-6">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                {/* <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-lg font-black text-white">
                                O
                            </div> */}
                                <img
                                    className="max-w-[100px] sm:max-w-[150px]"
                                    src="./optviagens.png"
                                    alt="OptViagens Logo"
                                />
                                <div>
                                    <p className="cursor-default uppercase tracking-[0.2em] text-slate-500 text-[10px] sm:text-sm">
                                        Maratonas
                                    </p>
                                    <p className="cursor-default font-display text-base font-bold text-orange-500 text-[12px] sm:text-lg">
                                        OptEventos
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setIsMobileMenuOpen((current) => !current)
                                }
                                className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900 sm:hidden"
                            >
                                {isMobileMenuOpen ? "Fechar" : "Menu"}
                            </button>

                            <nav className="hidden items-center gap-2 sm:flex">
                                {auth.user ? (
                                    <>
                                        {/* <Link
                                        href={route('checkout')}
                                        className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
                                    >
                                        Reserva
                                    </Link> */}
                                        <Link
                                            href={route("dashboard")}
                                            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                                        >
                                            Painel
                                        </Link>
                                        <Link
                                            href={route("logout")}
                                            method="post"
                                            as="button"
                                            className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-50"
                                        >
                                            Logout
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href={route("login")}
                                            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                                        >
                                            Entrar
                                        </Link>
                                        <Link
                                            href={route("register")}
                                            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                                        >
                                            Criar Conta
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </div>

                        {isMobileMenuOpen ? (
                            <nav className="mt-3 grid gap-2 border-t border-slate-200 pt-3 sm:hidden">
                                {auth.user ? (
                                    <>
                                        {/* <Link
                                            href={route('checkout')}
                                            className="rounded-xl border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Reserva
                                        </Link> */}
                                        <Link
                                            href={route("dashboard")}
                                            className="rounded-xl bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-slate-700"
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
                                            className="rounded-xl border border-rose-200 px-4 py-2 text-center text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-50"
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
                                            className="rounded-xl border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                        >
                                            Entrar
                                        </Link>
                                        <Link
                                            href={route("register")}
                                            className="rounded-xl bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-slate-700"
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                        >
                                            Criar Conta
                                        </Link>
                                    </>
                                )}
                            </nav>
                        ) : null}
                    </header>

                    <main className="space-y-14">
                        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.45)] sm:p-10">
                                <p className="mb-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-[10px] md:text-xs font-semibold uppercase tracking-[0.14em] text-amber-800">
                                    O teu Evento, O teu Hotel, A tua Reserva
                                </p>
                                <h1 className="font-display max-w-2xl text-[25px] md:text-4xl font-black leading-tight text-slate-900 sm:text-5xl">
                                    Escolhe o teu evento e encontra a melhor
                                    oferta de hotel para a tua experiência.
                                </h1>
                                <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                                    A OptViagens simplifica todo o processo para
                                    não perderes tempo à procura do hotel certo.
                                    Escolhe o evento, compara as opções mais
                                    relevantes e faz o checkout em poucos
                                    passos, com tudo preparado para viajar com
                                    tranquilidade.
                                </p>
                            </div>

                            <aside className="rounded-3xl border border-slate-200 bg-slate-900 p-7 text-white shadow-[0_24px_70px_-40px_rgba(15,23,42,0.6)] sm:p-9">
                                <p className="text-xs uppercase tracking-[0.14em] text-slate-300">
                                    Como funciona
                                </p>
                                <ol className="mt-6 space-y-4 text-sm">
                                    <li className="rounded-2xl border border-white/15 bg-white/5 p-4">
                                        <p className="font-semibold">
                                            1. Escolhe o evento
                                        </p>
                                        <p className="mt-1 text-slate-300">
                                            Seleciona a opção que queres viver e
                                            define as datas.
                                        </p>
                                    </li>
                                    <li className="rounded-2xl border border-white/15 bg-white/5 p-4">
                                        <p className="font-semibold">
                                            2. Recebe a melhor oferta de hotel
                                        </p>
                                        <p className="mt-1 text-slate-300">
                                            Comparamos disponibilidade e
                                            apresentamos a tarifa certa para o
                                            evento.
                                        </p>
                                    </li>
                                    <li className="rounded-2xl border border-white/15 bg-white/5 p-4">
                                        <p className="font-semibold">
                                            3. Reserva e paga com confiança
                                        </p>
                                        <p className="mt-1 text-slate-300">
                                            Finalizas no checkout com segurança
                                            e confirmação imediata.
                                        </p>
                                    </li>
                                </ol>
                            </aside>
                        </section>

                        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                                    -3 min
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
                                    9-21h
                                </p>
                                <p className="mt-1 text-sm text-slate-600">
                                    acompanhamento em toda a jornada
                                </p>
                            </article>
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 p-6 text-white shadow-[0_24px_70px_-45px_rgba(249,115,22,0.75)] sm:p-8">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="max-w-2xl">
                                    <p className="text-xs uppercase tracking-[0.14em] text-white/80">
                                        Pronto para reservar?
                                    </p>
                                    <h3 className="font-display mt-1 text-2xl font-black sm:text-3xl">
                                        Escolhe o teu próximo evento e garante
                                        já a melhor oferta de hotel.
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

                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.55)] sm:p-8">
                            <div className="flex flex-wrap items-end justify-between gap-3">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                                        Planeador de Evento
                                    </p>
                                    <h2 className="font-display mt-1 text-2xl font-extrabold text-slate-900">
                                        Escolhe o evento, nós tratamos do hotel
                                        ideal
                                    </h2>
                                </div>
                                <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                    {availableRates.length} ofertas disponíveis
                                </p>
                            </div>

                            <div className="mt-6 grid gap-4 md:grid-cols-6">
                                <label className="block">
                                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Check-in
                                    </span>
                                    <input
                                        type="date"
                                        value={checkIn}
                                        placeholder="Seleciona a data de check-in"
                                        onChange={(event) =>
                                            setCheckIn(event.target.value)
                                        }
                                        className="w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-orange-400 focus:ring-orange-400"
                                    />
                                </label>
                                <label className="block">
                                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Check-out
                                    </span>
                                    <input
                                        type="date"
                                        value={checkOut}
                                        placeholder="Seleciona a data de check-out"
                                        onChange={(event) =>
                                            setCheckOut(event.target.value)
                                        }
                                        className="w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-orange-400 focus:ring-orange-400"
                                    />
                                </label>
                                <label className="block">
                                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Hóspedes
                                    </span>
                                    <input
                                        type="number"
                                        min={1}
                                        max={10}
                                        placeholder="1"
                                        value={guests}
                                        onChange={(event) =>
                                            setGuests(event.target.value)
                                        }
                                        className="w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-orange-400 focus:ring-orange-400"
                                    />
                                </label>
                                <label className="block">
                                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Evento
                                    </span>
                                    <select
                                        value={selectedEventId}
                                        onChange={(event) =>
                                            setSelectedEventId(
                                                event.target.value,
                                            )
                                        }
                                        className="w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-orange-400 focus:ring-orange-400"
                                        disabled={eventOptions.length === 0}
                                    >
                                        <option value="">
                                            {eventOptions.length === 0
                                                ? "Sem eventos"
                                                : "Seleciona um evento"}
                                        </option>
                                        {eventOptions.map((eventOption) => (
                                            <option
                                                key={eventOption.id}
                                                value={eventOption.id}
                                            >
                                                {eventOption.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="block">
                                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Hotel
                                    </span>
                                    <select
                                        value={selectedHotelId}
                                        onChange={(event) =>
                                            setSelectedHotelId(
                                                event.target.value,
                                            )
                                        }
                                        className="w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-orange-400 focus:ring-orange-400"
                                        disabled={hotelOptions.length === 0}
                                    >
                                        <option value="">
                                            {hotelOptions.length === 0
                                                ? "Seleciona primeiro um evento"
                                                : "Seleciona um hotel"}
                                        </option>
                                        {hotelOptions.map((hotelOption) => (
                                            <option
                                                key={hotelOption.id}
                                                value={hotelOption.id}
                                            >
                                                {hotelOption.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="block">
                                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Regime
                                    </span>
                                    <select
                                        value={selectedRateId}
                                        onChange={(event) =>
                                            setSelectedRateId(
                                                event.target.value,
                                            )
                                        }
                                        className="w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-orange-400 focus:ring-orange-400"
                                        disabled={mealOptions.length === 0}
                                    >
                                        <option value="">
                                            {mealOptions.length === 0
                                                ? "Seleciona primeiro evento e hotel"
                                                : "Seleciona o regime"}
                                        </option>
                                        {mealOptions.map((mealOption) => (
                                            <option
                                                key={mealOption.rateId}
                                                value={mealOption.rateId}
                                            >
                                                {mealOption.label} -{" "}
                                                {mealOption.price}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            {checkIn !== "" &&
                            checkOut !== "" &&
                            !hasValidDateRange ? (
                                <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                                    A data de check-out tem de ser posterior ao
                                    check-in.
                                </p>
                            ) : null}

                            {selectedRate ? (
                                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 sm:p-5">
                                    <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                                        <div>
                                            {selectedImageUrl ? (
                                                <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-black">
                                                    <img
                                                        src={selectedImageUrl}
                                                        alt={
                                                            selectedRate.hotel_name
                                                        }
                                                        className="h-52 w-full object-cover sm:h-72"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setZoomLevel(1);
                                                            setIsImageViewerOpen(
                                                                true,
                                                            );
                                                        }}
                                                        className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-900 shadow-sm transition hover:bg-white"
                                                    >
                                                        Zoom
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="grid h-56 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-100 text-sm text-slate-500 sm:h-72">
                                                    Sem fotos disponíveis
                                                </div>
                                            )}

                                            {selectedImages.length > 1 ? (
                                                <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                                                    {selectedImages.map(
                                                        (image, index) => (
                                                            <button
                                                                key={`${image}-${index}`}
                                                                type="button"
                                                                onClick={() =>
                                                                    setActiveImageIndex(
                                                                        index,
                                                                    )
                                                                }
                                                                className={`overflow-hidden rounded-lg border ${
                                                                    index ===
                                                                    activeImageIndex
                                                                        ? "border-orange-500 ring-2 ring-orange-200"
                                                                        : "border-slate-200"
                                                                }`}
                                                            >
                                                                <img
                                                                    src={image}
                                                                    alt={`${selectedRate.hotel_name} ${index + 1}`}
                                                                    className="h-14 w-full object-cover"
                                                                />
                                                            </button>
                                                        ),
                                                    )}
                                                </div>
                                            ) : null}
                                        </div>

                                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                                            <p className="font-display text-lg font-bold text-slate-900">
                                                {selectedRate.hotel_name}
                                            </p>
                                            <p className="text-sm text-slate-600">
                                                {selectedRate.event_name}
                                            </p>

                                            <div className="mt-4 space-y-2">
                                                <p>
                                                    <span className="font-semibold text-slate-900">
                                                        Quarto / Regime:
                                                    </span>{" "}
                                                    {selectedRate.room_type} /{" "}
                                                    {selectedRate.meal_plan}
                                                </p>
                                                <p>
                                                    <span className="font-semibold text-slate-900">
                                                        Janela de reserva:
                                                    </span>{" "}
                                                    {selectedRate.booking_start}{" "}
                                                    até{" "}
                                                    {selectedRate.booking_end}
                                                </p>
                                                <p>
                                                    <span className="font-semibold text-slate-900">
                                                        Hóspedes máximos:
                                                    </span>{" "}
                                                    {selectedRate.max_guests}
                                                </p>
                                                <p>
                                                    <span className="font-semibold text-slate-900">
                                                        Disponibilidade:
                                                    </span>{" "}
                                                    {selectedRate.stock}
                                                </p>
                                            </div>

                                            <div className="mt-5 rounded-xl bg-orange-50 px-4 py-3">
                                                <p className="text-xs uppercase tracking-wide text-orange-700">
                                                    Preço por noite
                                                </p>
                                                <p className="font-display text-2xl font-extrabold text-orange-700">
                                                    {selectedRate.sale_price.toFixed(
                                                        2,
                                                    )}{" "}
                                                    {selectedRate.currency}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link
                                    href={checkoutHref}
                                    className={`rounded-xl px-5 py-3 text-sm font-bold text-white transition ${
                                        selectedRate && hasValidDateRange
                                            ? "bg-orange-500 hover:bg-orange-400"
                                            : "pointer-events-none bg-slate-400"
                                    }`}
                                >
                                    Ver esta oferta no checkout
                                </Link>
                                {!auth.user ? (
                                    <p className="self-center text-sm text-slate-600">
                                        Ao continuar, entras no checkout com a
                                        oferta do evento já selecionada.
                                    </p>
                                ) : null}
                            </div>
                        </section>

                        <section className="grid gap-4 md:grid-cols-3">
                            <article className="rounded-2xl border border-slate-200 bg-white p-6">
                                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                                    Seleção inteligente
                                </p>
                                <h3 className="font-display mt-2 text-xl font-bold text-slate-900">
                                    Oferta certa para cada evento
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                    Não perdes tempo a comparar dezenas de
                                    sites. Mostramos apenas opções relevantes
                                    para o contexto do evento.
                                </p>
                            </article>
                            <article className="rounded-2xl border border-slate-200 bg-white p-6">
                                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                                    Experiência visual
                                </p>
                                <h3 className="font-display mt-2 text-xl font-bold text-slate-900">
                                    Imagens reais e detalhadas
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                    Vês logo o que estás a reservar com previews
                                    reais do hotel, para decidir com confiança.
                                </p>
                            </article>
                            <article className="rounded-2xl border border-slate-200 bg-white p-6">
                                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                                    Reserva rápida
                                </p>
                                <h3 className="font-display mt-2 text-xl font-bold text-slate-900">
                                    Fluxo simples e seguro
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                    Escolhes evento, hotel e regime em poucos
                                    passos e segues para checkout com tudo
                                    preparado.
                                </p>
                            </article>
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                                        FAQ rápida
                                    </p>
                                    <h3 className="font-display mt-1 text-2xl font-extrabold text-slate-900">
                                        Perguntas frequentes
                                    </h3>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                        <p className="font-semibold text-slate-900">
                                            Posso reservar para eventos futuros?
                                        </p>
                                        <p className="mt-1 text-slate-600">
                                            Sim. Mostramos eventos com janela de
                                            reserva ativa ou prestes a abrir.
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                        <p className="font-semibold text-slate-900">
                                            Recebo confirmação por email?
                                        </p>
                                        <p className="mt-1 text-slate-600">
                                            Sim. Enviamos emails para reserva
                                            criada, pagamento confirmado e
                                            atualizações importantes.
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                        <p className="font-semibold text-slate-900">
                                            Posso gerir tudo no meu dashboard?
                                        </p>
                                        <p className="mt-1 text-slate-600">
                                            Sim. Tens acesso a reservas, estado
                                            de pagamento e notificações no topo
                                            da plataforma.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </main>

                    <footer className="mt-12 overflow-hidden rounded-3xl border border-slate-200 bg-white">
                        <div className="grid gap-8 px-6 py-8 md:grid-cols-4 sm:px-8">
                            <div className="md:col-span-2">
                                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                                    OptViagens
                                </p>
                                <h3 className="font-display mt-2 text-2xl font-black text-slate-900">
                                    A tua estadia perfeita para viver o melhor
                                    de cada evento.
                                </h3>
                                <p className="mt-3 max-w-xl text-sm text-slate-600">
                                    Plataforma focada em reservas para eventos,
                                    com ofertas selecionadas, pagamento seguro e
                                    acompanhamento completo.
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                                        Eventos selecionados
                                    </span>
                                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                                        Pagamento online
                                    </span>
                                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                                        Suporte dedicado
                                    </span>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                                    Navegacao
                                </p>
                                <div className="mt-3 space-y-2 text-sm">
                                    {/* <Link href={route('checkout')} className="block text-slate-700 hover:text-slate-900">Checkout</Link> */}
                                    <Link
                                        href={route("dashboard")}
                                        className="block text-slate-700 hover:text-slate-900"
                                    >
                                        Painel
                                    </Link>
                                    {auth.user ? (
                                        <Link
                                            href={route(
                                                "dashboard.bookings.index",
                                            )}
                                            className="block text-slate-700 hover:text-slate-900"
                                        >
                                            Minhas reservas
                                        </Link>
                                    ) : (
                                        <Link
                                            href={route("login")}
                                            className="block text-slate-700 hover:text-slate-900"
                                        >
                                            Entrar
                                        </Link>
                                    )}
                                </div>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                                    Contactos
                                </p>
                                <div className="mt-3 space-y-2 text-sm text-slate-700">
                                    <p>support@optviagens.pt</p>
                                    <p>+351 210 000 000</p>
                                    <p>Lisboa, Portugal</p>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 text-xs text-slate-500 sm:px-8">
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
                </div>
            </div>

            {isImageViewerOpen && selectedImageUrl ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
                    <button
                        type="button"
                        onClick={() => setIsImageViewerOpen(false)}
                        className="absolute right-4 top-4 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-900"
                    >
                        Fechar
                    </button>

                    <div className="relative w-full max-w-6xl">
                        <div className="mb-3 flex items-center justify-between gap-3 text-white">
                            <p className="text-sm font-semibold">
                                {selectedRate?.hotel_name}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setZoomLevel((current) =>
                                            Math.max(
                                                1,
                                                Number(
                                                    (current - 0.25).toFixed(2),
                                                ),
                                            ),
                                        )
                                    }
                                    className="rounded bg-white/15 px-3 py-1 text-sm font-bold hover:bg-white/25"
                                >
                                    -
                                </button>
                                <span className="text-xs">
                                    {Math.round(zoomLevel * 100)}%
                                </span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setZoomLevel((current) =>
                                            Math.min(
                                                3,
                                                Number(
                                                    (current + 0.25).toFixed(2),
                                                ),
                                            ),
                                        )
                                    }
                                    className="rounded bg-white/15 px-3 py-1 text-sm font-bold hover:bg-white/25"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="relative overflow-hidden rounded-xl border border-white/20 bg-black">
                            <img
                                src={selectedImageUrl}
                                alt={selectedRate?.hotel_name}
                                className="mx-auto max-h-[78vh] w-auto transition-transform duration-200"
                                style={{
                                    transform: `scale(${zoomLevel})`,
                                    transformOrigin: "center center",
                                }}
                            />
                        </div>

                        {selectedImages.length > 1 ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveImageIndex(
                                            (previous) =>
                                                (previous -
                                                    1 +
                                                    selectedImages.length) %
                                                selectedImages.length,
                                        );
                                        setZoomLevel(1);
                                    }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 px-3 py-2 text-sm font-bold text-slate-900"
                                >
                                    ‹
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveImageIndex(
                                            (previous) =>
                                                (previous + 1) %
                                                selectedImages.length,
                                        );
                                        setZoomLevel(1);
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 px-3 py-2 text-sm font-bold text-slate-900"
                                >
                                    ›
                                </button>
                            </>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </>
    );
}
