import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { FormEvent, useMemo, useState } from 'react';

interface RateOption {
    id: number;
    event_id: number;
    hotel_id: number;
    event_name: string;
    hotel_name: string;
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
}

interface CheckoutPaymentProps {
    rate: RateOption;
    prefill?: {
        check_in?: string;
        check_out?: string;
        guests?: string;
    };
}

export default function CheckoutPayment({ rate, prefill }: CheckoutPaymentProps) {
    const flash = usePage<PageProps>().props.flash;
    const [intentError, setIntentError] = useState<string | null>(null);
    const [intentLoading, setIntentLoading] = useState(false);
    const [preparedReference, setPreparedReference] = useState<string | null>(null);

    const { data, setData, transform, post, processing, errors, reset } = useForm({
        rate_id: String(rate.id),
        check_in: prefill?.check_in ?? '',
        check_out: prefill?.check_out ?? '',
        guests: prefill?.guests ?? '1',
        payment_reference: '',
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
    const isDateRangeValid = data.check_in !== '' && data.check_out !== '' && data.check_out > data.check_in;
    const canSubmit = isBookingOpenToday && isDateRangeValid && !processing && !intentLoading;
    const isDepositFlow = rate.cancellation_policy === 'DEPOSIT_NON_REFUNDABLE';

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
                if (typeof paymentError === 'string' && paymentError !== '') {
                    setIntentError(paymentError);
                } else if (typeof rateError === 'string' && rateError !== '') {
                    setIntentError(rateError);
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
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h1 className="text-2xl font-black text-slate-900">4. Checkout</h1>
                            <p className="mt-1 text-sm text-slate-600">
                                Confirma os dados e cria a reserva para avançar para pagamento.
                            </p>

                            <form onSubmit={submit} className="mt-5 space-y-5">
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
                                            max={10}
                                            value={data.guests}
                                            onChange={(event) => setData('guests', event.target.value)}
                                            className="w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                        {errors.guests ? <p className="mt-1 text-sm text-red-600">{errors.guests}</p> : null}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!canSubmit}
                                    className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {processing || intentLoading
                                        ? 'A criar reserva...'
                                        : isDepositFlow
                                            ? 'Criar reserva e pagar sinal'
                                            : 'Criar reserva e avançar ao pagamento'}
                                </button>
                            </form>
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <h3 className="text-lg font-semibold text-slate-900">{rate.hotel_name}</h3>
                                <p className="text-sm text-slate-600">{rate.event_name}</p>
                                <p className="mt-2 text-sm text-slate-700">
                                    {rate.room_type} / {rate.meal_plan}
                                </p>
                                <p className="text-sm text-slate-700">
                                    Janela de reserva: {rate.booking_start ?? 'Data a definir'} até {rate.booking_end ?? 'Data a definir'}
                                </p>
                                <p className="text-sm text-slate-700">
                                    Política: {rate.cancellation_policy === 'FREE_CANCELLATION'
                                        ? 'Cancelamento gratuito'
                                        : rate.cancellation_policy === 'NON_REFUNDABLE'
                                            ? 'Tarifa não reembolsável'
                                            : 'Sinal não reembolsável'}
                                </p>
                                {rate.cancellation_policy === 'DEPOSIT_NON_REFUNDABLE' ? (
                                    <p className="text-sm text-slate-700">
                                        Sinal: {Number(rate.deposit_amount ?? 0).toFixed(2)} {rate.currency} | Restante: {rate.balance_due_days_before_checkin ?? 0} dias antes do check-in
                                    </p>
                                ) : null}
                                {preparedReference ? (
                                    <p className="mt-2 text-sm text-slate-700">
                                        Referência preparada: <strong>{preparedReference}</strong>
                                    </p>
                                ) : null}
                            </div>

                            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                                <p className="text-xs uppercase tracking-wide text-orange-700">Total estimado</p>
                                <p className="mt-1 text-2xl font-extrabold text-orange-700">
                                    {estimatedTotal.toFixed(2)} {rate.currency}
                                </p>
                                <p className="mt-1 text-sm text-orange-700">
                                    {nights} {nights === 1 ? 'noite' : 'noites'} x {rate.sale_price.toFixed(2)} {rate.currency}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
