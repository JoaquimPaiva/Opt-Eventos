import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

interface BookingItem {
    id: string;
    customer_name: string;
    customer_email: string;
    event_name: string;
    hotel_name: string;
    check_in: string;
    check_out: string;
    room_type: string;
    meal_plan: string;
    total_price: number;
    currency: string;
    booking_status: string;
    payment_status?: string | null;
}

interface Filters {
    [key: string]: string;
    status: string;
    payment_status: string;
    search: string;
}

interface HotelBookingsProps {
    bookings: BookingItem[];
    filters: Filters;
}

export default function HotelBookingsIndex({ bookings, filters }: HotelBookingsProps) {
    const [localFilters, setLocalFilters] = useState(filters);

    const applyFilters = (event: FormEvent) => {
        event.preventDefault();
        router.get(route('hotel.bookings.index'), localFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Reservas do Hotel</h2>}
        >
            <Head title="Reservas do Hotel" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">
                    <p className="text-sm text-gray-600">Consulta as reservas associadas ao teu hotel.</p>

                    <div className="rounded-lg bg-white p-4 shadow-sm">
                        <form onSubmit={applyFilters} className="grid gap-3 md:grid-cols-4">
                            <input
                                type="text"
                                placeholder="Pesquisar por id, cliente ou evento"
                                value={localFilters.search}
                                onChange={(event) => setLocalFilters((prev) => ({ ...prev, search: event.target.value }))}
                                className="rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />

                            <select
                                value={localFilters.status}
                                onChange={(event) => setLocalFilters((prev) => ({ ...prev, status: event.target.value }))}
                                className="rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Todos os estados da reserva</option>
                                <option value="PENDING">PENDING</option>
                                <option value="CONFIRMED">CONFIRMED</option>
                                <option value="CANCELLED">CANCELLED</option>
                            </select>

                            <select
                                value={localFilters.payment_status}
                                onChange={(event) => setLocalFilters((prev) => ({ ...prev, payment_status: event.target.value }))}
                                className="rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Todos os estados de pagamento</option>
                                <option value="PENDING">PENDING</option>
                                <option value="PAID">PAID</option>
                                <option value="FAILED">FAILED</option>
                                <option value="REFUNDED">REFUNDED</option>
                            </select>

                            <button
                                type="submit"
                                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
                            >
                                Aplicar filtros
                            </button>
                        </form>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Reserva</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Cliente</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Estadia</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Montante</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {bookings.map((booking) => (
                                    <tr key={booking.id}>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">{booking.hotel_name}</p>
                                            <p className="text-gray-500">{booking.event_name}</p>
                                            <p className="text-xs text-gray-500">{booking.room_type} / {booking.meal_plan}</p>
                                            <p className="text-xs text-gray-400">{booking.id}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">{booking.customer_name}</p>
                                            <p className="text-gray-500">{booking.customer_email}</p>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            {booking.check_in} ate {booking.check_out}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            {booking.total_price} {booking.currency}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-xs font-semibold uppercase text-gray-700">
                                                Reserva: {booking.booking_status}
                                            </p>
                                            <p className="text-xs uppercase text-gray-500">
                                                Pagamento: {booking.payment_status ?? 'N/D'}
                                            </p>
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
