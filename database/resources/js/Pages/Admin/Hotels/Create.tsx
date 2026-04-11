import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import HotelForm from './Partials/HotelForm';

interface EventOption {
    id: number;
    name: string;
}

interface HotelCreateProps {
    events: EventOption[];
}

export default function HotelCreate({ events }: HotelCreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        event_id: '',
        name: '',
        description: '',
        address: '',
        latitude: '',
        longitude: '',
        supplier_name: '',
        website_url: '',
        gallery_images: [] as File[],
        existing_gallery_images: [] as string[],
        is_active: true,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post(route('admin.hotels.store'), {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Criar Hotel</h2>}
        >
            <Head title="Criar Hotel" />

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
                            existingGalleryImages={[]}
                            onSubmit={submit}
                            submitLabel="Criar hotel"
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
