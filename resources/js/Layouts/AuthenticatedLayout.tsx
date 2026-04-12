import ApplicationLogo from "@/Components/ApplicationLogo";
import CookieConsentBanner from "@/Components/CookieConsentBanner";
import Dropdown from "@/Components/Dropdown";
import ErrorToasts from "@/Components/ErrorToasts";
import Footer from "@/Components/Footer";
import NavLink from "@/Components/NavLink";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { assetUrl } from "@/lib/assetUrl";
import { canUseCookieCategory } from "@/lib/cookieConsent";
import { PageProps } from "@/types";
import axios from "axios";
import { Link, usePage } from "@inertiajs/react";
import {
    PropsWithChildren,
    ReactNode,
    useEffect,
    useRef,
    useState,
} from "react";

interface BrowserNotificationItem {
    id: string;
    title: string;
    message: string;
    url: string;
    created_at?: string | null;
}

const urlBase64ToArrayBuffer = (base64String: string): ArrayBuffer => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let index = 0; index < rawData.length; index += 1) {
        outputArray[index] = rawData.charCodeAt(index);
    }

    return outputArray.buffer;
};

const resolveServiceWorkerPath = (): string => {
    const currentPath = window.location.pathname;

    if (currentPath === "/public" || currentPath.startsWith("/public/")) {
        return "/public/sw.js";
    }

    return "/sw.js";
};

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const pageProps = usePage<PageProps>().props;
    const user = pageProps.auth.user;
    const notifications = pageProps.notifications ?? {
        unread_count: 0,
        unread_items: [],
        read_items: [],
    };
    const unreadBadgeLabel =
        notifications.unread_count > 99
            ? "99+"
            : String(notifications.unread_count);
    const hasAnyNotifications =
        notifications.unread_items.length > 0 ||
        notifications.read_items.length > 0;
    const [allowPersonalizationCookies, setAllowPersonalizationCookies] =
        useState<boolean>(canUseCookieCategory("personalization"));
    const canUseBrowserPush =
        (user.role === "ADMIN" || user.role === "HOTEL") &&
        allowPersonalizationCookies;
    const webPushConfig = pageProps.web_push ?? {
        enabled: false,
        public_key: null,
    };
    const canUseWebPush =
        canUseBrowserPush &&
        webPushConfig.enabled &&
        typeof webPushConfig.public_key === "string" &&
        webPushConfig.public_key.length > 0 &&
        typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        "PushManager" in window;
    const browserNotificationSupported =
        typeof window !== "undefined" && "Notification" in window;
    const [browserPermission, setBrowserPermission] = useState<
        "granted" | "denied" | "default" | "unsupported"
    >(browserNotificationSupported ? Notification.permission : "unsupported");
    const [webPushActive, setWebPushActive] = useState(false);
    const seenNotificationIdsRef = useRef<Set<string>>(new Set());

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    useEffect(() => {
        const syncConsent = () => {
            setAllowPersonalizationCookies(
                canUseCookieCategory("personalization"),
            );
        };

        window.addEventListener("app:cookie-consent-updated", syncConsent);
        syncConsent();

        return () => {
            window.removeEventListener(
                "app:cookie-consent-updated",
                syncConsent,
            );
        };
    }, []);

    useEffect(() => {
        if (!canUseBrowserPush || typeof window === "undefined") {
            return;
        }

        const storageKey = `browser_push_seen_notifications_user_${user.id}`;
        const initialIds = [
            ...notifications.unread_items.map(
                (notification) => notification.id,
            ),
            ...notifications.read_items.map((notification) => notification.id),
        ];

        let storedIds: string[] = [];
        try {
            storedIds = JSON.parse(
                window.localStorage.getItem(storageKey) ?? "[]",
            ) as string[];
        } catch {
            storedIds = [];
        }

        const mergedIds = Array.from(new Set([...storedIds, ...initialIds]));
        seenNotificationIdsRef.current = new Set(mergedIds);
        window.localStorage.setItem(storageKey, JSON.stringify(mergedIds));
    }, [canUseBrowserPush, user.id]);

    const syncWebPushSubscription = async () => {
        if (
            !canUseWebPush ||
            browserPermission !== "granted" ||
            !webPushConfig.public_key
        ) {
            setWebPushActive(false);
            return;
        }

        try {
            const registration = await navigator.serviceWorker.register(
                resolveServiceWorkerPath(),
            );
            const existingSubscription =
                await registration.pushManager.getSubscription();

            const subscription =
                existingSubscription ??
                (await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToArrayBuffer(
                        webPushConfig.public_key,
                    ),
                }));

            await axios.post(
                route("push-subscriptions.store"),
                subscription.toJSON(),
            );
            setWebPushActive(true);
        } catch {
            setWebPushActive(false);
        }
    };

    useEffect(() => {
        if (
            !canUseBrowserPush ||
            browserPermission !== "granted" ||
            typeof window === "undefined" ||
            webPushActive
        ) {
            return;
        }

        const storageKey = `browser_push_seen_notifications_user_${user.id}`;
        let isActive = true;

        const pollNotifications = async () => {
            try {
                const response = await axios.get<{
                    items: BrowserNotificationItem[];
                }>(route("notifications.feed"), {
                    params: { limit: 10 },
                });
                if (!isActive) {
                    return;
                }

                const items = response.data.items ?? [];
                const unseenItems = items
                    .filter(
                        (item) => !seenNotificationIdsRef.current.has(item.id),
                    )
                    .reverse();

                if (unseenItems.length === 0) {
                    return;
                }

                unseenItems.forEach((item) => {
                    const notification = new Notification(item.title, {
                        body: item.message,
                        tag: `opteventos-${item.id}`,
                    });
                    notification.onclick = () => {
                        window.focus();
                        window.location.href = item.url;
                    };

                    seenNotificationIdsRef.current.add(item.id);
                });

                window.localStorage.setItem(
                    storageKey,
                    JSON.stringify(Array.from(seenNotificationIdsRef.current)),
                );
            } catch {
                // Ignore transient polling failures.
            }
        };

        const timer = window.setInterval(pollNotifications, 20000);
        void pollNotifications();

        return () => {
            isActive = false;
            window.clearInterval(timer);
        };
    }, [browserPermission, canUseBrowserPush, user.id, webPushActive]);

    useEffect(() => {
        if (!canUseWebPush || browserPermission !== "granted") {
            return;
        }

        void syncWebPushSubscription();
    }, [browserPermission, canUseWebPush, webPushConfig.public_key]);

    const requestBrowserPushPermission = async () => {
        if (!canUseBrowserPush || !browserNotificationSupported) {
            return;
        }

        const permission = await Notification.requestPermission();
        setBrowserPermission(permission);

        if (permission === "granted") {
            void syncWebPushSubscription();
            return;
        }

        if (
            permission === "denied" &&
            canUseWebPush &&
            "serviceWorker" in navigator
        ) {
            try {
                const registration = await navigator.serviceWorker.ready;
                const existingSubscription =
                    await registration.pushManager.getSubscription();
                if (existingSubscription) {
                    await axios.delete(route("push-subscriptions.destroy"), {
                        data: { endpoint: existingSubscription.endpoint },
                    });
                    await existingSubscription.unsubscribe();
                }
            } catch {
                // Ignore cleanup failures.
            }
            setWebPushActive(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <ErrorToasts />
            <CookieConsentBanner />
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    {/* <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" /> */}
                                    <img
                                        className="max-w-[100px] sm:max-w-[150px]"
                                        src={assetUrl("/optviagens.png")}
                                        alt="OptViagens Logo"
                                    />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 md:-my-px md:ms-10 md:flex">
                                {user.role !== "HOTEL" ? (
                                    <>
                                        <NavLink
                                            href={route("dashboard")}
                                            active={route().current(
                                                "dashboard",
                                            )}
                                        >
                                            Painel
                                        </NavLink>
                                        {/* <NavLink
                                            href={route("checkout")}
                                            active={route().current("checkout")}
                                        >
                                            Reservar
                                        </NavLink> */}
                                        <NavLink
                                            href={route(
                                                "dashboard.bookings.index",
                                            )}
                                            active={route().current(
                                                "dashboard.bookings.*",
                                            )}
                                        >
                                            Minhas Reservas
                                        </NavLink>
                                        <NavLink
                                            href={route(
                                                "dashboard.billing.index",
                                            )}
                                            active={route().current(
                                                "dashboard.billing.*",
                                            )}
                                        >
                                            Faturas
                                        </NavLink>
                                    </>
                                ) : (
                                    <>
                                        <NavLink
                                            href={route("hotel.dashboard")}
                                            active={route().current(
                                                "hotel.dashboard",
                                            )}
                                        >
                                            Painel Hotel
                                        </NavLink>
                                        <NavLink
                                            href={route("hotel.bookings.index")}
                                            active={route().current(
                                                "hotel.bookings.*",
                                            )}
                                        >
                                            Reservas Hotel
                                        </NavLink>
                                        <NavLink
                                            href={route("hotel.users.index")}
                                            active={route().current(
                                                "hotel.users.*",
                                            )}
                                        >
                                            Utilizadores Hotel
                                        </NavLink>
                                    </>
                                )}
                                {user.role === "ADMIN" ? (
                                    <NavLink
                                        href={route("admin.dashboard")}
                                        active={route().current("admin.*")}
                                    >
                                        Administração
                                    </NavLink>
                                ) : null}
                            </div>
                        </div>

                        <div className="hidden md:ms-6 md:flex md:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="relative inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                            >
                                                <span>Notificações</span>
                                                {notifications.unread_count >
                                                0 ? (
                                                    <span className="ms-2 inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-semibold text-white">
                                                        {unreadBadgeLabel}
                                                    </span>
                                                ) : null}
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content
                                        align="right"
                                        contentClasses="py-1 bg-white w-80"
                                    >
                                        <div className="border-b border-gray-100 px-4 py-2">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Notificações
                                            </p>
                                        </div>
                                        {canUseBrowserPush ? (
                                            <div className="border-b border-gray-100 px-4 py-2">
                                                {browserPermission ===
                                                "granted" ? (
                                                    <p className="text-xs text-green-700">
                                                        {webPushActive
                                                            ? "Push web ativo (funciona mesmo com o site fechado)."
                                                            : "Permissão ativa. A sincronizar push web..."}
                                                    </p>
                                                ) : browserPermission ===
                                                  "denied" ? (
                                                    <p className="text-xs text-rose-700">
                                                        Push bloqueado no
                                                        browser. Ativa nas
                                                        definições do site.
                                                    </p>
                                                ) : browserPermission ===
                                                  "unsupported" ? (
                                                    <p className="text-xs text-slate-500">
                                                        Este browser não suporta
                                                        notificações push.
                                                    </p>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            requestBrowserPushPermission
                                                        }
                                                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                                                    >
                                                        Ativar notificações push
                                                        no browser
                                                    </button>
                                                )}
                                            </div>
                                        ) : null}
                                        {notifications.unread_items.length ===
                                            0 &&
                                        notifications.read_items.length ===
                                            0 ? (
                                            <p className="px-4 py-3 text-sm text-gray-500">
                                                Não tens notificações de
                                                momento.
                                            </p>
                                        ) : (
                                            <div className="max-h-96 overflow-y-auto">
                                                {notifications.unread_items
                                                    .length > 0 ? (
                                                    <div className="border-b border-gray-100 py-1">
                                                        <p className="px-4 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                                                            Não lidas
                                                        </p>
                                                        {notifications.unread_items.map(
                                                            (notification) => (
                                                                <div
                                                                    key={
                                                                        notification.id
                                                                    }
                                                                    className="border-t border-gray-50 px-4 py-2"
                                                                >
                                                                    <p className="text-sm font-semibold text-gray-800">
                                                                        {
                                                                            notification.title
                                                                        }
                                                                    </p>
                                                                    <p className="line-clamp-2 text-xs text-gray-600">
                                                                        {
                                                                            notification.message
                                                                        }
                                                                    </p>
                                                                    <div className="mt-2 flex items-center gap-3">
                                                                        <Link
                                                                            href={
                                                                                notification.url
                                                                            }
                                                                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                                                                        >
                                                                            Abrir
                                                                        </Link>
                                                                        <Link
                                                                            href={route(
                                                                                "notifications.read",
                                                                                notification.id,
                                                                            )}
                                                                            method="post"
                                                                            as="button"
                                                                            className="text-xs font-semibold text-slate-600 hover:text-slate-800"
                                                                        >
                                                                            Marcar
                                                                            como
                                                                            lida
                                                                        </Link>
                                                                    </div>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                ) : null}

                                                {notifications.read_items
                                                    .length > 0 ? (
                                                    <details className="group px-4 py-2">
                                                        <summary className="cursor-pointer list-none text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                                                            Já lidas (
                                                            {
                                                                notifications
                                                                    .read_items
                                                                    .length
                                                            }
                                                            )
                                                        </summary>
                                                        <div className="mt-2 space-y-2">
                                                            {notifications.read_items.map(
                                                                (
                                                                    notification,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            notification.id
                                                                        }
                                                                        className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2"
                                                                    >
                                                                        <p className="text-xs font-semibold text-gray-700">
                                                                            {
                                                                                notification.title
                                                                            }
                                                                        </p>
                                                                        <p className="line-clamp-2 text-xs text-gray-500">
                                                                            {
                                                                                notification.message
                                                                            }
                                                                        </p>
                                                                        <Link
                                                                            href={
                                                                                notification.url
                                                                            }
                                                                            className="mt-1 inline-block text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                                                                        >
                                                                            Abrir
                                                                        </Link>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </details>
                                                ) : null}
                                            </div>
                                        )}
                                        {notifications.unread_count > 0 ? (
                                            <Dropdown.Link
                                                href={route(
                                                    "notifications.read-all",
                                                )}
                                                method="post"
                                                as="button"
                                                className="text-indigo-600 hover:text-indigo-500"
                                            >
                                                Marcar todas como lidas
                                            </Dropdown.Link>
                                        ) : null}
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>

                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                            >
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route("profile.edit")}
                                        >
                                            Perfil
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route("logout")}
                                            method="post"
                                            as="button"
                                        >
                                            Terminar Sessão
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center md:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                <svg
                                    width="1em"
                                    height="1em"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    className="size-6"
                                >
                                    {/* Hamburger */}
                                    <path
                                        fill="none"
                                        stroke="#000000"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.5"
                                        d="M4 9h16M4 15h10"
                                        className={`transition-all duration-300 ease-in-out origin-center ${
                                            showingNavigationDropdown
                                                ? "opacity-0 scale-75 rotate-90"
                                                : "opacity-100 scale-100 rotate-0"
                                        }`}
                                    />

                                    {/* Line (close state) */}
                                    <path
                                        fill="none"
                                        stroke="#000000"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.5"
                                        d="M20 12H4"
                                        className={`transition-all duration-300 ease-in-out origin-center ${
                                            showingNavigationDropdown
                                                ? "opacity-100 scale-100 rotate-0"
                                                : "opacity-0 scale-75 -rotate-90"
                                        }`}
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? "block" : "hidden") +
                        " md:hidden"
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        {user.role !== "HOTEL" ? (
                            <>
                                <ResponsiveNavLink
                                    href={route("dashboard")}
                                    active={route().current("dashboard")}
                                >
                                    Painel
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route("checkout")}
                                    active={route().current("checkout")}
                                >
                                    Reservar
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route("dashboard.bookings.index")}
                                    active={route().current(
                                        "dashboard.bookings.*",
                                    )}
                                >
                                    Minhas Reservas
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route("dashboard.billing.index")}
                                    active={route().current(
                                        "dashboard.billing.*",
                                    )}
                                >
                                    Faturas
                                </ResponsiveNavLink>
                            </>
                        ) : (
                            <>
                                <ResponsiveNavLink
                                    href={route("hotel.dashboard")}
                                    active={route().current("hotel.dashboard")}
                                >
                                    Painel Hotel
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route("hotel.bookings.index")}
                                    active={route().current("hotel.bookings.*")}
                                >
                                    Reservas Hotel
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route("hotel.users.index")}
                                    active={route().current("hotel.users.*")}
                                >
                                    Utilizadores Hotel
                                </ResponsiveNavLink>
                            </>
                        )}
                        {user.role === "ADMIN" ? (
                            <ResponsiveNavLink
                                href={route("admin.dashboard")}
                                active={route().current("admin.*")}
                            >
                                Administração
                            </ResponsiveNavLink>
                        ) : null}
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mx-4 mt-4 rounded-xl border border-slate-200 bg-white p-3">
                            <div className="mb-2 flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Notificações
                                </p>
                                {notifications.unread_count > 0 ? (
                                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-semibold text-white">
                                        {unreadBadgeLabel}
                                    </span>
                                ) : null}
                            </div>
                            {canUseBrowserPush ? (
                                <div className="mb-2">
                                    {browserPermission === "granted" ? (
                                        <p className="text-xs text-green-700">
                                            {webPushActive
                                                ? "Push web ativo (funciona mesmo com o site fechado)."
                                                : "Permissão ativa. A sincronizar push web..."}
                                        </p>
                                    ) : browserPermission === "denied" ? (
                                        <p className="text-xs text-rose-700">
                                            Push bloqueado no browser. Ativa nas
                                            definições do site.
                                        </p>
                                    ) : browserPermission === "unsupported" ? (
                                        <p className="text-xs text-slate-500">
                                            Este browser não suporta
                                            notificações push.
                                        </p>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={
                                                requestBrowserPushPermission
                                            }
                                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                                        >
                                            Ativar notificações push no browser
                                        </button>
                                    )}
                                </div>
                            ) : null}

                            {!hasAnyNotifications ? (
                                <p className="text-sm text-slate-500">
                                    Sem notificações de momento.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {notifications.unread_items.length > 0 ? (
                                        <div className="space-y-2">
                                            {notifications.unread_items.map(
                                                (notification) => (
                                                    <div
                                                        key={notification.id}
                                                        className="rounded-lg border border-slate-100 bg-slate-50 p-2.5"
                                                    >
                                                        <p className="text-xs font-semibold text-slate-800">
                                                            {notification.title}
                                                        </p>
                                                        <p className="line-clamp-2 text-xs text-slate-600">
                                                            {
                                                                notification.message
                                                            }
                                                        </p>
                                                        <div className="mt-1.5 flex items-center gap-3">
                                                            <Link
                                                                href={
                                                                    notification.url
                                                                }
                                                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                                                            >
                                                                Abrir
                                                            </Link>
                                                            <Link
                                                                href={route(
                                                                    "notifications.read",
                                                                    notification.id,
                                                                )}
                                                                method="post"
                                                                as="button"
                                                                className="text-xs font-semibold text-slate-600 hover:text-slate-800"
                                                            >
                                                                Marcar como lida
                                                            </Link>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    ) : null}

                                    {notifications.read_items.length > 0 ? (
                                        <details>
                                            <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Já lidas (
                                                {
                                                    notifications.read_items
                                                        .length
                                                }
                                                )
                                            </summary>
                                            <div className="mt-2 space-y-2">
                                                {notifications.read_items.map(
                                                    (notification) => (
                                                        <div
                                                            key={
                                                                notification.id
                                                            }
                                                            className="rounded-lg border border-slate-100 bg-slate-50 p-2.5"
                                                        >
                                                            <p className="text-xs font-semibold text-slate-700">
                                                                {
                                                                    notification.title
                                                                }
                                                            </p>
                                                            <p className="line-clamp-2 text-xs text-slate-500">
                                                                {
                                                                    notification.message
                                                                }
                                                            </p>
                                                            <Link
                                                                href={
                                                                    notification.url
                                                                }
                                                                className="mt-1 inline-block text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                                                            >
                                                                Abrir
                                                            </Link>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </details>
                                    ) : null}

                                    {notifications.unread_count > 0 ? (
                                        <Link
                                            href={route(
                                                "notifications.read-all",
                                            )}
                                            method="post"
                                            as="button"
                                            className="mt-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                                        >
                                            Marcar todas como lidas
                                        </Link>
                                    ) : null}
                                </div>
                            )}
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route("profile.edit")}>
                                Perfil
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route("logout")}
                                as="button"
                            >
                                Terminar Sessão
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
            <Footer />
        </div>
    );
}
