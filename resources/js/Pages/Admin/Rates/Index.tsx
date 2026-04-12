import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';

interface RateItem {
    id: number;
    event_name: string;
    hotel_name: string;
    room_type: string;
    meal_plan: string;
    cost_price: number;
    sale_price: number;
    currency: string;
    stock: number;
    cancellation_policy: string;
    deposit_amount: number | null;
    balance_due_days_before_checkin: number | null;
    cancellation_deadline: string | null;
    is_active: boolean;
}

interface RatesIndexProps {
    rates: RateItem[];
}

export default function RatesIndex({ rates }: RatesIndexProps) {
    const flash = usePage<PageProps>().props.flash;

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Tarifas Admin</h2>}
        >
            <Head title="Tarifas Admin" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <p className="text-sm text-gray-600">Gere preços, stock e regras de cancelamento.</p>
                        <div className="inline-flex flex-wrap items-center gap-2">
                            <Link
                        href={route("admin.dashboard")}
                        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
                        >
                            Voltar ao painel
                        </Link>
                        <Link
                            href={route('admin.rates.create')}
                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                        >
                            Nova tarifa
                        </Link>
                        </div>
                    </div>

                    {flash?.success ? (
                        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                            {flash.success}
                        </div>
                    ) : null}

                    <div className="-mx-4 overflow-x-auto rounded-lg bg-white shadow-sm sm:mx-0">
                        <table className="w-full min-w-[980px] divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Tarifa</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Preços</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Stock</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Política</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Estado</th>
                                    <th className="px-4 py-3 text-right font-semibold text-gray-600">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {rates.map((rate) => (
                                    <tr key={rate.id}>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">{rate.hotel_name}</p>
                                            <p className="text-gray-500">{rate.event_name}</p>
                                            <p className="text-xs text-gray-500">
                                                {rate.room_type} / {rate.meal_plan}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            <p>Custo: {rate.cost_price} {rate.currency}</p>
                                            <p>Venda: {rate.sale_price} {rate.currency}</p>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">{rate.stock}</td>
                                        <td className="px-4 py-3 text-gray-700">
                                            <p>
                                                {rate.cancellation_policy === 'FREE_CANCELLATION'
                                                    ? 'Cancelamento gratuito'
                                                    : rate.cancellation_policy === 'NON_REFUNDABLE'
                                                        ? 'Não reembolsável'
                                                        : 'Sinal não reembolsável'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Prazo: {rate.cancellation_deadline ?? 'N/D'}
                                            </p>
                                            {rate.cancellation_policy === 'DEPOSIT_NON_REFUNDABLE' ? (
                                                <p className="text-xs text-gray-500">
                                                    Sinal: {Number(rate.deposit_amount ?? 0).toFixed(2)} {rate.currency} | Restante: {rate.balance_due_days_before_checkin ?? 0} dias antes
                                                </p>
                                            ) : null}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    rate.is_active
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                }`}
                                            >
                                                {rate.is_active ? 'Ativa' : 'Inativa'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="inline-flex flex-wrap items-center gap-2">
                                                <Link
                                                    href={route('admin.rates.edit', rate.id)}
                                                    className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                                                >
                                                    Editar
                                                </Link>
                                                <button
                                                    type="button"
                                                    className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200"
                                                    onClick={() => {
                                                        if (confirm('Apagar esta tarifa?')) {
                                                            router.delete(route('admin.rates.destroy', rate.id));
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
