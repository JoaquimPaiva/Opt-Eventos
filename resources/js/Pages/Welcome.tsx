import CookieConsentBanner from "@/Components/CookieConsentBanner";
import ErrorToasts from "@/Components/ErrorToasts";
import Footer from "@/Components/Footer";
import PublicHeader from "@/Components/PublicHeader";
import {
    PublicWelcomeAlertsSection,
    PublicWelcomeAudienceSection,
    PublicWelcomeDestinationsSection,
    PublicWelcomeFaqSection,
    PublicWelcomeFinalCtaSection,
    PublicWelcomeHeroSection,
    PublicWelcomeHotelsSection,
    PublicWelcomeHowItWorksSection,
    PublicWelcomeOrangeCtaSection,
    PublicWelcomeStatsSection,
    PublicWelcomeTickerSection,
    PublicWelcomeTransparencySection,
    PublicWelcomeVisualSection,
    PublicWelcomeLogosSection,
} from "@/Components/Publico/WelcomeSections";
import { assetUrl } from "@/lib/assetUrl";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";

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

interface LogoStripItem {
    id: number;
    name: string;
    image: string | null;
}

interface WelcomeProps {
    [key: string]: unknown;
    laravelVersion: string;
    phpVersion: string;
    featured_event_ids: number[];
    rates: RateOption[];
    logo_strip?: LogoStripItem[];
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
    laravelVersion,
    phpVersion,
    rates,
    featured_event_ids,
    logo_strip = [],
}: PageProps<WelcomeProps>) {
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [selectedEventId, setSelectedEventId] = useState("");

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
    
    const heroImage = assetUrl("/hero2.jpg");

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

        rates.forEach((rate) => {
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
            return allEvents.sort(
                (a, b) =>
                    Number(b.isFeatured) - Number(a.isFeatured) ||
                    b.offers - a.offers,
            );
        }

        return allEvents.sort((a, b) => b.offers - a.offers);
    }, [rates, featuredSet]);

    const logoStripItems = useMemo(
        () => {
            if (logo_strip.length > 0) {
                return logo_strip;
            }

            return destinationCards.map((event) => ({
                id: event.id,
                name: event.name,
                image: event.image,
            }));
        },
        [destinationCards, logo_strip],
    );

    const hotelCards = useMemo(() => {
        const uniqueHotels = new Map<
            number,
            {
                id: number;
                name: string;
                event: string;
                image: string | null;
                price: number;
                currency: string;
                room: string;
                meal: string;
                offers: number;
            }
        >();

        rates.forEach((rate) => {
            const existing = uniqueHotels.get(rate.hotel_id);
            const image = rate.hotel_images[0] ?? null;

            if (!existing) {
                uniqueHotels.set(rate.hotel_id, {
                    id: rate.hotel_id,
                    name: rate.hotel_name,
                    event: rate.event_name,
                    image,
                    price: rate.sale_price,
                    currency: rate.currency,
                    room: rate.room_type,
                    meal: rate.meal_plan,
                    offers: 1,
                });
                return;
            }

            existing.offers += 1;

            if (existing.image === null && image !== null) {
                existing.image = image;
            }

            if (rate.sale_price < existing.price) {
                existing.price = rate.sale_price;
                existing.currency = rate.currency;
                existing.room = rate.room_type;
                existing.meal = rate.meal_plan;
            }
        });

        return Array.from(uniqueHotels.values())
            .sort(
                (a, b) =>
                    b.offers - a.offers ||
                    a.price - b.price ||
                    a.name.localeCompare(b.name),
            )
            .map(({ offers: _offers, ...hotelCard }) => hotelCard);
    }, [rates]);

    const howItWorksSteps = [
        {
            title: "Escolhe o evento e as datas",
            text: "Seleciona o evento que queres visitar e define o período da tua estadia para ver apenas opções compatíveis.",
        },
        {
            title: "Compara hotéis e regimes",
            text: "Vê opções disponíveis, tipo de quarto, refeições incluídas e condições da tarifa antes de decidir.",
        },
        {
            title: "Paga com segurança e acompanha no painel",
            text: "Conclui a reserva com pagamento protegido e acompanha estado, documentação e próximos passos na tua área de cliente.",
        },
    ];

    const trustHighlights = [
        {
            title: "Disponibilidade validada",
            text: "Mostramos apenas opções ativas com stock real antes da confirmação da reserva.",
        },
        {
            title: "Políticas claras e visíveis",
            text: "Cada tarifa apresenta regras de cancelamento e condições de pagamento sem ambiguidades.",
        },
        {
            title: "Gestão centralizada da reserva",
            text: "Cliente, hotel e equipa de gestão operam na mesma plataforma com estados sempre atualizados.",
        },
        {
            title: "Suporte dedicado",
            text: "Acompanhamos reservas, alterações e pagamentos para uma experiência contínua e confiável.",
        },
    ];

    const audienceCards = [
        {
            title: "Para viajantes",
            text: "Reserva em poucos passos e acompanha pagamentos, estados e detalhes da estadia numa única área.",
        },
        {
            title: "Para hotéis parceiros",
            text: "Queres fazer parte desta iniciativa? Contacta-nos para integrar o teu hotel e alcançar mais visitantes.",
        },
        {
            title: "Para organizadores de eventos",
            text: "Tens um evento e queres promove-lo? Fala connosco para criar experiências completas.",
        },
    ];

    const faqItems = [
        {
            question: "Como funciona a reserva de hotéis por evento?",
            answer: "Selecionas o evento, defines as datas e vês apenas hotéis parceiros disponíveis para essa experiência.",
        },
        {
            question: "Posso reservar um hotel sem escolher um evento?",
            answer: "Não. As estadias disponíveis estão associadas a eventos ativos na plataforma.",
        },
        {
            question: "Como sei se há disponibilidade nas minhas datas?",
            answer: "A pesquisa mostra apenas opções compatíveis com o evento e o período selecionado.",
        },
        {
            question: "Que métodos de pagamento estão disponíveis?",
            answer: "O checkout é processado com pagamento online seguro e o estado fica sincronizado na reserva.",
        },
        {
            question: "Posso cancelar uma reserva?",
            answer: "Depende da política da tarifa escolhida. As condições são apresentadas antes da confirmação.",
        },
        {
            question: "Onde encontro as minhas faturas?",
            answer: "Depois da emissão, a fatura fica disponível na área de cliente.",
        },
        {
            question: "O que acontece se o pagamento ficar pendente?",
            answer: "A reserva mantém o estado atualizado e podes acompanhar toda a evolução no teu painel.",
        },
        {
            question: "Recebo confirmação da reserva?",
            answer: "Sim. Enviamos notificações e atualizamos o estado da reserva após validação e pagamento.",
        },
    ];

    const showcaseImages = useMemo(() => {
        const images = [
            ...destinationCards.map((destination) => destination.image),
            ...hotelCards.map((hotel) => hotel.image),
        ].filter(
            (image): image is string => typeof image === "string" && image !== "",
        );

        return Array.from(new Set(images)).slice(0, 6);
    }, [destinationCards, hotelCards]);

    return (
        <>
            <Head title="OptEventos" />
            <ErrorToasts />
            <CookieConsentBanner />

            <div className="min-h-screen bg-slate-100 text-slate-900">
                <PublicHeader active="home" />

                <main>
                    <PublicWelcomeHeroSection
                        heroImage={heroImage}
                        nextHref={nextHref}
                        nextLabel={nextLabel}
                        canProceed={canProceed}
                        hasEventSelected={hasEventSelected}
                        availableCount={selectedEventRates.length || availableRates.length}
                        selectedEventId={selectedEventId}
                        setSelectedEventId={setSelectedEventId}
                        eventOptions={eventOptions}
                        checkIn={checkIn}
                        setCheckIn={setCheckIn}
                        checkOut={checkOut}
                        setCheckOut={setCheckOut}
                    />
                    <PublicWelcomeLogosSection logos={logoStripItems} />

                    <PublicWelcomeAlertsSection
                        checkIn={checkIn}
                        checkOut={checkOut}
                        hasValidDateRange={hasValidDateRange}
                        selectedEventId={selectedEventId}
                        selectedEventRatesCount={selectedEventRates.length}
                        availableRatesCount={availableRates.length}
                    />

                    {/* <div className="h-6 w-full" /> */}

                    <PublicWelcomeStatsSection />
                    <PublicWelcomeOrangeCtaSection />
                    <PublicWelcomeDestinationsSection
                        destinationCards={destinationCards}
                    />
                    <PublicWelcomeHotelsSection hotelCards={hotelCards} />
                    <PublicWelcomeHowItWorksSection steps={howItWorksSteps} />
                    <PublicWelcomeVisualSection
                        showcaseImages={showcaseImages}
                        trustHighlights={trustHighlights}
                    />
                    <PublicWelcomeTickerSection />
                    <PublicWelcomeAudienceSection cards={audienceCards} />
                    <PublicWelcomeTransparencySection />
                    <PublicWelcomeFaqSection faqItems={faqItems} />
                    <PublicWelcomeFinalCtaSection />
                </main>
                <Footer laravelVersion={laravelVersion} phpVersion={phpVersion} />
            </div>
        </>
    );
}
