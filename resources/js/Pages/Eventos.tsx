import CookieConsentBanner from "@/Components/CookieConsentBanner";
import ErrorToasts from "@/Components/ErrorToasts";
import Footer from "@/Components/Footer";
import {
    PublicEventosCtaSection,
    PublicEventItem,
    PublicEventosGridSection,
    PublicEventosHeadingSection,
    PublicEventosHeroSection,
    PublicEventosSummarySection,
} from "@/Components/Publico/EventosSections";
import PublicHeader from "@/Components/PublicHeader";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";

interface EventosProps {
    [key: string]: unknown;
    events: PublicEventItem[];
}

export default function Eventos({ events }: PageProps<EventosProps>) {
    return (
        <>
            <Head title="Eventos" />
            <ErrorToasts />
            <CookieConsentBanner />

            <div className="min-h-screen bg-[#eef2f6] text-slate-900">
                <PublicHeader active="events" />

                <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
                    <PublicEventosHeroSection events={events} />
                    <PublicEventosSummarySection events={events} />
                    <PublicEventosHeadingSection totalEvents={events.length} />
                    <PublicEventosGridSection events={events} />
                    <PublicEventosCtaSection />
                </main>

                <Footer />
            </div>
        </>
    );
}
