import { PageProps } from "@/types";
import { usePage } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";

interface ToastItem {
    id: string;
    message: string;
}

interface AppErrorEvent extends Event {
    detail?: string;
}

const AUTO_CLOSE_MS = 6500;

const normalizeErrorMessages = (
    errors: Record<string, unknown> | undefined,
): string[] => {
    if (!errors) {
        return [];
    }

    const messages: string[] = [];
    Object.values(errors).forEach((value) => {
        if (typeof value === "string" && value.trim() !== "") {
            messages.push(value.trim());
            return;
        }

        if (Array.isArray(value)) {
            value.forEach((item) => {
                if (typeof item === "string" && item.trim() !== "") {
                    messages.push(item.trim());
                }
            });
        }
    });

    return messages;
};

export const emitAppErrorToast = (message: string): void => {
    if (typeof window === "undefined" || message.trim() === "") {
        return;
    }

    window.dispatchEvent(
        new CustomEvent<string>("app:error", { detail: message.trim() }),
    );
};

export default function ErrorToasts() {
    const page = usePage<
        PageProps & {
            errors?: Record<string, unknown>;
        }
    >();
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const shownMessagesRef = useRef<Set<string>>(new Set());
    const timeoutIdsRef = useRef<number[]>([]);

    const pushToast = (message: string) => {
        if (message.trim() === "") {
            return;
        }

        const signature = message.trim();
        if (shownMessagesRef.current.has(signature)) {
            return;
        }
        shownMessagesRef.current.add(signature);

        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        setToasts((previous) => [...previous, { id, message: signature }]);

        const timeoutId = window.setTimeout(() => {
            setToasts((previous) =>
                previous.filter((toast) => toast.id !== id),
            );
            shownMessagesRef.current.delete(signature);
        }, AUTO_CLOSE_MS);
        timeoutIdsRef.current.push(timeoutId);
    };

    useEffect(() => {
        if (page.props.flash?.error) {
            pushToast(page.props.flash.error);
        }

        normalizeErrorMessages(page.props.errors).forEach((message) => {
            pushToast(message);
        });
    }, [page.props.flash?.error, page.props.errors]);

    useEffect(() => {
        const onAppError = (event: Event) => {
            const customEvent = event as AppErrorEvent;
            if (typeof customEvent.detail === "string") {
                pushToast(customEvent.detail);
            }
        };

        window.addEventListener("app:error", onAppError);
        return () => {
            window.removeEventListener("app:error", onAppError);
            timeoutIdsRef.current.forEach((timeoutId) => {
                window.clearTimeout(timeoutId);
            });
            timeoutIdsRef.current = [];
        };
    }, []);

    if (toasts.length === 0) {
        return null;
    }

    return (
        <div className="pointer-events-none fixed right-2 top-2 z-[120] flex w-[min(94vw,420px)] flex-col gap-2 sm:right-5 sm:top-5">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className="pointer-events-auto rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800 shadow-lg shadow-rose-900/10"
                    role="alert"
                    aria-live="assertive"
                >
                    <div className="flex items-start justify-between gap-3">
                        <p className="leading-5">{toast.message}</p>
                        <button
                            type="button"
                            onClick={() => {
                                setToasts((previous) =>
                                    previous.filter(
                                        (current) => current.id !== toast.id,
                                    ),
                                );
                                shownMessagesRef.current.delete(toast.message);
                            }}
                            className="rounded-md px-2 py-0.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
