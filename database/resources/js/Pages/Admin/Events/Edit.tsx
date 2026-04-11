import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import EventForm from './Partials/EventForm';

interface EventPayload {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    location: string;
    latitude: string;
    longitude: string;
    start_date: string;
    end_date: string;
    booking_start: string;
    booking_end: string;
    is_active: boolean;
}

interface EventEditProps {
    event: EventPayload;
}

export default function EventEdit({ event }: EventEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: event.name,
        slug: event.slug,
        description: event.description ?? '',
        location: event.location,
        latitude: event.latitude,
        longitude: event.longitude,
        start_date: event.start_date,
        end_date: event.end_date,
        booking_start: event.booking_start,
        booking_end: event.booking_end,
        is_active: event.is_active,
    });

    const submit = (formEvent: FormEvent) => {
        formEvent.preventDefault();
        put(route('admin.events.update', event.id));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Editar Evento</h2>}
        >
            <Head title={`Editar ${event.name}`} />

            <div className="py-10">
                <div className="mx-auto max-w-4xl space-y-4 px-4 sm:px-6 lg:px-8">
                    <Link
                        href={route('admin.events.index')}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        Voltar aos eventos
                    </Link>

                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <EventForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            processing={processing}
                            onSubmit={submit}
                            submitLabel="Atualizar evento"
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
