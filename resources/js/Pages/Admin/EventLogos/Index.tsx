import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { PageProps } from "@/types";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { FormEvent, useState } from "react";

interface EventLogoItem {
    id: number;
    name: string;
    image_path: string;
    image_url: string | null;
    display_order: number;
    is_active: boolean;
}

interface EventLogosIndexProps {
    logos: EventLogoItem[];
}

export default function EventLogosIndex({ logos }: EventLogosIndexProps) {
    const flash = usePage<PageProps>().props.flash;
    const [editingLogoId, setEditingLogoId] = useState<number | null>(null);

    const createForm = useForm<{
        name: string;
        image: File | null;
        display_order: number;
        is_active: boolean;
    }>({
        name: "",
        image: null,
        display_order: 0,
        is_active: true,
    });

    const editForm = useForm<{
        name: string;
        image: File | null;
        display_order: number;
        is_active: boolean;
    }>({
        name: "",
        image: null,
        display_order: 0,
        is_active: true,
    });

    const submitCreate = (event: FormEvent) => {
        event.preventDefault();

        createForm.post(route("admin.event-logos.store"), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () =>
                createForm.reset("name", "image", "display_order", "is_active"),
        });
    };

    const startEdit = (logo: EventLogoItem) => {
        setEditingLogoId(logo.id);
        editForm.setData({
            name: logo.name,
            image: null,
            display_order: logo.display_order,
            is_active: logo.is_active,
        });
        editForm.clearErrors();
    };

    const cancelEdit = () => {
        setEditingLogoId(null);
        editForm.reset();
        editForm.clearErrors();
    };

    const submitEdit = (event: FormEvent, logoId: number) => {
        event.preventDefault();

        editForm.patch(route("admin.event-logos.update", logoId), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                cancelEdit();
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Logos de Eventos
                </h2>
            }
        >
            <Head title="Logos de Eventos" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <p className="text-sm text-gray-600">
                            Gere os logos da strip horizontal apresentada na homepage.
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

                    <div className="rounded-lg bg-white p-5 shadow-sm">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                            Adicionar logo
                        </h3>
                        <form
                            onSubmit={submitCreate}
                            className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5"
                        >
                            <div className="xl:col-span-2">
                                <label className="mb-1 block text-xs font-semibold text-gray-600">
                                    Nome
                                </label>
                                <input
                                    type="text"
                                    value={createForm.data.name}
                                    onChange={(event) =>
                                        createForm.setData("name", event.target.value)
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                    placeholder="Ex: Lisbon Business Summit"
                                />
                                {createForm.errors.name ? (
                                    <p className="mt-1 text-xs text-red-600">
                                        {createForm.errors.name}
                                    </p>
                                ) : null}
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-gray-600">
                                    Ordem
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    value={createForm.data.display_order}
                                    onChange={(event) =>
                                        createForm.setData(
                                            "display_order",
                                            Number.parseInt(event.target.value || "0", 10),
                                        )
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                />
                                {createForm.errors.display_order ? (
                                    <p className="mt-1 text-xs text-red-600">
                                        {createForm.errors.display_order}
                                    </p>
                                ) : null}
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-gray-600">
                                    Imagem
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) =>
                                        createForm.setData(
                                            "image",
                                            event.target.files?.[0] ?? null,
                                        )
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                />
                                {createForm.errors.image ? (
                                    <p className="mt-1 text-xs text-red-600">
                                        {createForm.errors.image}
                                    </p>
                                ) : null}
                            </div>

                            <div className="flex items-end gap-3">
                                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={createForm.data.is_active}
                                        onChange={(event) =>
                                            createForm.setData("is_active", event.target.checked)
                                        }
                                        className="rounded border-gray-300 text-indigo-600"
                                    />
                                    Ativo
                                </label>

                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="-mx-4 overflow-x-auto rounded-lg bg-white shadow-sm sm:mx-0">
                        <table className="w-full min-w-[960px] divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                                        Preview
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                                        Nome
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                                        Ordem
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
                                {logos.map((logo) => {
                                    const isEditing = editingLogoId === logo.id;

                                    return (
                                        <tr key={logo.id}>
                                            <td className="px-4 py-3">
                                                {logo.image_url ? (
                                                    <img
                                                        src={logo.image_url}
                                                        alt={logo.name}
                                                        className="h-14 w-14 rounded-full border border-gray-200 object-cover"
                                                    />
                                                ) : (
                                                    <div className="grid h-14 w-14 place-items-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
                                                        Sem
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {isEditing ? (
                                                    <>
                                                        <input
                                                            type="text"
                                                            value={editForm.data.name}
                                                            onChange={(event) =>
                                                                editForm.setData(
                                                                    "name",
                                                                    event.target.value,
                                                                )
                                                            }
                                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                                        />
                                                        {editForm.errors.name ? (
                                                            <p className="mt-1 text-xs text-red-600">
                                                                {editForm.errors.name}
                                                            </p>
                                                        ) : null}
                                                    </>
                                                ) : (
                                                    <p className="font-medium text-gray-900">
                                                        {logo.name}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {isEditing ? (
                                                    <>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            value={editForm.data.display_order}
                                                            onChange={(event) =>
                                                                editForm.setData(
                                                                    "display_order",
                                                                    Number.parseInt(
                                                                        event.target.value || "0",
                                                                        10,
                                                                    ),
                                                                )
                                                            }
                                                            className="w-28 rounded-md border border-gray-300 px-3 py-2 text-sm"
                                                        />
                                                        {editForm.errors.display_order ? (
                                                            <p className="mt-1 text-xs text-red-600">
                                                                {editForm.errors.display_order}
                                                            </p>
                                                        ) : null}
                                                    </>
                                                ) : (
                                                    <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                                                        {logo.display_order}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {isEditing ? (
                                                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                                                        <input
                                                            type="checkbox"
                                                            checked={editForm.data.is_active}
                                                            onChange={(event) =>
                                                                editForm.setData(
                                                                    "is_active",
                                                                    event.target.checked,
                                                                )
                                                            }
                                                            className="rounded border-gray-300 text-indigo-600"
                                                        />
                                                        Ativo
                                                    </label>
                                                ) : (
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                            logo.is_active
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-gray-100 text-gray-700"
                                                        }`}
                                                    >
                                                        {logo.is_active ? "Ativo" : "Inativo"}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {isEditing ? (
                                                    <form
                                                        onSubmit={(event) => submitEdit(event, logo.id)}
                                                        className="inline-flex flex-wrap items-center justify-end gap-2"
                                                    >
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(event) =>
                                                                editForm.setData(
                                                                    "image",
                                                                    event.target.files?.[0] ?? null,
                                                                )
                                                            }
                                                            className="max-w-[220px] rounded-md border border-gray-300 px-3 py-1.5 text-xs"
                                                        />
                                                        <button
                                                            type="submit"
                                                            disabled={editForm.processing}
                                                            className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                                                        >
                                                            Guardar
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={cancelEdit}
                                                            className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </form>
                                                ) : (
                                                    <div className="inline-flex flex-wrap items-center gap-2">
                                                        <button
                                                            type="button"
                                                            className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                                                            onClick={() => startEdit(logo)}
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200"
                                                            onClick={() => {
                                                                if (confirm("Apagar este logo?")) {
                                                                    router.delete(
                                                                        route(
                                                                            "admin.event-logos.destroy",
                                                                            logo.id,
                                                                        ),
                                                                        {
                                                                            preserveScroll: true,
                                                                        },
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            Apagar
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
