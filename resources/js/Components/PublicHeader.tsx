import { assetUrl } from "@/lib/assetUrl";
import { PageProps } from "@/types";
import { Link, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

type PublicHeaderProps = {
    active?: "home" | "events" | "hotels" | "contacts";
};

export default function PublicHeader({ active = "home" }: PublicHeaderProps) {
    const pageProps = usePage<PageProps>().props;
    const user = pageProps.auth?.user;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileMenuEntering, setIsMobileMenuEntering] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const isHome = active === "home";
    const abrirMenuIcon = (
        <svg
            width="1em"
            height="1em"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="size-6 rotate-180"
        >
            <path
                fill="none"
                stroke="#000000"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M4 9h16M4 15h10"
            ></path>
        </svg>
    );
    const fecharMenuIcon = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="size-6 rotate-180"
        >
            <path
                fill="none"
                stroke="#000000"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M20 12H4"
                color="currentColor"
            ></path>
        </svg>
    );

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const onScroll = () => {
            setIsScrolled(window.scrollY > 8);
        };

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });

        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        if (!isMobileMenuOpen) {
            setIsMobileMenuEntering(false);
            return;
        }

        const animationFrame = window.requestAnimationFrame(() => {
            setIsMobileMenuEntering(true);
        });

        return () => window.cancelAnimationFrame(animationFrame);
    }, [isMobileMenuOpen]);

    const desktopLinkClass = (isActive: boolean): string => {
        const atHeroTop = isHome && !isScrolled;

        if (atHeroTop) {
            return isActive
                ? "text-black"
                : "text-slate-700/85 transition hover:text-black";
        }

        return isActive ? "text-slate-900" : "transition hover:text-slate-900";
    };

    const mobileLinkClass = (isActive: boolean): string =>
        isActive
            ? "line-through flex flex-col align-center justify-center h-20 bg-slate-900 px-12 py-2 text-sm font-semibold text-slate-100"
            : "flex flex-col justify-center rounded-lg h-20 px-7 py-2 text-sm font-semibold text-slate-700";

    return (
        <header
            className={`sticky top-0 z-40 backdrop-blur transition ${
                isHome && !isScrolled
                    ? "border-b border-transparent bg-white/10"
                    : "border-b border-slate-200/80 bg-white/95 shadow-sm"
            }`}
        >
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex items-end gap-3">
                    <Link href="/" className="flex items-center gap-3">
                        <img
                            className="max-w-[110px]"
                            src={assetUrl("/optviagens.png")}
                            alt="OptViagens"
                        />
                    </Link>
                    <span className="hidden rounded-full bg-[#0f172a] px-3 py-1.5 text-xs font-semibold text-white sm:inline-block">
                        OptEventos
                    </span>
                </div>

                <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen((current) => !current)}
                    className="relative rounded-lg md:hidden"
                >
                    <div className="relative w-6 h-6">
                        {/* Open (hamburger) */}
                        <span
                            className={`absolute inset-0 transition-all duration-300 ease-out transform ${
                                isMobileMenuOpen
                                    ? "opacity-0 scale-75 rotate-90"
                                    : "opacity-100 scale-100 rotate-0"
                            }`}
                        >
                            {abrirMenuIcon}
                        </span>

                        {/* Close */}
                        <span
                            className={`absolute inset-0 transition-all duration-300 ease-out transform ${
                                isMobileMenuOpen
                                    ? "opacity-100 scale-100 rotate-0"
                                    : "opacity-0 scale-75 -rotate-90"
                            }`}
                        >
                            {fecharMenuIcon}
                        </span>
                    </div>
                </button>

                <nav
                    className={`hidden items-center gap-8 text-sm font-medium md:flex ${
                        isHome && !isScrolled ? "text-white" : "text-slate-600"
                    }`}
                >
                    <Link
                        href="/"
                        className={desktopLinkClass(active === "home")}
                    >
                        Home
                    </Link>
                    <Link
                        href={route("events.index")}
                        className={desktopLinkClass(active === "events")}
                    >
                        Eventos
                    </Link>
                    <Link
                        href={route("hotels.index")}
                        className={desktopLinkClass(active === "hotels")}
                    >
                        Hotéis
                    </Link>
                    {/* <Link
                        href="/#como-funciona"
                        className={desktopLinkClass(false)}
                    >
                        Como funciona
                    </Link> */}
                    {/* <Link href="/#faq" className={desktopLinkClass(false)}>
                        FAQ
                    </Link> */}
                    <Link
                        href={route("contacts.index")}
                        className={desktopLinkClass(active === "contacts")}
                    >
                        Contactos
                    </Link>
                </nav>

                <div className="hidden items-center gap-2 md:flex">
                    {user ? (
                        <>
                            <Link
                                href={route("dashboard")}
                                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                                    isHome && !isScrolled
                                        ? "border border-slate-500 text-slate-500 hover:text-slate-700 hover:border-slate-700 hover:bg-slate-700/10"
                                        : "border border-slate-300 text-slate-700 hover:border-slate-500 hover:text-slate-900"
                                }`}
                            >
                                Painel
                            </Link>
                            <Link
                                href="/#search-reserva"
                                className="rounded-full bg-[#0f3a8a] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0c2f6f]"
                            >
                                Reservar agora
                            </Link>
                            <Link
                                href={route("logout")}
                                method="post"
                                as="button"
                                alt="Logout"
                                className={`text-xs font-semibold transition flex flex-col justify-center align-center text-center ${
                                    isHome && !isScrolled
                                        ? "text-slate-500 hover:text-slate-700"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                <svg
                                    className="w-10 h-6 dark:text-slate-500 hover:text-gray-900 dark:hover:text-slate-700"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M8.99994 10 7 11.9999l1.99994 2M12 5v14M5 4h14c.5523 0 1 .44772 1 1v14c0 .5523-.4477 1-1 1H5c-.55228 0-1-.4477-1-1V5c0-.55228.44772-1 1-1Z"
                                    />
                                </svg>
                                {/* Logout */}
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                href={route("login")}
                                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                                    isHome && !isScrolled
                                        ? "border border-slate-500 text-slate-500 hover:text-slate-700 hover:border-slate-700 hover:bg-slate-700/10"
                                        : "border border-slate-300 text-slate-700 hover:border-slate-500 hover:text-slate-900"
                                }`}
                            >
                                Entrar
                            </Link>
                            <Link
                                href="/#search-reserva"
                                className="rounded-full bg-[#0f3a8a] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0c2f6f]"
                            >
                                Reservar agora
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {isMobileMenuOpen ? (
                <div
                    className={`absolute w-full min-h-[100dvh] border-t border-slate-200 bg-[#f2f6f9] px-0 py-0 md:hidden transform transition-all duration-300 ease-out ${
                        isMobileMenuEntering
                            ? "translate-x-0 opacity-100"
                            : "-translate-x-24 opacity-0"
                    }`}
                >
                    <div className="flex flex-col justify-between min-h-[80dvh] gap-2">
                        <div className="flex flex-col">
                            <Link
                                href="/"
                                className={mobileLinkClass(active === "home")}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <hr />
                            <Link
                                href={route("events.index")}
                                className={mobileLinkClass(active === "events")}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Eventos
                            </Link>
                            <hr />
                            <Link
                                href={route("hotels.index")}
                                className={mobileLinkClass(active === "hotels")}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Hotéis
                            </Link>
                            <hr />
                            {/* <Link
                            href="/#como-funciona"
                            className={mobileLinkClass(false)}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Como funciona
                        </Link>
                        <Link
                            href="/#faq"
                            className={mobileLinkClass(false)}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            FAQ
                        </Link> */}
                            <Link
                                href={route("contacts.index")}
                                className={mobileLinkClass(
                                    active === "contacts",
                                )}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Contactos
                            </Link>
                        </div>
                        <div className="flex flex-col gap-2 px-7 py-2">
                            {user ? (
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
                                        href="/#search-reserva"
                                        className="rounded-lg bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white"
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                    >
                                        Reservar agora
                                    </Link>
                                    <Link
                                        href={route("logout")}
                                        method="post"
                                        as="button"
                                        className="rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700"
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
                                        href="/#search-reserva"
                                        className="rounded-lg bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white"
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                    >
                                        Reservar agora
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ) : null}
        </header>
    );
}
