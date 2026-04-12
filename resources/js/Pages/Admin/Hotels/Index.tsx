import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { PageProps } from "@/types";
import { Head, Link, router, usePage } from "@inertiajs/react";

interface HotelItem {
    id: number;
    event_name: string;
    name: string;
    address: string;
    supplier_name: string;
    website_url?: string | null;
    gallery_images: Array<{ path: string; url: string }>;
    is_active: boolean;
}

interface HotelsIndexProps {
    hotels: HotelItem[];
}

export default function HotelsIndex({ hotels }: HotelsIndexProps) {
    const flash = usePage<PageProps>().props.flash;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Hotéis Admin
                </h2>
            }
        >
            <Head title="Hotéis Admin" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <p className="text-sm text-gray-600">
                            Gere hotéis e ligação a fornecedores por evento.
                        </p>
                        <div className="inline-flex flex-wrap items-center gap-2">
                            <Link
                                href={route("admin.dashboard")}
                                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
                            >
                                Voltar ao painel
                            </Link>
                            <Link
                                href={route("admin.hotels.create")}
                                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                            >
                                Novo hotel
                            </Link>
                        </div>
                    </div>

                    {flash?.success ? (
                        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                            {flash.success}
                        </div>
                    ) : null}

                    <div className="-mx-4 overflow-x-auto rounded-lg bg-white shadow-sm sm:mx-0">
                        <table className="w-full min-w-[1040px] divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                                        Hotel
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                                        Evento
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                                        Fornecedor
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
                                {hotels.map((hotel) => (
                                    <tr key={hotel.id}>
                                        <td className="px-4 py-3">
                                            {hotel.gallery_images[0]?.url ? (
                                                <img
                                                    src={
                                                        hotel.gallery_images[0]
                                                            .url
                                                    }
                                                    alt={hotel.name}
                                                    className="mb-2 h-20 w-28 rounded-md object-cover"
                                                />
                                            ) : null}
                                            <p className="font-medium text-gray-900">
                                                {hotel.name}
                                            </p>
                                            <p className="text-gray-500">
                                                {hotel.address}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {hotel.gallery_images.length}{" "}
                                                foto(s)
                                            </p>
                                            {hotel.website_url ? (
                                                <a
                                                    href={hotel.website_url}
                                                    className="text-xs text-indigo-600 hover:text-indigo-500"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    {hotel.website_url}
                                                </a>
                                            ) : null}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            {hotel.event_name}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            {hotel.supplier_name}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    hotel.is_active
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-700"
                                                }`}
                                            >
                                                {hotel.is_active
                                                    ? "Ativo"
                                                    : "Inativo"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="inline-flex flex-wrap items-center gap-2">
                                                <Link
                                                    href={route(
                                                        "admin.hotels.edit",
                                                        hotel.id,
                                                    )}
                                                    className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                                                >
                                                    Editar
                                                </Link>
                                                <button
                                                    type="button"
                                                    className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200"
                                                    onClick={() => {
                                                        if (
                                                            confirm(
                                                                "Apagar este hotel?",
                                                            )
                                                        ) {
                                                            router.delete(
                                                                route(
                                                                    "admin.hotels.destroy",
                                                                    hotel.id,
                                                                ),
                                                            );
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
