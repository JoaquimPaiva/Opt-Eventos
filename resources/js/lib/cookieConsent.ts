export interface CookiePreferences {
    necessary: true;
    analytics: boolean;
    personalization: boolean;
    marketing: boolean;
}

export interface StoredCookieConsent {
    version: string;
    accepted_at: string;
    method: "all" | "necessary_only" | "custom";
    preferences: CookiePreferences;
}

export const CONSENT_STORAGE_KEY = "opteventos_cookie_consent_v1";
export const CONSENT_VERSION = "2026-04-11";
export const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export const defaultCookiePreferences = (): CookiePreferences => ({
    necessary: true,
    analytics: false,
    personalization: false,
    marketing: false,
});

export const readStoredCookieConsent = (): StoredCookieConsent | null => {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw) as StoredCookieConsent;
        if (
            typeof parsed !== "object" ||
            parsed === null ||
            parsed.version !== CONSENT_VERSION
        ) {
            return null;
        }

        return parsed;
    } catch {
        return null;
    }
};

export const writeCookieConsentMarker = (
    consent: StoredCookieConsent,
): void => {
    if (typeof document === "undefined") {
        return;
    }

    const value = encodeURIComponent(
        JSON.stringify({
            version: consent.version,
            method: consent.method,
            preferences: consent.preferences,
        }),
    );
    document.cookie = `opteventos_cookie_consent=${value}; path=/; max-age=${ONE_YEAR_IN_SECONDS}; samesite=lax`;
};

export const applyConsentRuntimeFlags = (
    consent: StoredCookieConsent | null,
): void => {
    if (typeof document === "undefined") {
        return;
    }

    const root = document.documentElement;
    if (consent === null) {
        root.dataset.cookieConsentAnalytics = "0";
        root.dataset.cookieConsentPersonalization = "0";
        root.dataset.cookieConsentMarketing = "0";
        return;
    }

    root.dataset.cookieConsentAnalytics = consent.preferences.analytics
        ? "1"
        : "0";
    root.dataset.cookieConsentPersonalization = consent.preferences
        .personalization
        ? "1"
        : "0";
    root.dataset.cookieConsentMarketing = consent.preferences.marketing
        ? "1"
        : "0";
};

export const saveCookieConsent = (consent: StoredCookieConsent): void => {
    if (typeof window !== "undefined") {
        window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
        window.dispatchEvent(
            new CustomEvent("app:cookie-consent-updated", { detail: consent }),
        );
    }
    writeCookieConsentMarker(consent);
    applyConsentRuntimeFlags(consent);
};

export const canUseCookieCategory = (
    category: "analytics" | "personalization" | "marketing",
): boolean => {
    const consent = readStoredCookieConsent();
    if (consent === null) {
        return false;
    }

    return Boolean(consent.preferences[category]);
};
