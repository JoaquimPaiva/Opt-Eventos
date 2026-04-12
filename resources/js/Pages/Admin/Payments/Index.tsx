import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { PageProps } from "@/types";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { FormEvent, useState } from "react";

interface PaymentItem {
    id: number;
    booking_id: string;
    booking_status: string;
    customer_name: string;
    customer_email: string;
    event_name: string;
    hotel_name: string;
    provider: string;
    provider_reference?: string | null;
    amount: number;
    currency: string;
    due_date: string;
    status: string;
    paid_at?: string | null;
    is_due: boolean;
}

interface Filters {
    [key: string]: string;
    status: string;
    search: string;
}

interface PaymentsIndexProps {
    payments: PaymentItem[];
    filters: Filters;
}

export default function PaymentsIndex({
    payments,
    filters,
}: PaymentsIndexProps) {
    const flash = usePage<PageProps>().props.flash;
    const [localFilters, setLocalFilters] = useState(filters);

    const applyFilters = (event: FormEvent) => {
        event.preventDefault();
        router.get(route("admin.payments.index"), localFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const updateStatus = (
        id: number,
        status: "PENDING" | "PAID" | "FAILED" | "REFUNDED",
    ) => {
        router.patch(
            route("admin.payments.update-status", id),
            { status },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Pagamentos de Clientes
                </h2>
            }
        >
            <Head title="Pagamentos de Clientes" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <p className="text-sm text-gray-600">
                            Gere estados de cobrança aos clientes e respetivos
                            vencimentos.
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

                    <div className="rounded-lg bg-white p-4 shadow-sm">
                        <form
                            onSubmit={applyFilters}
                            className="grid gap-3 md:grid-cols-3"
                        >
                            <input
                                type="text"
                                placeholder="Pesquisar por reserva, cliente, evento, hotel ou referência"
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
                                <option value="">Todos os estados</option>
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
                        <table className="w-full min-w-[980px] divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                                        Pagamento
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                                        Reserva
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                                        Montante
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                                        Vencimento
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
                                {payments.map((payment) => (
                                    <tr key={payment.id}>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">
                                                #{payment.id}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {payment.customer_name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {payment.customer_email}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {payment.provider}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">
                                                {payment.hotel_name}
                                            </p>
                                            <p className="text-gray-500">
                                                {payment.event_name}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {payment.booking_id}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Reserva:{" "}
                                                {payment.booking_status}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            <p>
                                                {payment.amount}{" "}
                                                {payment.currency}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Ref.:{" "}
                                                {payment.provider_reference ??
                                                    "N/D"}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            <p>{payment.due_date}</p>
                                            <p className="text-xs text-gray-500">
                                                {payment.paid_at
                                                    ? `Atualizado em: ${payment.paid_at}`
                                                    : "Não liquidado"}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    payment.status === "PAID"
                                                        ? "bg-green-100 text-green-700"
                                                        : payment.status ===
                                                            "FAILED"
                                                          ? "bg-red-100 text-red-700"
                                                          : payment.status ===
                                                              "REFUNDED"
                                                            ? "bg-blue-100 text-blue-700"
                                                            : payment.is_due
                                                              ? "bg-amber-100 text-amber-700"
                                                              : "bg-gray-100 text-gray-700"
                                                }`}
                                            >
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="inline-flex flex-wrap justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateStatus(
                                                            payment.id,
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
                                                            payment.id,
                                                            "PAID",
                                                        )
                                                    }
                                                    className="rounded-md bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-200"
                                                >
                                                    Marcar pago
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateStatus(
                                                            payment.id,
                                                            "FAILED",
                                                        )
                                                    }
                                                    className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200"
                                                >
                                                    Marcar falhado
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateStatus(
                                                            payment.id,
                                                            "REFUNDED",
                                                        )
                                                    }
                                                    className="rounded-md bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-200"
                                                >
                                                    Marcar reembolsado
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
