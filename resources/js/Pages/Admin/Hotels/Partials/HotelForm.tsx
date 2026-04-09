import { FormEvent, ReactNode, useEffect, useMemo } from 'react';

type EventOption = {
    id: number;
    name: string;
};

type HotelFormData = {
    event_id: string;
    name: string;
    description: string;
    address: string;
    latitude: string;
    longitude: string;
    supplier_name: string;
    website_url: string;
    gallery_images: File[];
    existing_gallery_images: string[];
    is_active: boolean;
};

type HotelFormErrors = Partial<Record<keyof HotelFormData, string>>;

interface HotelFormProps {
    data: HotelFormData;
    setData: <K extends keyof HotelFormData>(key: K, value: HotelFormData[K]) => void;
    errors: HotelFormErrors;
    processing: boolean;
    events: EventOption[];
    existingGalleryImages?: Array<{ path: string; url: string }>;
    onSubmit: (event: FormEvent) => void;
    submitLabel: string;
}

export default function HotelForm({
    data,
    setData,
    errors,
    processing,
    events,
    existingGalleryImages = [],
    onSubmit,
    submitLabel,
}: HotelFormProps) {
    const selectedUploads = useMemo(
        () => data.gallery_images.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })),
        [data.gallery_images],
    );

    useEffect(() => {
        return () => {
            selectedUploads.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
        };
    }, [selectedUploads]);

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Evento" error={errors.event_id}>
                <select
                    value={data.event_id}
                    onChange={(event) => setData('event_id', event.target.value)}
                    className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                    <option value="">Selecionar evento</option>
                    {events.map((event) => (
                        <option key={event.id} value={event.id}>
                            {event.name}
                        </option>
                    ))}
                </select>
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nome do hotel" error={errors.name}>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(event) => setData('name', event.target.value)}
                        className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </Field>

                <Field label="Nome do fornecedor" error={errors.supplier_name}>
                    <input
                        type="text"
                        value={data.supplier_name}
                        onChange={(event) => setData('supplier_name', event.target.value)}
                        className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </Field>
            </div>

            <Field label="Morada" error={errors.address}>
                <input
                    type="text"
                    value={data.address}
                    onChange={(event) => setData('address', event.target.value)}
                    className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
            </Field>

            <Field label="Descrição" error={errors.description}>
                <textarea
                    value={data.description}
                    onChange={(event) => setData('description', event.target.value)}
                    rows={3}
                    className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
            </Field>

            <div className="grid gap-4 md:grid-cols-3">
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

                <Field label="URL do website" error={errors.website_url}>
                    <input
                        type="url"
                        value={data.website_url}
                        onChange={(event) => setData('website_url', event.target.value)}
                        className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </Field>
            </div>

            <Field label="Fotos do hotel" error={errors.gallery_images}>
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) =>
                        setData('gallery_images', Array.from(event.target.files ?? []))
                    }
                    className="w-full rounded-md border-gray-300 text-sm shadow-sm file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100 focus:border-indigo-500 focus:ring-indigo-500"
                />
                <p className="mt-1 text-xs text-gray-500">Até 10 fotos, máximo 5MB cada.</p>
            </Field>

            {existingGalleryImages.length > 0 ? (
                <div>
                    <p className="mb-2 text-sm font-medium text-gray-700">Fotos atuais</p>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {existingGalleryImages
                            .filter((image) => data.existing_gallery_images.includes(image.path))
                            .map((image) => (
                                <div key={image.path} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                                    <img src={image.url} alt="Hotel" className="h-36 w-full object-cover" />
                                    <div className="p-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setData(
                                                    'existing_gallery_images',
                                                    data.existing_gallery_images.filter((path) => path !== image.path),
                                                )
                                            }
                                            className="rounded-md bg-red-100 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-200"
                                        >
                                            Remover
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            ) : null}

            {selectedUploads.length > 0 ? (
                <div>
                    <p className="mb-2 text-sm font-medium text-gray-700">Novas fotos para upload</p>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {selectedUploads.map(({ file, previewUrl }) => (
                            <div key={file.name + file.size} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                                <img src={previewUrl} alt={file.name} className="h-36 w-full object-cover" />
                                <p className="truncate px-2 py-1 text-xs text-gray-600">{file.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                    type="checkbox"
                    checked={data.is_active}
                    onChange={(event) => setData('is_active', event.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Hotel ativo
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
