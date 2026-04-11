import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import EventForm from './Partials/EventForm';

export default function EventCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        description: '',
        location: '',
        latitude: '',
        longitude: '',
        start_date: '',
        end_date: '',
        booking_start: '',
        booking_end: '',
        is_active: true,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post(route('admin.events.store'));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Criar Evento</h2>}
        >
            <Head title="Criar Evento" />

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
                            submitLabel="Criar evento"
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
