import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { PageProps } from "@/types";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { FormEvent, useState } from "react";

interface BookingItem {
    id: string;
    customer_name: string;
    customer_email: string;
    customer_nationality?: string | null;
    customer_nif?: string | null;
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
    can_cancel: boolean;
    can_delete: boolean;
}

interface Filters {
    [key: string]: string;
    status: string;
    payment_status: string;
    search: string;
}

interface AdminBookingsProps {
    bookings: BookingItem[];
    filters: Filters;
}

export default function AdminBookingsIndex({
    bookings,
    filters,
}: AdminBookingsProps) {
    const flash = usePage<PageProps>().props.flash;
    const pageErrors =
        usePage<PageProps & { errors?: Record<string, string> }>().props
            .errors ?? {};
    const [localFilters, setLocalFilters] = useState(filters);

    const applyFilters = (event: FormEvent) => {
        event.preventDefault();
        router.get(route("admin.bookings.index"), localFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const updateStatus = (
        booking: BookingItem,
        status: "PENDING" | "CONFIRMED" | "CANCELLED",
    ) => {
        const cancellationReason =
            status === "CANCELLED"
                ? (prompt("Motivo do cancelamento (opcional):") ?? "")
                : "";

        router.patch(
            route("admin.bookings.update-status", booking.id),
            {
                status,
                cancellation_reason: cancellationReason,
            },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const deleteBooking = (booking: BookingItem) => {
        if (
            !window.confirm(
                "Queres mesmo apagar esta reserva? Esta ação é permanente.",
            )
        ) {
            return;
        }

        router.delete(route("admin.bookings.destroy", booking.id), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Reservas Admin
                </h2>
            }
        >
            <Head title="Reservas Admin" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <p className="text-sm text-gray-600">
                        Gere o ciclo de vida das reservas e respetivos
                        pagamentos.
                    </p>

                    <Link
                        href={route("admin.dashboard")}
                        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
                    >
                        Voltar ao painel
                    </Link>
                    </div>

                    {flash?.success ? (
                        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                            {flash.success}
                        </div>
                    ) : null}
                    {pageErrors.booking_delete ? (
                        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                            {pageErrors.booking_delete}
                        </div>
                    ) : null}

                    <div className="rounded-lg bg-white p-4 shadow-sm">
                        <form
                            onSubmit={applyFilters}
                            className="grid gap-3 md:grid-cols-4"
                        >
                            <input
                                type="text"
                                placeholder="Pesquisar por id, cliente, hotel ou evento"
                                value={localFilters.search}
                                onChange={(event) =>
                                    setLocalFilters((prev) => ({
                                        ...prev,
                                        search: event.target.value,
                                    }))
                                }
                                className="rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />

                            <select
                                value={localFilters.status}
                                onChange={(event) =>
                                    setLocalFilters((prev) => ({
                                        ...prev,
                                        status: event.target.value,
                                    }))
                                }
                                className="rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">
                                    Todos os estados da reserva
                                </option>
                                <option value="PENDING">PENDING</option>
                                <option value="CONFIRMED">CONFIRMED</option>
                                <option value="CANCELLED">CANCELLED</option>
                            </select>

                            <select
                                value={localFilters.payment_status}
                                onChange={(event) =>
                                    setLocalFilters((prev) => ({
                                        ...prev,
                                        payment_status: event.target.value,
                                    }))
                                }
                                className="rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">
                                    Todos os estados de pagamento
                                </option>
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

                    <div className="-mx-4 overflow-x-auto rounded-lg bg-white shadow-sm sm:mx-0">
                        <table className="w-full min-w-[1080px] divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                                        Reserva
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                                        Cliente
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                                        Estadia
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                                        Montante
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                                        Estado
                                    </th>
                                    <th className="px-4 py-3 text-right font-semibold text-gray-600">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {bookings.map((booking) => (
                                    <tr key={booking.id}>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">
                                                {booking.hotel_name}
                                            </p>
                                            <p className="text-gray-500">
                                                {booking.event_name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {booking.room_type} /{" "}
                                                {booking.meal_plan}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {booking.id}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">
                                                {booking.customer_name}
                                            </p>
                                            <p className="text-gray-500">
                                                {booking.customer_email}
                                            </p>
                                            <p className="text-gray-500">
                                                {booking.customer_nationality ?? 'Nacionalidade: N/D'}
                                            </p>
                                            <p className="text-gray-500">
                                                NIF: {booking.customer_nif ?? 'N/D'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            {booking.check_in} até{" "}
                                            {booking.check_out}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            {booking.total_price}{" "}
                                            {booking.currency}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-xs font-semibold uppercase text-gray-700">
                                                Reserva:{" "}
                                                {booking.booking_status}
                                            </p>
                                            <p className="text-xs uppercase text-gray-500">
                                                Pagamento:{" "}
                                                {booking.payment_status ??
                                                    "N/D"}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="inline-flex flex-wrap justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateStatus(
                                                            booking,
                                                            "PENDING",
                                                        )
                                                    }
                                                    className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                                                >
                                                    Definir pendente
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateStatus(
                                                            booking,
                                                            "CONFIRMED",
                                                        )
                                                    }
                                                    className="rounded-md bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-200"
                                                >
                                                    Confirmar
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={
                                                        !booking.can_cancel
                                                    }
                                                    onClick={() =>
                                                        updateStatus(
                                                            booking,
                                                            "CANCELLED",
                                                        )
                                                    }
                                                    className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    Cancelar
                                                </button>
                                                {booking.can_delete ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            deleteBooking(
                                                                booking,
                                                            )
                                                        }
                                                        className="rounded-md bg-rose-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-600"
                                                    >
                                                        Apagar
                                                    </button>
                                                ) : null}
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
