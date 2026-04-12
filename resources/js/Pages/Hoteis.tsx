import CookieConsentBanner from "@/Components/CookieConsentBanner";
import ErrorToasts from "@/Components/ErrorToasts";
import Footer from "@/Components/Footer";
import {
    PublicHotelItem,
    PublicHoteisCtaSection,
    PublicHoteisGridSection,
    PublicHoteisHeadingSection,
    PublicHoteisHeroSection,
    PublicHoteisSummarySection,
} from "@/Components/Publico/HoteisSections";
import PublicHeader from "@/Components/PublicHeader";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";

interface HoteisProps {
    [key: string]: unknown;
    hotels: PublicHotelItem[];
}

export default function Hoteis({ hotels }: PageProps<HoteisProps>) {
    return (
        <>
            <Head title="Hotéis Parceiros" />
            <ErrorToasts />
            <CookieConsentBanner />

            <div className="min-h-screen bg-[#eef2f6] text-slate-900">
                <PublicHeader active="hotels" />

                <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
                    <PublicHoteisHeroSection hotels={hotels} />
                    <PublicHoteisSummarySection hotels={hotels} />
                    <PublicHoteisHeadingSection totalHotels={hotels.length} />
                    <PublicHoteisGridSection hotels={hotels} />
                    <PublicHoteisCtaSection />
                </main>

                <Footer />
            </div>
        </>
    );
}
