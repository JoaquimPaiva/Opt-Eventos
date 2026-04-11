import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { FormEvent, useEffect, useMemo, useState } from 'react';

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
    booking_start: string;
    booking_end: string;
    max_guests: number;
}

interface CheckoutProps {
    rates: RateOption[];
    prefill?: {
        rate_id?: string;
        check_in?: string;
        check_out?: string;
        guests?: string;
    };
}

export default function Checkout({ rates }: CheckoutProps) {
    const flash = usePage<PageProps>().props.flash;
    const [intentError, setIntentError] = useState<string | null>(null);
    const [intentLoading, setIntentLoading] = useState(false);
    const [preparedReference, setPreparedReference] = useState<string | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [selectedHotelId, setSelectedHotelId] = useState<string>('');

    const { data, setData, transform, post, processing, errors, reset } = useForm({
        rate_id: '',
        check_in: '',
        check_out: '',
        guests: '',
        payment_reference: '',
    });

    const eventOptions = useMemo(() => {
        const map = new Map<number, string>();
        rates.forEach((rate) => {
            if (!map.has(rate.event_id)) {
                map.set(rate.event_id, rate.event_name);
            }
        });

        return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
    }, [rates]);

    const hotelOptions = useMemo(() => {
        const eventId = Number.parseInt(selectedEventId, 10);
        if (!Number.isFinite(eventId)) {
            return [];
        }

        const map = new Map<number, string>();
        rates
            .filter((rate) => rate.event_id === eventId)
            .forEach((rate) => {
                if (!map.has(rate.hotel_id)) {
                    map.set(rate.hotel_id, rate.hotel_name);
                }
            });

        return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
    }, [rates, selectedEventId]);

    const mealOptions = useMemo(() => {
        const eventId = Number.parseInt(selectedEventId, 10);
        const hotelId = Number.parseInt(selectedHotelId, 10);
        if (!Number.isFinite(eventId) || !Number.isFinite(hotelId)) {
            return [];
        }

        return rates
            .filter((rate) => rate.event_id === eventId && rate.hotel_id === hotelId)
            .map((rate) => ({
                rateId: rate.id,
                label: `${rate.meal_plan} (${rate.room_type})`,
            }));
    }, [rates, selectedEventId, selectedHotelId]);

    useEffect(() => {
        if (hotelOptions.length === 0) {
            setSelectedHotelId('');
            return;
        }

        if (!hotelOptions.some((hotel) => String(hotel.id) === selectedHotelId)) {
            setSelectedHotelId('');
        }
    }, [hotelOptions, selectedHotelId]);

    useEffect(() => {
        if (mealOptions.length === 0) {
            setData('rate_id', '');
            return;
        }

        if (!mealOptions.some((meal) => String(meal.rateId) === data.rate_id)) {
            setData('rate_id', '');
        }
    }, [mealOptions, data.rate_id, setData]);

    const selectedRate = rates.find((rate) => rate.id.toString() === data.rate_id);
    const selectedImages = selectedRate?.hotel_images ?? [];
    const selectedImage = selectedImages[activeImageIndex] ?? null;
    const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
    const isBookingOpenToday = selectedRate
        ? today >= selectedRate.booking_start && today <= selectedRate.booking_end
        : false;
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
    const estimatedTotal = selectedRate ? selectedRate.sale_price * nights : 0;
    const isDateRangeValid = data.check_in !== '' && data.check_out !== '' && data.check_out > data.check_in;
    const canSubmit = Boolean(selectedRate) && isBookingOpenToday && isDateRangeValid && !processing && !intentLoading;

    useEffect(() => {
        setActiveImageIndex(0);
        setZoomLevel(1);
        setIsImageViewerOpen(false);
    }, [data.rate_id]);

    useEffect(() => {
        if (!isImageViewerOpen || selectedImages.length <= 1) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsImageViewerOpen(false);
            }
            if (event.key === 'ArrowRight') {
                setActiveImageIndex((current) => (current + 1) % selectedImages.length);
                setZoomLevel(1);
            }
            if (event.key === 'ArrowLeft') {
                setActiveImageIndex((current) => (current - 1 + selectedImages.length) % selectedImages.length);
                setZoomLevel(1);
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isImageViewerOpen, selectedImages.length]);

    useEffect(() => {
        if (intentError !== null) {
            setIntentError(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.rate_id, data.check_in, data.check_out, data.guests]);

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
                throw new Error('Missing payment reference');
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

        if (!selectedRate) {
            setIntentError('Seleciona um evento, hotel e regime antes de continuar.');
            return;
        }
        if (!isDateRangeValid) {
            setIntentError('A data de check-out tem de ser posterior à data de check-in.');
            return;
        }
        if (!isBookingOpenToday) {
            setIntentError('Este evento não está disponível para reservas na data atual.');
            return;
        }

        const paymentReference = await preparePaymentIntent();
        if (paymentReference === null) {
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
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Reserva</h2>}
        >
            <Head title="Reserva" />

            <div className="bg-gradient-to-b from-slate-100 via-white to-slate-100 py-10">
                <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div>
                        <Link
                            href={route('dashboard')}
                            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                        >
                            Voltar ao painel
                        </Link>
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

                    {intentLoading ? (
                        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
                            A preparar referência de pagamento e a validar disponibilidade...
                        </div>
                    ) : null}

                    {selectedRate && !isBookingOpenToday ? (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            As reservas para este evento abrem em <strong>{selectedRate.booking_start}</strong>.
                        </div>
                    ) : null}

                    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-slate-900">Detalhes da reserva</h3>
                            <p className="mt-1 text-sm text-slate-600">Segue os 4 passos para criares a tua reserva com pagamento preparado.</p>

                            <form onSubmit={submit} className="mt-5 space-y-5">
                                <div>
                                    <label htmlFor="event_id" className="mb-1 block text-sm font-medium text-gray-700">
                                        1. Event
                                    </label>
                                    <select
                                        id="event_id"
                                        value={selectedEventId}
                                        onChange={(event) => setSelectedEventId(event.target.value)}
                                        className="w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        disabled={eventOptions.length === 0}
                                    >
                                        <option value="">
                                            {eventOptions.length === 0 ? 'Sem eventos disponíveis' : 'Seleciona um evento'}
                                        </option>
                                        {eventOptions.map((eventOption) => (
                                            <option key={eventOption.id} value={eventOption.id}>
                                                {eventOption.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="hotel_id" className="mb-1 block text-sm font-medium text-gray-700">
                                        2. Hotel para este evento
                                    </label>
                                    <select
                                        id="hotel_id"
                                        value={selectedHotelId}
                                        onChange={(event) => setSelectedHotelId(event.target.value)}
                                        className="w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        disabled={hotelOptions.length === 0}
                                    >
                                        <option value="">
                                            {hotelOptions.length === 0 ? 'Seleciona primeiro um evento' : 'Seleciona um hotel'}
                                        </option>
                                        {hotelOptions.map((hotelOption) => (
                                            <option key={hotelOption.id} value={hotelOption.id}>
                                                {hotelOption.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="rate_id" className="mb-1 block text-sm font-medium text-gray-700">
                                        3. Opção de refeição
                                    </label>
                                    <select
                                        id="rate_id"
                                        value={data.rate_id}
                                        onChange={(event) => setData('rate_id', event.target.value)}
                                        className="w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        disabled={mealOptions.length === 0}
                                    >
                                        <option value="">
                                            {mealOptions.length === 0 ? 'Seleciona primeiro evento e hotel' : 'Seleciona o regime'}
                                        </option>
                                        {mealOptions.map((mealOption) => (
                                            <option key={mealOption.rateId} value={mealOption.rateId}>
                                                {mealOption.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.rate_id ? <p className="mt-1 text-sm text-red-600">{errors.rate_id}</p> : null}
                                </div>

                                <div className="grid gap-4 md:grid-cols-3">
                                    <div>
                                        <label htmlFor="check_in" className="mb-1 block text-sm font-medium text-gray-700">
                                            4. Check-in
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

                                {data.check_in !== '' && data.check_out !== '' && !isDateRangeValid ? (
                                    <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                                        O check-out deve ser posterior ao check-in.
                                    </p>
                                ) : null}

                                <button
                                    type="submit"
                                    disabled={!canSubmit}
                                    className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {processing || intentLoading ? 'A criar reserva...' : 'Criar reserva'}
                                </button>
                            </form>
                        </div>

                        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 px-5 py-5 text-white">
                                    <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Resumo selecionado</p>
                                    <h3 className="mt-1 text-xl font-semibold">{selectedRate?.hotel_name ?? 'Seleciona uma opção'}</h3>
                                    <p className="mt-1 text-sm text-slate-200">{selectedRate?.event_name ?? '-'}</p>
                                </div>

                                <div className="p-4">
                                    {selectedImage ? (
                                        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-black">
                                            <img
                                                src={selectedImage}
                                                alt={selectedRate?.hotel_name ?? 'Selected hotel'}
                                                className="h-52 w-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setZoomLevel(1);
                                                    setIsImageViewerOpen(true);
                                                }}
                                                className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-900"
                                            >
                                                Ver maior
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid h-52 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-100 text-sm text-slate-500">
                                            Sem imagem do hotel
                                        </div>
                                    )}

                                    {selectedImages.length > 1 ? (
                                        <div className="mt-3 grid grid-cols-5 gap-2">
                                            {selectedImages.map((image, index) => (
                                                <button
                                                    key={`${image}-${index}`}
                                                    type="button"
                                                    onClick={() => setActiveImageIndex(index)}
                                                    className={`overflow-hidden rounded-lg border ${
                                                        index === activeImageIndex
                                                            ? 'border-indigo-500 ring-2 ring-indigo-200'
                                                            : 'border-slate-200'
                                                    }`}
                                                >
                                                    <img src={image} alt={`Hotel ${index + 1}`} className="h-12 w-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    ) : null}

                                    {selectedRate ? (
                                        <div className="mt-4 space-y-1.5 text-sm text-slate-700">
                                            <p><span className="font-semibold text-slate-900">Quarto / Regime:</span> {selectedRate.room_type} / {selectedRate.meal_plan}</p>
                                            <p><span className="font-semibold text-slate-900">Janela de reserva:</span> {selectedRate.booking_start} até {selectedRate.booking_end}</p>
                                            <p><span className="font-semibold text-slate-900">Hóspedes máximos:</span> {selectedRate.max_guests}</p>
                                            <p><span className="font-semibold text-slate-900">Stock:</span> {selectedRate.stock}</p>
                                            {preparedReference ? (
                                                <p><span className="font-semibold text-slate-900">Referência de pagamento:</span> {preparedReference}</p>
                                            ) : null}
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                                <p className="text-xs uppercase tracking-wide text-orange-700">Total estimado</p>
                                <p className="mt-1 text-2xl font-extrabold text-orange-700">
                                    {estimatedTotal.toFixed(2)} {selectedRate?.currency ?? 'EUR'}
                                </p>
                                <p className="mt-1 text-sm text-orange-700">
                                    {nights} {nights === 1 ? 'noite' : 'noites'} x {(selectedRate?.sale_price ?? 0).toFixed(2)} {selectedRate?.currency ?? 'EUR'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isImageViewerOpen && selectedImage ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
                    <button
                        type="button"
                        onClick={() => setIsImageViewerOpen(false)}
                        className="absolute right-4 top-4 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-900"
                    >
                        Fechar
                    </button>

                    <div className="relative w-full max-w-6xl">
                        <div className="mb-3 flex items-center justify-between gap-3 text-white">
                            <p className="text-sm font-semibold">{selectedRate?.hotel_name}</p>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setZoomLevel((current) => Math.max(1, Number((current - 0.25).toFixed(2))))}
                                    className="rounded bg-white/15 px-3 py-1 text-sm font-bold hover:bg-white/25"
                                >
                                    -
                                </button>
                                <span className="text-xs">{Math.round(zoomLevel * 100)}%</span>
                                <button
                                    type="button"
                                    onClick={() => setZoomLevel((current) => Math.min(3, Number((current + 0.25).toFixed(2))))}
                                    className="rounded bg-white/15 px-3 py-1 text-sm font-bold hover:bg-white/25"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="relative overflow-hidden rounded-xl border border-white/20 bg-black">
                            <img
                                src={selectedImage}
                                alt={selectedRate?.hotel_name ?? 'Selected hotel'}
                                className="mx-auto max-h-[78vh] w-auto transition-transform duration-200"
                                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                            />
                        </div>

                        {selectedImages.length > 1 ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveImageIndex((previous) => (previous - 1 + selectedImages.length) % selectedImages.length);
                                        setZoomLevel(1);
                                    }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 px-3 py-2 text-sm font-bold text-slate-900"
                                >
                                    ‹
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveImageIndex((previous) => (previous + 1) % selectedImages.length);
                                        setZoomLevel(1);
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 px-3 py-2 text-sm font-bold text-slate-900"
                                >
                                    ›
                                </button>
                            </>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </AuthenticatedLayout>
    );
}
