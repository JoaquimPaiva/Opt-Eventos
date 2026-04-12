import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Checkbox from '@/Components/Checkbox';
import { PageProps } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { FormEvent, useMemo, useState } from 'react';

interface RateOption {
    id: number;
    event_id: number;
    hotel_id: number;
    event_name: string;
    event_location: string;
    event_start_date: string | null;
    event_end_date: string | null;
    hotel_name: string;
    hotel_address: string;
    hotel_description?: string | null;
    hotel_website_url?: string | null;
    hotel_images: string[];
    room_type: string;
    meal_plan: string;
    sale_price: number;
    currency: string;
    stock: number;
    booking_start: string | null;
    booking_end: string | null;
    max_guests: number;
    cancellation_policy: string;
    deposit_amount?: number | null;
    balance_due_days_before_checkin?: number | null;
    cancellation_deadline?: string | null;
}

interface CheckoutPaymentProps {
    rate: RateOption;
    prefill?: {
        check_in?: string;
        check_out?: string;
        guests?: string;
    };
}

const formatDate = (date: string | null | undefined): string => {
    if (!date) {
        return 'Data a definir';
    }

    return new Date(date).toLocaleDateString('pt-PT');
};

const policyLabel = (policy: string): string => {
    if (policy === 'FREE_CANCELLATION') {
        return 'Cancelamento gratuito';
    }

    if (policy === 'NON_REFUNDABLE') {
        return 'Tarifa não reembolsável';
    }

    return 'Sinal não reembolsável';
};

export default function CheckoutPayment({ rate, prefill }: CheckoutPaymentProps) {
    const pageProps = usePage<PageProps>().props;
    const flash = pageProps.flash;
    const legal = pageProps.legal;
    const [intentError, setIntentError] = useState<string | null>(null);
    const [intentLoading, setIntentLoading] = useState(false);
    const [preparedReference, setPreparedReference] = useState<string | null>(null);

    const { data, setData, transform, post, processing, errors, reset } = useForm({
        rate_id: String(rate.id),
        check_in: prefill?.check_in ?? '',
        check_out: prefill?.check_out ?? '',
        guests: prefill?.guests ?? '1',
        payment_reference: '',
        accept_terms: false,
        accept_privacy: false,
    });

    const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
    const isBookingOpenToday = (!rate.booking_start || today >= rate.booking_start)
        && (!rate.booking_end || today <= rate.booking_end);

    const nights = useMemo(() => {
        if (!data.check_in || !data.check_out) {
            return 0;
        }

        const checkIn = new Date(data.check_in);
        const checkOut = new Date(data.check_out);
        if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
            return 0;
        }

        return Math.max(0, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
    }, [data.check_in, data.check_out]);

    const estimatedTotal = rate.sale_price * nights;
    const depositNow = useMemo(() => {
        if (rate.cancellation_policy !== 'DEPOSIT_NON_REFUNDABLE') {
            return estimatedTotal;
        }

        return Math.min(Number(rate.deposit_amount ?? 0), estimatedTotal);
    }, [rate.cancellation_policy, rate.deposit_amount, estimatedTotal]);

    const balanceLater = Math.max(0, estimatedTotal - depositNow);
    const isDateRangeValid = data.check_in !== '' && data.check_out !== '' && data.check_out > data.check_in;
    const hasLegalAcceptance = data.accept_terms && data.accept_privacy;
    const isDepositFlow = rate.cancellation_policy === 'DEPOSIT_NON_REFUNDABLE';
    const canSubmit = isBookingOpenToday && isDateRangeValid && hasLegalAcceptance && !processing && !intentLoading;

    const preparePaymentIntent = async () => {
        setIntentError(null);
        setIntentLoading(true);

        try {
            const response = await axios.post(route('checkout.payment-intent'), {
                rate_id: data.rate_id,
                check_in: data.check_in,
                check_out: data.check_out,
                guests: data.guests,
            });

            const paymentReference = String(response.data.payment_reference ?? '');
            if (paymentReference === '') {
                throw new Error('Referência de pagamento em falta');
            }

            setPreparedReference(paymentReference);
            return paymentReference;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const paymentError = error.response?.data?.errors?.payment?.[0];
                const rateError = error.response?.data?.errors?.rate_id?.[0];
                const guestError = error.response?.data?.errors?.guests?.[0];

                if (typeof paymentError === 'string' && paymentError !== '') {
                    setIntentError(paymentError);
                } else if (typeof rateError === 'string' && rateError !== '') {
                    setIntentError(rateError);
                } else if (typeof guestError === 'string' && guestError !== '') {
                    setIntentError(guestError);
                } else {
                    setIntentError('Não foi possível preparar o pagamento. Revê os dados da reserva e tenta novamente.');
                }
            } else {
                setIntentError('Não foi possível preparar o pagamento. Revê os dados da reserva e tenta novamente.');
            }

            return null;
        } finally {
            setIntentLoading(false);
        }
    };

    const submit = async (event: FormEvent) => {
        event.preventDefault();

        if (!isDateRangeValid) {
            setIntentError('A data de check-out tem de ser posterior à data de check-in.');
            return;
        }
        if (!isBookingOpenToday) {
            setIntentError('Este evento não está disponível para reservas na data atual.');
            return;
        }

        const paymentReference = isDepositFlow ? '' : await preparePaymentIntent();
        if (!isDepositFlow && paymentReference === null) {
            return;
        }

        transform((formData) => ({
            ...formData,
            payment_reference: paymentReference,
        }));

        post(route('checkout.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset('check_in', 'check_out', 'payment_reference');
                setPreparedReference(null);
            },
            onFinish: () => {
                transform((formData) => formData);
            },
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Checkout e Pagamento</h2>}>
            <Head title="Checkout e Pagamento" />

            <div className="bg-gradient-to-b from-slate-100 via-white to-slate-100 py-10">
                <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <Link
                            href={route('checkout.hotels.show', {
                                hotel: rate.hotel_id,
                                event_id: rate.event_id,
                                check_in: data.check_in,
                                check_out: data.check_out,
                            })}
                            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                        >
                            Voltar ao detalhe do hotel
                        </Link>
                        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
                            Passo 4 de 4
                        </span>
                    </div>

                    {flash?.success ? (
                        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                            {flash.success}
                        </div>
                    ) : null}

                    {intentError ? (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {intentError}
                        </div>
                    ) : null}

                    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                            <div>
                                <h1 className="text-2xl font-black text-slate-900">Confirmação da reserva</h1>
                                <p className="mt-1 text-sm text-slate-600">
                                    Revê os dados antes de criar a reserva e avançar para o pagamento.
                                </p>
                            </div>

                            <form onSubmit={submit} className="space-y-5">
                                <input type="hidden" value={data.rate_id} />

                                <div className="grid gap-4 md:grid-cols-3">
                                    <div>
                                        <label htmlFor="check_in" className="mb-1 block text-sm font-medium text-gray-700">
                                            Check-in
                                        </label>
                                        <input
                                            id="check_in"
                                            type="date"
                                            value={data.check_in}
                                            onChange={(event) => setData('check_in', event.target.value)}
                                            className="w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                        {errors.check_in ? <p className="mt-1 text-sm text-red-600">{errors.check_in}</p> : null}
                                    </div>
                                    <div>
                                        <label htmlFor="check_out" className="mb-1 block text-sm font-medium text-gray-700">
                                            Check-out
                                        </label>
                                        <input
                                            id="check_out"
                                            type="date"
                                            value={data.check_out}
                                            onChange={(event) => setData('check_out', event.target.value)}
                                            className="w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                        {errors.check_out ? <p className="mt-1 text-sm text-red-600">{errors.check_out}</p> : null}
                                    </div>
                                    <div>
                                        <label htmlFor="guests" className="mb-1 block text-sm font-medium text-gray-700">
                                            Hóspedes
                                        </label>
                                        <input
                                            id="guests"
                                            type="number"
                                            min={1}
                                            max={Math.max(1, rate.max_guests)}
                                            value={data.guests}
                                            onChange={(event) => setData('guests', event.target.value)}
                                            className="w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                        <p className="mt-1 text-xs text-slate-500">
                                            Capacidade máxima desta tarifa: {rate.max_guests} hóspede(s).
                                        </p>
                                        {errors.guests ? <p className="mt-1 text-sm text-red-600">{errors.guests}</p> : null}
                                    </div>
                                </div>

                                <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <label className="flex items-start gap-3 text-sm text-slate-700">
                                        <Checkbox
                                            checked={data.accept_terms}
                                            onChange={(event) =>
                                                setData('accept_terms', event.target.checked)
                                            }
                                            className="mt-0.5"
                                        />
                                        <span>
                                            Li e aceito os{' '}
                                            <Link href={route('legal.terms')} className="font-semibold underline">
                                                Termos e Condições
                                            </Link>
                                            .
                                        </span>
                                    </label>
                                    {errors.accept_terms ? (
                                        <p className="text-sm text-red-600">{errors.accept_terms}</p>
                                    ) : null}

                                    <label className="flex items-start gap-3 text-sm text-slate-700">
                                        <Checkbox
                                            checked={data.accept_privacy}
                                            onChange={(event) =>
                                                setData('accept_privacy', event.target.checked)
                                            }
                                            className="mt-0.5"
                                        />
                                        <span>
                                            Li e aceito a{' '}
                                            <Link href={route('legal.privacy')} className="font-semibold underline">
                                                Política de Privacidade
                                            </Link>
                                            .
                                        </span>
                                    </label>
                                    {errors.accept_privacy ? (
                                        <p className="text-sm text-red-600">{errors.accept_privacy}</p>
                                    ) : null}
                                </div>

                                <button
                                    type="submit"
                                    disabled={!canSubmit}
                                    className="w-full rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                >
                                    {processing || intentLoading
                                        ? 'A criar reserva...'
                                        : isDepositFlow
                                            ? 'Criar reserva e pagar sinal'
                                            : 'Criar reserva e avançar para pagamento'}
                                </button>
                            </form>
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                                <h3 className="text-lg font-semibold text-slate-900">Resumo da tarifa</h3>
                                <p className="mt-1 text-sm text-slate-600">{rate.event_name} • {rate.event_location}</p>
                                <p className="text-sm text-slate-600">
                                    Evento: {formatDate(rate.event_start_date)} até {formatDate(rate.event_end_date)}
                                </p>
                                <p className="text-sm text-slate-600">{rate.hotel_name}</p>
                                <p className="text-sm text-slate-600">{rate.hotel_address}</p>

                                <div className="mt-3 space-y-1 text-sm text-slate-700">
                                    <p>
                                        <span className="font-semibold text-slate-900">Tarifa:</span> {rate.room_type} / {rate.meal_plan}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-slate-900">Política:</span> {policyLabel(rate.cancellation_policy)}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-slate-900">Reservas abertas:</span> {formatDate(rate.booking_start)} até {formatDate(rate.booking_end)}
                                    </p>
                                    {rate.cancellation_policy === 'FREE_CANCELLATION' ? (
                                        <p>
                                            <span className="font-semibold text-slate-900">Cancelamento grátis até:</span> {formatDate(rate.cancellation_deadline)}
                                        </p>
                                    ) : null}
                                    {preparedReference ? (
                                        <p>
                                            <span className="font-semibold text-slate-900">Referência preparada:</span> {preparedReference}
                                        </p>
                                    ) : null}
                                </div>

                                {rate.hotel_images.length > 0 ? (
                                    <div className="mt-4 grid grid-cols-3 gap-2">
                                        {rate.hotel_images.slice(0, 3).map((image, index) => (
                                            <img
                                                key={`${image}-${index}`}
                                                src={image}
                                                alt={`${rate.hotel_name} ${index + 1}`}
                                                className="h-16 w-full rounded-lg object-cover"
                                            />
                                        ))}
                                    </div>
                                ) : null}
                            </div>

                            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                                <p className="text-xs uppercase tracking-wide text-orange-700">Resumo de pagamento</p>
                                <p className="mt-1 text-2xl font-extrabold text-orange-700">
                                    {estimatedTotal.toFixed(2)} {rate.currency}
                                </p>
                                <p className="mt-1 text-sm text-orange-700">
                                    {nights} {nights === 1 ? 'noite' : 'noites'} x {rate.sale_price.toFixed(2)} {rate.currency}
                                </p>
                                <div className="mt-3 space-y-1 text-sm text-orange-800">
                                    <p>
                                        <span className="font-semibold">Agora:</span> {depositNow.toFixed(2)} {rate.currency}
                                        {isDepositFlow ? ' (sinal não reembolsável)' : ''}
                                    </p>
                                    {isDepositFlow ? (
                                        <p>
                                            <span className="font-semibold">Restante:</span> {balanceLater.toFixed(2)} {rate.currency}
                                            {' '}até {rate.balance_due_days_before_checkin ?? 0} dias antes do check-in
                                        </p>
                                    ) : null}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <p className="text-xs uppercase tracking-wide text-slate-500">Informação legal da reserva</p>
                                <div className="mt-2 space-y-1 text-sm text-slate-700">
                                    <p>Operador: {legal?.operator?.legal_name ?? 'OptViagens, Lda.'}</p>
                                    <p>Suporte: {legal?.operator?.email ?? 'support@optviagens.pt'}</p>
                                    <p>
                                        Livro de Reclamações:{' '}
                                        <a
                                            href={legal?.complaints_book_url ?? 'https://www.livroreclamacoes.pt/'}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="underline"
                                        >
                                            acesso direto
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
