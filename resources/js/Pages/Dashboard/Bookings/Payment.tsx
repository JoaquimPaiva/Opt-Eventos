import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { FormEvent, useEffect, useMemo, useState } from 'react';

interface PaymentDetail {
    booking_id: string;
    event_name: string;
    hotel_name: string;
    provider: string;
    provider_reference?: string | null;
    amount: number;
    currency: string;
    status: string;
    display_status?: string;
    due_date?: string | null;
    paid_at?: string | null;
    installment_type?: string;
    cancellation_policy: string;
    deposit_amount?: number | null;
    balance_amount?: number | null;
    balance_due_days_before_checkin?: number | null;
    deposit_due_date?: string | null;
    balance_due_date?: string | null;
    deposit_paid_at?: string | null;
    balance_paid_at?: string | null;
    is_stripe_provider: boolean;
    can_prepare_online_payment: boolean;
    can_confirm_test_payment: boolean;
}

interface PaymentPageProps {
    payment: PaymentDetail;
}

function paymentBadgeClass(status: string): string {
    return status === 'PAID'
        ? 'bg-emerald-200 text-emerald-900'
        : status === 'PARTIALLY_PAID'
            ? 'bg-sky-200 text-sky-900'
        : status === 'FAILED'
            ? 'bg-rose-200 text-rose-900'
            : status === 'REFUNDED'
                ? 'bg-cyan-200 text-cyan-900'
                : 'bg-amber-200 text-amber-900';
}

export default function BookingPayment({ payment }: PaymentPageProps) {
    const flash = usePage<PageProps>().props.flash;
    const pageErrors = usePage<PageProps & { errors?: Record<string, string> }>().props.errors ?? {};
    const { post, processing } = useForm({});
    const [intentLoading, setIntentLoading] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [onlineError, setOnlineError] = useState<string | null>(null);
    const [isSyncingRedirectPayment, setIsSyncingRedirectPayment] = useState(false);

    const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
    const stripePromise = useMemo(() => {
        if (!stripePublishableKey) {
            return null;
        }

        return loadStripe(stripePublishableKey);
    }, [stripePublishableKey]);

    const submitConfirm = (event: FormEvent) => {
        event.preventDefault();
        post(route('dashboard.bookings.payment.confirm', payment.booking_id), {
            preserveScroll: true,
        });
    };

    const prepareOnlinePayment = async () => {
        setOnlineError(null);
        setIntentLoading(true);

        try {
            const response = await axios.post(route('dashboard.bookings.payment.intent', payment.booking_id));
            const nextClientSecret = String(response.data.client_secret ?? '');
            if (nextClientSecret === '') {
                throw new Error('Credenciais de pagamento em falta');
            }
            setClientSecret(nextClientSecret);
        } catch (error: unknown) {
            const fallbackMessage = 'Não foi possível preparar o pagamento online.';
            const message = axios.isAxiosError(error)
                ? String(error.response?.data?.errors?.payment?.[0] ?? fallbackMessage)
                : fallbackMessage;
            setOnlineError(message);
        } finally {
            setIntentLoading(false);
        }
    };

    useEffect(() => {
        if (!payment.is_stripe_provider) {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const hasRedirectParams =
            params.has('payment_intent')
            || params.has('payment_intent_client_secret')
            || params.has('redirect_status');
        if (!hasRedirectParams) {
            return;
        }

        let isCancelled = false;

        const syncFromRedirect = async () => {
            setOnlineError(null);
            setIsSyncingRedirectPayment(true);

            try {
                for (let attempt = 0; attempt < 10; attempt += 1) {
                    if (isCancelled) {
                        return;
                    }

                    const response = await axios.post(route('dashboard.bookings.payment.sync-stripe', payment.booking_id));
                    const syncedStatus = String(response.data?.status ?? 'PENDING');
                    const displayStatus = String(response.data?.display_status ?? syncedStatus);

                    if (syncedStatus === 'PAID') {
                        window.location.href = route('dashboard.bookings.show', payment.booking_id);
                        return;
                    }

                    if (displayStatus === 'PARTIALLY_PAID') {
                        window.location.href = route('dashboard.bookings.payment', payment.booking_id);
                        return;
                    }

                    if (syncedStatus === 'FAILED' || syncedStatus === 'REFUNDED') {
                        break;
                    }

                    if (attempt < 9) {
                        await new Promise((resolve) => window.setTimeout(resolve, 1500));
                    }
                }
            } catch {
                if (!isCancelled) {
                    setOnlineError('Recebemos o retorno do pagamento, mas não foi possível sincronizar o estado automaticamente.');
                }
            } finally {
                if (!isCancelled) {
                    setIsSyncingRedirectPayment(false);
                    window.history.replaceState({}, '', route('dashboard.bookings.payment', payment.booking_id));
                }
            }
        };

        void syncFromRedirect();

        return () => {
            isCancelled = true;
        };
    }, [payment.booking_id, payment.is_stripe_provider]);

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-slate-800">Pagamento da Reserva</h2>}
        >
            <Head title={`Pagamento ${payment.booking_id}`} />

            <div className="bg-gradient-to-b from-slate-100 via-white to-slate-100 py-10">
                <div className="mx-auto max-w-5xl space-y-5 px-4 sm:px-6 lg:px-8">
                    <div>
                        <Link
                            href={route('dashboard.bookings.show', payment.booking_id)}
                            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                        >
                            Voltar à reserva
                        </Link>
                    </div>

                    {flash?.success ? (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                            {flash.success}
                        </div>
                    ) : null}

                    {pageErrors.payment ? (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                            {pageErrors.payment}
                        </div>
                    ) : null}

                    {onlineError ? (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                            {onlineError}
                        </div>
                    ) : null}

                    {intentLoading ? (
                        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
                            A preparar pagamento online...
                        </div>
                    ) : null}

                    {isSyncingRedirectPayment ? (
                        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
                            A sincronizar o resultado do pagamento online...
                        </div>
                    ) : null}

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 px-6 py-6 text-white">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-200">Pagamento da reserva</p>
                            <h3 className="mt-1 text-2xl font-semibold">{payment.hotel_name}</h3>
                            <p className="mt-1 text-sm text-slate-200">{payment.event_name}</p>
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                                    {payment.currency} {payment.amount.toFixed(2)}
                                </span>
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${paymentBadgeClass(payment.display_status ?? payment.status)}`}>
                                    {payment.display_status ?? payment.status}
                                </span>
                            </div>
                        </div>

                        <div className="grid gap-4 px-6 py-5 text-sm text-slate-700 md:grid-cols-2">
                            <p><span className="font-semibold text-slate-900">Reserva:</span> {payment.booking_id}</p>
                            <p><span className="font-semibold text-slate-900">Fornecedor:</span> {payment.provider}</p>
                            <p><span className="font-semibold text-slate-900">Referência:</span> {payment.provider_reference ?? 'N/D'}</p>
                            <p><span className="font-semibold text-slate-900">Vencimento:</span> {payment.due_date ?? 'N/D'}</p>
                            <p><span className="font-semibold text-slate-900">Pago em:</span> {payment.paid_at ?? 'N/D'}</p>
                            <p><span className="font-semibold text-slate-900">Montante:</span> {payment.amount.toFixed(2)} {payment.currency}</p>
                            <p>
                                <span className="font-semibold text-slate-900">Parcela atual:</span>{' '}
                                {payment.installment_type === 'DEPOSIT'
                                    ? 'Sinal'
                                    : payment.installment_type === 'BALANCE'
                                        ? 'Restante'
                                        : 'Pagamento único'}
                            </p>
                            <p>
                                <span className="font-semibold text-slate-900">Política:</span>{' '}
                                {payment.cancellation_policy === 'FREE_CANCELLATION'
                                    ? 'Cancelamento gratuito'
                                    : payment.cancellation_policy === 'NON_REFUNDABLE'
                                        ? 'Tarifa não reembolsável'
                                        : 'Sinal não reembolsável'}
                            </p>
                            {payment.cancellation_policy === 'DEPOSIT_NON_REFUNDABLE' ? (
                                <>
                                    <p>
                                        <span className="font-semibold text-slate-900">Sinal:</span>{' '}
                                        {Number(payment.deposit_amount ?? 0).toFixed(2)} {payment.currency} (não reembolsável)
                                        {' | '}vencimento {payment.deposit_due_date ?? 'N/D'}
                                        {' | '}pago em {payment.deposit_paid_at ?? 'N/D'}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-slate-900">Restante:</span>{' '}
                                        {Number(payment.balance_amount ?? 0).toFixed(2)} {payment.currency}
                                        {' | '}vencimento {payment.balance_due_date ?? 'N/D'}
                                        {' | '}pago em {payment.balance_paid_at ?? 'N/D'}
                                    </p>
                                </>
                            ) : null}
                        </div>
                    </div>

                    {payment.is_stripe_provider ? (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            {!clientSecret ? (
                                <div className="space-y-3">
                                    <p className="text-sm text-slate-600">
                                        Prepara o pagamento online seguro desta reserva.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={prepareOnlinePayment}
                                        disabled={intentLoading || !payment.can_prepare_online_payment}
                                        className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {intentLoading ? 'A preparar...' : 'Preparar pagamento online'}
                                    </button>
                                </div>
                            ) : stripePromise ? (
                                <Elements stripe={stripePromise} options={{ clientSecret }}>
                                    <StripePaymentForm bookingId={payment.booking_id} />
                                </Elements>
                            ) : (
                                <p className="text-sm text-rose-700">
                                    Falta a chave pública Stripe no ambiente frontend.
                                </p>
                            )}
                        </div>
                    ) : null}

                    {payment.can_confirm_test_payment ? (
                        <form onSubmit={submitConfirm} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
                            <p className="mb-3 text-sm text-emerald-900">
                                Confirmação de pagamento em modo teste (local/dev).
                            </p>
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {processing ? 'A confirmar...' : 'Confirmar pagamento'}
                            </button>
                        </form>
                    ) : (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
                            Esta reserva não está disponível para confirmação manual em modo teste.
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function StripePaymentForm({ bookingId }: { bookingId: string }) {
    const stripe = useStripe();
    const elements = useElements();
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const submitStripePayment = async (event: FormEvent) => {
        event.preventDefault();
        if (!stripe || !elements) {
            return;
        }

        setSubmitting(true);
        setMessage(null);

        const result = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.href,
            },
            redirect: 'if_required',
        });

        if (result.error) {
            setMessage(result.error.message ?? 'Falha ao confirmar o pagamento.');
            setSubmitting(false);
            return;
        }

        const paymentIntent = result.paymentIntent;
        if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'processing') {
            try {
                for (let attempt = 0; attempt < 5; attempt += 1) {
                    const syncResponse = await axios.post(route('dashboard.bookings.payment.sync-stripe', bookingId));
                    const syncedStatus = String(syncResponse.data?.status ?? 'PENDING');
                    const displayStatus = String(syncResponse.data?.display_status ?? syncedStatus);

                    if (syncedStatus === 'PAID') {
                        window.location.href = route('dashboard.bookings.show', bookingId);
                        return;
                    }

                    if (displayStatus === 'PARTIALLY_PAID') {
                        window.location.href = route('dashboard.bookings.payment', bookingId);
                        return;
                    }

                    if (attempt < 4) {
                        await new Promise((resolve) => window.setTimeout(resolve, 1500));
                    }
                }

                setMessage('Pagamento em processamento. Atualiza esta página dentro de alguns instantes.');
                setSubmitting(false);
                return;
            } catch {
                setMessage('Pagamento submetido, mas a sincronização falhou. Atualiza a página.');
                setSubmitting(false);
                return;
            }
        }

        setMessage(`Estado do pagamento: ${paymentIntent?.status ?? 'desconhecido'}`);
        setSubmitting(false);
    };

    return (
        <form onSubmit={submitStripePayment} className="space-y-4">
            <p className="text-sm text-slate-600">
                Introduz os dados do cartão para concluir o pagamento com segurança através da Stripe.
            </p>
            <PaymentElement />
            {message ? <p className="text-sm font-medium text-slate-700">{message}</p> : null}
            <button
                type="submit"
                disabled={!stripe || !elements || submitting}
                className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {submitting ? 'A confirmar pagamento...' : 'Pagar agora'}
            </button>
        </form>
    );
}
