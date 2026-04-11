import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

interface HotelItem {
    id: number;
    name: string;
    address: string;
    description: string | null;
    image: string | null;
    available_rates: number;
    from_price: number;
    currency: string;
}

interface HotelsProps {
    event: {
        id: number;
        name: string;
        booking_start: string | null;
        booking_end: string | null;
    };
    filters: {
        event_id: string;
        check_in: string;
        check_out: string;
    };
    hotels: HotelItem[];
}

export default function CheckoutHotels({ event, filters, hotels }: HotelsProps) {
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Hotéis Disponíveis</h2>}>
            <Head title="Hotéis Disponíveis" />

            <div className="bg-gradient-to-b from-slate-100 via-white to-slate-100 py-10">
                <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <Link
                        href="/"
                        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                    >
                        Voltar e alterar datas/evento na home
                    </Link>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h1 className="text-2xl font-black text-slate-900">2. Escolhe o hotel</h1>
                        <p className="mt-1 text-sm text-slate-600">
                            Evento <strong>{event.name}</strong> | {filters.check_in} até {filters.check_out}
                        </p>
                    </div>

                    {hotels.length === 0 ? (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
                            Não encontrámos hotéis disponíveis para esta seleção.
                        </div>
                    ) : (
                        <div className="grid gap-5 md:grid-cols-3">
                            {hotels.map((hotel) => (
                                <div key={hotel.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                    {hotel.image ? (
                                        <img src={hotel.image} alt={hotel.name} className="h-48 w-full object-cover" />
                                    ) : (
                                        <div className="grid h-48 place-items-center bg-slate-100 text-sm text-slate-500">Sem imagem</div>
                                    )}
                                    <div className="space-y-3 p-5">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900">{hotel.name}</h3>
                                            <p className="text-sm text-slate-600">{hotel.address}</p>
                                        </div>
                                        {hotel.description ? <p className="text-sm text-slate-600">{hotel.description}</p> : null}
                                        <p className="text-sm text-slate-700">
                                            Desde <strong>{hotel.from_price.toFixed(2)} {hotel.currency}</strong> por noite
                                        </p>
                                        <p className="text-xs uppercase tracking-wide text-slate-500">
                                            {hotel.available_rates} opções de quarto/refeição disponíveis
                                        </p>
                                        <Link
                                            href={route('checkout.hotels.show', { hotel: hotel.id, ...filters })}
                                            className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
                                        >
                                            Ver detalhes
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
