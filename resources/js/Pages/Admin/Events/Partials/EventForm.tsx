import { FormEvent } from 'react';
import { ReactNode } from 'react';

type EventFormData = {
    name: string;
    slug: string;
    description: string;
    location: string;
    latitude: string;
    longitude: string;
    start_date: string;
    end_date: string;
    booking_start: string;
    booking_end: string;
    is_active: boolean;
};

type EventFormErrors = Partial<Record<keyof EventFormData, string>>;

interface EventFormProps {
    data: EventFormData;
    setData: <K extends keyof EventFormData>(key: K, value: EventFormData[K]) => void;
    errors: EventFormErrors;
    processing: boolean;
    onSubmit: (event: FormEvent) => void;
    submitLabel: string;
}

export default function EventForm({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    submitLabel,
}: EventFormProps) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nome" error={errors.name}>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(event) => setData('name', event.target.value)}
                        className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </Field>

                <Field label="Slug (opcional)" error={errors.slug}>
                    <input
                        type="text"
                        value={data.slug}
                        onChange={(event) => setData('slug', event.target.value)}
                        className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </Field>
            </div>

            <Field label="Descrição" error={errors.description}>
                <textarea
                    value={data.description}
                    onChange={(event) => setData('description', event.target.value)}
                    rows={3}
                    className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
            </Field>

            <div className="grid gap-4 md:grid-cols-3">
                <Field label="Localização" error={errors.location}>
                    <input
                        type="text"
                        value={data.location}
                        onChange={(event) => setData('location', event.target.value)}
                        className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </Field>

                <Field label="Latitude" error={errors.latitude}>
                    <input
                        type="text"
                        value={data.latitude}
                        onChange={(event) => setData('latitude', event.target.value)}
                        className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </Field>

                <Field label="Longitude" error={errors.longitude}>
                    <input
                        type="text"
                        value={data.longitude}
                        onChange={(event) => setData('longitude', event.target.value)}
                        className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Field label="Data de início" error={errors.start_date}>
                    <input
                        type="date"
                        value={data.start_date}
                        onChange={(event) => setData('start_date', event.target.value)}
                        className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </Field>

                <Field label="Data de fim" error={errors.end_date}>
                    <input
                        type="date"
                        value={data.end_date}
                        onChange={(event) => setData('end_date', event.target.value)}
                        className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Field label="Abertura de reservas" error={errors.booking_start}>
                    <input
                        type="date"
                        value={data.booking_start}
                        onChange={(event) => setData('booking_start', event.target.value)}
                        className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </Field>

                <Field label="Fim de reservas" error={errors.booking_end}>
                    <input
                        type="date"
                        value={data.booking_end}
                        onChange={(event) => setData('booking_end', event.target.value)}
                        className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </Field>
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                    type="checkbox"
                    checked={data.is_active}
                    onChange={(event) => setData('is_active', event.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Evento ativo
            </label>

            <div>
                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {processing ? 'A guardar...' : submitLabel}
                </button>
            </div>
        </form>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
            {children}
            {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
        </div>
    );
}
