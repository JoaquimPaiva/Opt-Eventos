import CookieConsentBanner from "@/Components/CookieConsentBanner";
import ErrorToasts from "@/Components/ErrorToasts";
import Footer from "@/Components/Footer";
import {
    PublicContactosChannelsSection,
    PublicContactosHeroSection,
    PublicContactosInfoSection,
} from "@/Components/Publico/ContactosSections";
import PublicHeader from "@/Components/PublicHeader";
import { Head } from "@inertiajs/react";

export default function Contactos() {
    return (
        <>
            <Head title="Contactos" />
            <ErrorToasts />
            <CookieConsentBanner />

            <div className="min-h-screen bg-slate-100 text-slate-900">
                <PublicHeader active="contacts" />

                <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    <PublicContactosHeroSection />
                    <PublicContactosChannelsSection />
                    <PublicContactosInfoSection />
                </main>

                <Footer />
            </div>
        </>
    );
}
