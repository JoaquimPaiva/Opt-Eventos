import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import HotelForm from './Partials/HotelForm';

interface EventOption {
    id: number;
    name: string;
}

interface HotelPayload {
    id: number;
    event_id: number;
    name: string;
    description?: string | null;
    address: string;
    latitude: string;
    longitude: string;
    supplier_name: string;
    website_url?: string | null;
    gallery_images: Array<{ path: string; url: string }>;
    is_active: boolean;
}

interface HotelEditProps {
    events: EventOption[];
    hotel: HotelPayload;
}

export default function HotelEdit({ events, hotel }: HotelEditProps) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        event_id: hotel.event_id.toString(),
        name: hotel.name,
        description: hotel.description ?? '',
        address: hotel.address,
        latitude: hotel.latitude,
        longitude: hotel.longitude,
        supplier_name: hotel.supplier_name,
        website_url: hotel.website_url ?? '',
        gallery_images: [] as File[],
        existing_gallery_images: hotel.gallery_images.map((image) => image.path),
        is_active: hotel.is_active,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post(route('admin.hotels.update', hotel.id), {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Editar Hotel</h2>}
        >
            <Head title={`Editar ${hotel.name}`} />

            <div className="py-10">
                <div className="mx-auto max-w-4xl space-y-4 px-4 sm:px-6 lg:px-8">
                    <Link
                        href={route('admin.hotels.index')}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        Voltar aos hotéis
                    </Link>

                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <HotelForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            processing={processing}
                            events={events}
                            existingGalleryImages={hotel.gallery_images}
                            onSubmit={submit}
                            submitLabel="Atualizar hotel"
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
