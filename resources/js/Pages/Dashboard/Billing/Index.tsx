import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

interface BillingDocumentItem {
    id: number;
    booking_id: string;
    document_type: 'INVOICE';
    number: string;
    installment_type: string;
    amount: number;
    currency: string;
    issued_at?: string | null;
    event_name: string;
    hotel_name: string;
    booking_status: string;
    payment_status?: string | null;
    booking_url: string;
    payment_url: string;
    download_url: string;
}

interface BillingIndexProps {
    documents: BillingDocumentItem[];
}

function badgeClass(status?: string | null): string {
    return status === 'PAID' || status === 'CONFIRMED'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : status === 'CANCELLED' || status === 'FAILED'
            ? 'border-rose-200 bg-rose-50 text-rose-700'
            : status === 'REFUNDED'
                ? 'border-amber-200 bg-amber-50 text-amber-700'
                : 'border-slate-200 bg-slate-100 text-slate-700';
}

function installmentLabel(installmentType: string): string {
    if (installmentType === 'DEPOSIT') {
        return 'Sinal';
    }

    if (installmentType === 'BALANCE') {
        return 'Restante';
    }

    return 'Total';
}

export default function BillingIndex({ documents }: BillingIndexProps) {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-slate-800">Faturas</h2>}
        >
            <Head title="Faturas" />

            <div className="bg-gradient-to-b from-slate-100 via-white to-slate-100 py-10">
                <div className="mx-auto max-w-6xl space-y-4 px-4 sm:px-6 lg:px-8">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Documentos</p>
                        <h1 className="mt-1 text-2xl font-black text-slate-900">Todos os comprovativos num único local</h1>
                        <p className="mt-1 text-sm text-slate-600">
                            Consulta as faturas emitidas e faz download em poucos cliques.
                        </p>
                    </div>

                    {documents.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm">
                            Ainda não existem faturas emitidas para a tua conta.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {documents.map((document) => (
                                <div
                                    key={document.id}
                                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                >
                                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold uppercase text-indigo-700">
                                                    Fatura
                                                </span>
                                                <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase text-slate-700">
                                                    {installmentLabel(document.installment_type)}
                                                </span>
                                            </div>
                                            <h3 className="mt-2 text-lg font-semibold text-slate-900">{document.number}</h3>
                                            <p className="text-sm text-slate-600">
                                                Reserva {document.booking_id} - {document.hotel_name}
                                            </p>
                                            <p className="text-sm text-slate-500">{document.event_name}</p>
                                            <p className="text-sm text-slate-600">
                                                Emitido em: {document.issued_at ?? 'N/D'}
                                            </p>
                                        </div>

                                        <div className="text-left md:text-right">
                                            <p className="text-lg font-semibold text-slate-900">
                                                {document.amount.toFixed(2)} {document.currency}
                                            </p>
                                            <div className="mt-2 flex flex-wrap justify-start gap-2 md:justify-end">
                                                <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase ${badgeClass(document.booking_status)}`}>
                                                    Reserva: {document.booking_status}
                                                </span>
                                                <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase ${badgeClass(document.payment_status ?? 'N/D')}`}>
                                                    Pagamento: {document.payment_status ?? 'N/D'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <a
                                            href={document.download_url}
                                            className="inline-flex rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-black"
                                        >
                                            Download
                                        </a>
                                        <Link
                                            href={document.booking_url}
                                            className="inline-flex rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                                        >
                                            Ver reserva
                                        </Link>
                                        <Link
                                            href={document.payment_url}
                                            className="inline-flex rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                                        >
                                            Ver pagamento
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
