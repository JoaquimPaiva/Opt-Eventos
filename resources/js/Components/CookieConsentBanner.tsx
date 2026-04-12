import { Link } from "@inertiajs/react";
import axios from "axios";
import { useEffect, useState } from "react";
import {
    CONSENT_VERSION,
    CookiePreferences,
    StoredCookieConsent,
    applyConsentRuntimeFlags,
    defaultCookiePreferences,
    readStoredCookieConsent,
    saveCookieConsent,
} from "@/lib/cookieConsent";

export default function CookieConsentBanner() {
    const [isReady, setIsReady] = useState(false);
    const [showBanner, setShowBanner] = useState(false);
    const [isCustomizing, setIsCustomizing] = useState(false);
    const [preferences, setPreferences] = useState<CookiePreferences>(
        defaultCookiePreferences,
    );

    useEffect(() => {
        const stored = readStoredCookieConsent();
        if (stored) {
            setPreferences(stored.preferences);
            setShowBanner(false);
            applyConsentRuntimeFlags(stored);
        } else {
            setShowBanner(true);
            applyConsentRuntimeFlags(null);
        }
        setIsReady(true);
    }, []);

    const persist = (
        method: StoredCookieConsent["method"],
        nextPreferences: CookiePreferences,
    ) => {
        const payload: StoredCookieConsent = {
            version: CONSENT_VERSION,
            accepted_at: new Date().toISOString(),
            method,
            preferences: nextPreferences,
        };
        saveCookieConsent(payload);
        void axios
            .post(route("legal.cookie-consent.store"), payload)
            .catch(() => {
                // Mantém experiência do utilizador mesmo que o registo técnico falhe.
            });
        setPreferences(nextPreferences);
        setShowBanner(false);
        setIsCustomizing(false);
    };

    const acceptAll = () => {
        persist("all", {
            necessary: true,
            analytics: true,
            personalization: true,
            marketing: true,
        });
    };

    const rejectOptional = () => {
        persist("necessary_only", defaultCookiePreferences());
    };

    const saveCustom = () => {
        persist("custom", {
            ...preferences,
            necessary: true,
        });
    };

    if (!isReady) {
        return null;
    }

    return (
        <>
            {showBanner ? (
                <div className="fixed inset-x-0 bottom-4 z-[130] px-3 sm:bottom-6 sm:px-6">
                    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white/95 shadow-xl backdrop-blur sm:rounded-3xl">
                        <div className="flex w-full flex-col gap-4 px-4 py-4 sm:px-5 sm:py-5">
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-slate-900">
                                    Privacidade e cookies
                                </p>
                                <p className="text-sm text-slate-600">
                                    Utilizamos cookies necessários para o funcionamento do site e, com a tua permissão, cookies opcionais para melhorar a experiência.
                                    Podes alterar a tua escolha em qualquer momento.
                                </p>
                                <p className="text-xs text-slate-500">
                                    Consulta a{" "}
                                    <Link
                                        href={route("legal.cookies")}
                                        className="font-semibold text-slate-700 underline hover:text-slate-900"
                                    >
                                        Política de Cookies
                                    </Link>
                                    , a{" "}
                                    <Link
                                        href={route("legal.privacy")}
                                        className="font-semibold text-slate-700 underline hover:text-slate-900"
                                    >
                                        Política de Privacidade
                                    </Link>{" "}
                                    e os{" "}
                                    <Link
                                        href={route("legal.terms")}
                                        className="font-semibold text-slate-700 underline hover:text-slate-900"
                                    >
                                        Termos e Condições
                                    </Link>
                                    .
                                </p>
                            </div>

                            {isCustomizing ? (
                                <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 sm:grid-cols-2">
                                    <CookieToggle
                                        title="Cookies necessários"
                                        description="Essenciais para segurança, sessão e funcionamento."
                                        checked={true}
                                        disabled
                                        onChange={() => undefined}
                                    />
                                    <CookieToggle
                                        title="Cookies analíticos"
                                        description="Ajudam-nos a perceber a utilização do site."
                                        checked={preferences.analytics}
                                        onChange={(checked) =>
                                            setPreferences((previous) => ({
                                                ...previous,
                                                analytics: checked,
                                            }))
                                        }
                                    />
                                    <CookieToggle
                                        title="Cookies de personalização"
                                        description="Permitem adaptar conteúdos e preferências."
                                        checked={preferences.personalization}
                                        onChange={(checked) =>
                                            setPreferences((previous) => ({
                                                ...previous,
                                                personalization: checked,
                                            }))
                                        }
                                    />
                                    <CookieToggle
                                        title="Cookies de marketing"
                                        description="Usados para campanhas e medição publicitária."
                                        checked={preferences.marketing}
                                        onChange={(checked) =>
                                            setPreferences((previous) => ({
                                                ...previous,
                                                marketing: checked,
                                            }))
                                        }
                                    />
                                </div>
                            ) : null}

                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={acceptAll}
                                    className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-black sm:w-auto"
                                >
                                    Aceitar todos
                                </button>
                                <button
                                    type="button"
                                    onClick={rejectOptional}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
                                >
                                    Recusar opcionais
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        isCustomizing
                                            ? saveCustom()
                                            : setIsCustomizing(true)
                                    }
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
                                >
                                    {isCustomizing
                                        ? "Guardar preferências"
                                        : "Personalizar"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => {
                        setShowBanner(true);
                        setIsCustomizing(true);
                    }}
                    className="fixed bottom-4 left-4 z-[120] rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-md transition hover:bg-slate-50"
                >
                    <svg
                        className="h-6 w-6 text-gray-800"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke="black"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8.65692 9.41494h.01M7.27103 13h.01m7.67737 1.9156h.01M10.9999 17h.01m3.178-10.90671c-.8316.38094-1.8475.22903-2.5322-.45571-.3652-.36522-.5789-.82462-.6409-1.30001-.0574-.44-.0189-.98879.1833-1.39423-1.99351.20001-3.93304 1.06362-5.46025 2.59083-3.51472 3.51472-3.51472 9.21323 0 12.72793 3.51471 3.5147 9.21315 3.5147 12.72795 0 1.5601-1.5602 2.4278-3.5507 2.6028-5.5894-.2108.008-.6725.0223-.8328.0157-.635.0644-1.2926-.1466-1.779-.633-.3566-.3566-.5651-.8051-.6257-1.2692-.0561-.4293.0145-.87193.2117-1.26755-.1159.20735-.2619.40237-.4381.57865-1.0283 1.0282-2.6953 1.0282-3.7235 0-1.0282-1.02824-1.0282-2.69531 0-3.72352.0977-.09777.2013-.18625.3095-.26543"
                        />
                    </svg>
                </button>
            )}
        </>
    );
}

function CookieToggle({
    title,
    description,
    checked,
    disabled = false,
    onChange,
}: {
    title: string;
    description: string;
    checked: boolean;
    disabled?: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
            <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={(event) => onChange(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <span>
                <span className="block text-sm font-semibold text-slate-900">
                    {title}
                </span>
                <span className="block text-xs text-slate-600">
                    {description}
                </span>
            </span>
        </label>
    );
}
