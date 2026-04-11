import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

interface SupplierPaymentItem {
    id: number;
    booking_id: string;
    customer_name: string;
    customer_email: string;
    event_name: string;
    hotel_name: string;
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

interface SupplierPaymentsIndexProps {
    supplier_payments: SupplierPaymentItem[];
    filters: Filters;
}

export default function SupplierPaymentsIndex({ supplier_payments, filters }: SupplierPaymentsIndexProps) {
    const flash = usePage<PageProps>().props.flash;
    const [localFilters, setLocalFilters] = useState(filters);

    const applyFilters = (event: FormEvent) => {
        event.preventDefault();
        router.get(route('admin.supplier-payments.index'), localFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const updateStatus = (id: number, status: 'PENDING' | 'PAID' | 'OVERDUE') => {
        router.patch(route('admin.supplier-payments.update-status', id), { status }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Pagamentos a Fornecedores</h2>}
        >
            <Head title="Pagamentos a Fornecedores" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-end justify-between">
                        <p className="text-sm text-gray-600">Acompanha valores a fornecedores e estado de liquidação.</p>

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
                        <form onSubmit={applyFilters} className="grid gap-3 md:grid-cols-3">
                            <input
                                type="text"
                                placeholder="Pesquisar por pagamento, reserva, cliente, evento ou hotel"
                                value={localFilters.search}
                                onChange={(event) => setLocalFilters((prev) => ({ ...prev, search: event.target.value }))}
                                className="rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />

                            <select
                                value={localFilters.status}
                                onChange={(event) => setLocalFilters((prev) => ({ ...prev, status: event.target.value }))}
                                className="rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Todos os estados</option>
                                <option value="PENDING">PENDING</option>
                                <option value="PAID">PAID</option>
                                <option value="OVERDUE">OVERDUE</option>
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
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Pagamento</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Reserva</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Montante</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Vencimento</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Estado</th>
                                    <th className="px-4 py-3 text-right font-semibold text-gray-600">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {supplier_payments.map((supplierPayment) => (
                                    <tr key={supplierPayment.id}>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">#{supplierPayment.id}</p>
                                            <p className="text-xs text-gray-500">{supplierPayment.customer_name}</p>
                                            <p className="text-xs text-gray-500">{supplierPayment.customer_email}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">{supplierPayment.hotel_name}</p>
                                            <p className="text-gray-500">{supplierPayment.event_name}</p>
                                            <p className="text-xs text-gray-400">{supplierPayment.booking_id}</p>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            {supplierPayment.amount} {supplierPayment.currency}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            <p>{supplierPayment.due_date}</p>
                                            <p className="text-xs text-gray-500">
                                                {supplierPayment.paid_at ? `Pago em: ${supplierPayment.paid_at}` : 'Não pago'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    supplierPayment.status === 'PAID'
                                                        ? 'bg-green-100 text-green-700'
                                                        : supplierPayment.status === 'OVERDUE'
                                                            ? 'bg-red-100 text-red-700'
                                                            : supplierPayment.is_due
                                                                ? 'bg-amber-100 text-amber-700'
                                                                : 'bg-gray-100 text-gray-700'
                                                }`}
                                            >
                                                {supplierPayment.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="inline-flex flex-wrap justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => updateStatus(supplierPayment.id, 'PENDING')}
                                                    className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                                                >
                                                    Definir pendente
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => updateStatus(supplierPayment.id, 'PAID')}
                                                    className="rounded-md bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-200"
                                                >
                                                    Marcar pago
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => updateStatus(supplierPayment.id, 'OVERDUE')}
                                                    className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200"
                                                >
                                                    Marcar em atraso
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
