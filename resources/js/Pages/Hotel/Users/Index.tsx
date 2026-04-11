import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

interface HotelUserItem {
    id: number;
    name: string;
    email: string;
    created_at?: string | null;
    can_delete: boolean;
}

interface HotelUsersProps {
    users: HotelUserItem[];
}

export default function HotelUsersIndex({ users }: HotelUsersProps) {
    const page = usePage<PageProps & { errors?: Record<string, string> }>().props;
    const flash = page.flash;
    const genericUserError = page.errors?.user;
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const {
        data: editData,
        setData: setEditData,
        patch,
        processing: updating,
        errors: updateErrors,
        reset: resetEdit,
        clearErrors: clearEditErrors,
    } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post(route('hotel.users.store'), {
            preserveScroll: true,
            onSuccess: () => reset('name', 'email', 'password', 'password_confirmation'),
        });
    };

    const startEdit = (user: HotelUserItem) => {
        setEditingUserId(user.id);
        setEditData({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
        });
        clearEditErrors();
    };

    const cancelEdit = () => {
        setEditingUserId(null);
        resetEdit();
        clearEditErrors();
    };

    const submitEdit = (userId: number) => {
        patch(route('hotel.users.update', userId), {
            preserveScroll: true,
            onSuccess: () => {
                cancelEdit();
            },
        });
    };

    const removeUser = (user: HotelUserItem) => {
        if (!confirm(`Apagar utilizador ${user.name}? Esta ação não pode ser revertida.`)) {
            return;
        }

        router.delete(route('hotel.users.destroy', user.id), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Utilizadores do Hotel</h2>}
        >
            <Head title="Utilizadores do Hotel" />

            <div className="py-10">
                <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900">Equipa do Hotel</h3>
                        <p className="mt-1 text-sm text-slate-600">
                            Estas contas têm acesso apenas às reservas do mesmo hotel.
                        </p>

                        {flash?.success ? (
                            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                                {flash.success}
                            </div>
                        ) : null}

                        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
                            <table className="w-full min-w-[860px] divide-y divide-slate-200 text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Nome</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Email</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Criado em</th>
                                        <th className="px-4 py-3 text-right font-semibold text-slate-600">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td className="px-4 py-3 font-medium text-slate-900">
                                                {editingUserId === user.id ? (
                                                    <input
                                                        type="text"
                                                        value={editData.name}
                                                        onChange={(event) => setEditData('name', event.target.value)}
                                                        className="w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    />
                                                ) : (
                                                    user.name
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-slate-700">
                                                {editingUserId === user.id ? (
                                                    <div className="space-y-2">
                                                        <input
                                                            type="email"
                                                            value={editData.email}
                                                            onChange={(event) => setEditData('email', event.target.value)}
                                                            className="w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                        />
                                                        <input
                                                            type="password"
                                                            value={editData.password}
                                                            onChange={(event) => setEditData('password', event.target.value)}
                                                            placeholder="Nova password (opcional)"
                                                            className="w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                        />
                                                        <input
                                                            type="password"
                                                            value={editData.password_confirmation}
                                                            onChange={(event) =>
                                                                setEditData('password_confirmation', event.target.value)
                                                            }
                                                            placeholder="Confirmar nova password"
                                                            className="w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                        />
                                                    </div>
                                                ) : (
                                                    user.email
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">{user.created_at ?? '-'}</td>
                                            <td className="px-4 py-3 text-right">
                                                {editingUserId === user.id ? (
                                                    <div className="inline-flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => submitEdit(user.id)}
                                                            disabled={updating}
                                                            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            Guardar
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={cancelEdit}
                                                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => startEdit(user)}
                                                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                                        >
                                                            Editar
                                                        </button>
                                                        {user.can_delete ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeUser(user)}
                                                                className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                                                            >
                                                                Apagar
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs font-medium text-slate-400">
                                                                Conta atual
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-500">
                                                Ainda não existem utilizadores para este hotel.
                                            </td>
                                        </tr>
                                    ) : null}
                                </tbody>
                            </table>
                        </div>
                        {(updateErrors.name || updateErrors.email || updateErrors.password || genericUserError) && editingUserId !== null ? (
                            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
                                {updateErrors.name ?? updateErrors.email ?? updateErrors.password ?? genericUserError}
                            </div>
                        ) : null}
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900">Criar Novo Utilizador</h3>
                        <p className="mt-1 text-sm text-slate-600">
                            O novo utilizador será criado com role <strong>HOTEL</strong>.
                        </p>

                        <form onSubmit={submit} className="mt-5 space-y-4">
                            <div>
                                <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
                                    Nome
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(event) => setData('name', event.target.value)}
                                    className="w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                {errors.name ? <p className="mt-1 text-xs text-rose-600">{errors.name}</p> : null}
                            </div>

                            <div>
                                <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(event) => setData('email', event.target.value)}
                                    className="w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                {errors.email ? <p className="mt-1 text-xs text-rose-600">{errors.email}</p> : null}
                            </div>

                            <div>
                                <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(event) => setData('password', event.target.value)}
                                    className="w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                {errors.password ? <p className="mt-1 text-xs text-rose-600">{errors.password}</p> : null}
                            </div>

                            <div>
                                <label htmlFor="password_confirmation" className="mb-1 block text-sm font-medium text-slate-700">
                                    Confirmar Password
                                </label>
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(event) => setData('password_confirmation', event.target.value)}
                                    className="w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {processing ? 'A criar...' : 'Criar utilizador'}
                            </button>
                        </form>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
