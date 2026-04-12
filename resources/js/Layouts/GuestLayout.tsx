import ApplicationLogo from "@/Components/ApplicationLogo";
import CookieConsentBanner from "@/Components/CookieConsentBanner";
import ErrorToasts from "@/Components/ErrorToasts";
import { Link } from "@inertiajs/react";
import { PropsWithChildren } from "react";

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="relative flex min-h-screen flex-col items-center bg-slate-100 px-4 pb-8 pt-6 sm:justify-center sm:pt-0">
            <ErrorToasts />
            <CookieConsentBanner />
            <div className="absolute inset-x-0 top-0 -z-10 h-[380px] bg-[radial-gradient(circle_at_top_left,_#fde68a_0,_transparent_42%),radial-gradient(circle_at_top_right,_#bfdbfe_0,_transparent_46%),linear-gradient(180deg,_#ffffff_0%,_#f1f5f9_80%)]" />
            <div className="mb-2">
                <Link href="/">
                    <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" />
                </Link>
            </div>

            <div className="mt-4 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.5)] sm:max-w-lg sm:px-8">
                {children}
            </div>
        </div>
    );
}
