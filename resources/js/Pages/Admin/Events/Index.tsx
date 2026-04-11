import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';

interface EventItem {
    id: number;
    name: string;
    slug: string;
    cover_image_url: string | null;
    location: string;
    start_date: string | null;
    end_date: string | null;
    booking_start: string | null;
    booking_end: string | null;
    is_active: boolean;
    is_featured: boolean;
}

interface EventsIndexProps {
    events: EventItem[];
}

export default function EventsIndex({ events }: EventsIndexProps) {
    const flash = usePage<PageProps>().props.flash;

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Eventos Admin</h2>}
        >
            <Head title="Eventos Admin" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Gere o catálogo de eventos e as janelas de reserva.</p>
                        </div>
                        <div className="inline-flex items-center gap-2">
                            <Link
                        href={route("admin.dashboard")}
                        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
                        >
                            Voltar ao painel
                        </Link>
                        <Link
                            href={route('admin.events.create')}
                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                        >
                            Novo evento
                        </Link>
                        </div>
                    </div>

                    {flash?.success ? (
                        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                            {flash.success}
                        </div>
                    ) : null}

                    <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
                        <table className="w-full min-w-[900px] divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Evento</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Datas</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Janela de reserva</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Estado</th>
                                    <th className="px-4 py-3 text-right font-semibold text-gray-600">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {events.map((event) => (
                                    <tr key={event.id}>
                                        <td className="px-4 py-3">
                                            {event.cover_image_url ? (
                                                <img src={event.cover_image_url} alt={event.name} className="mb-2 h-16 w-28 rounded-md object-cover" />
                                            ) : null}
                                            <p className="font-medium text-gray-900">{event.name}</p>
                                            <p className="text-gray-500">{event.location}</p>
                                            <p className="text-xs text-gray-400">{event.slug}</p>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            {event.start_date ?? 'data a defenir'} até {event.end_date ?? 'data a defenir'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            {event.booking_start ?? 'data a defenir'} até {event.booking_end ?? 'data a defenir'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    event.is_active
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                }`}
                                            >
                                                {event.is_active ? 'Ativo' : 'Inativo'}
                                            </span>
                                            <div className="mt-2">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                        event.is_featured
                                                            ? 'bg-amber-100 text-amber-700'
                                                            : 'bg-slate-100 text-slate-600'
                                                    }`}
                                                >
                                                    {event.is_featured ? 'Destaque' : 'Normal'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="inline-flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                                                        event.is_featured
                                                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                    }`}
                                                    onClick={() => router.patch(route('admin.events.toggle-featured', event.id))}
                                                >
                                                    {event.is_featured ? 'Remover destaque' : 'Adicionar destaque'}
                                                </button>
                                                <Link
                                                    href={route('admin.events.edit', event.id)}
                                                    className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                                                >
                                                    Editar
                                                </Link>
                                                <button
                                                    type="button"
                                                    className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200"
                                                    onClick={() => {
                                                        if (confirm('Apagar este evento?')) {
                                                            router.delete(route('admin.events.destroy', event.id));
                                                        }
                                                    }}
                                                >
                                                    Apagar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
