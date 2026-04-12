import CookieConsentBanner from "@/Components/CookieConsentBanner";
import ErrorToasts from "@/Components/ErrorToasts";
import Footer from "@/Components/Footer";
import PublicHeader from "@/Components/PublicHeader";
import { Head } from "@inertiajs/react";
import { PropsWithChildren } from "react";

export default function LegalLayout({
    title,
    subtitle,
    children,
}: PropsWithChildren<{
    title: string;
    subtitle: string;
}>) {
    return (
        <>
            <Head title={title} />
            <ErrorToasts />
            <CookieConsentBanner />

            <div className="min-h-screen bg-slate-100 text-slate-900">
                <PublicHeader active="home" />

                <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
                    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Informação Legal
                        </p>
                        <h1 className="mt-2 text-3xl font-black text-slate-900">
                            {title}
                        </h1>
                        <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
                    </section>

                    <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        <div className="space-y-4 text-slate-700 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-black [&_h2]:text-slate-900 [&_li]:ml-5 [&_li]:list-disc [&_p]:leading-7">
                            {children}
                        </div>
                    </section>
                </main>
                <Footer />
            </div>
        </>
    );
}
