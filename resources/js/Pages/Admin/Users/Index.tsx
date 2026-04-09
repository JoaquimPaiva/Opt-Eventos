import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEvent, useMemo, useState } from 'react';

type UserRole = 'ADMIN' | 'CLIENT' | 'HOTEL';

interface UserItem {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    hotel_id?: number | null;
    hotel_name?: string | null;
    created_at?: string | null;
}

interface HotelOption {
    id: number;
    name: string;
}

interface AdminUsersProps {
    users: UserItem[];
    hotels: HotelOption[];
    filters: {
        search?: string;
    };
    current_admin_id?: number | null;
}

interface RoleDraft {
    role: UserRole;
    hotel_id: string;
}

export default function AdminUsersIndex({
    users,
    hotels,
    filters,
    current_admin_id,
}: AdminUsersProps) {
    const flash = usePage<PageProps>().props.flash;
    const [search, setSearch] = useState(filters.search ?? '');
    const [drafts, setDrafts] = useState<Record<number, RoleDraft>>(
        () => users.reduce((accumulator, user) => ({
            ...accumulator,
            [user.id]: {
                role: user.role,
                hotel_id: user.hotel_id ? String(user.hotel_id) : '',
            },
        }), {}),
    );

    const usersById = useMemo(
        () => users.reduce<Record<number, UserItem>>((accumulator, user) => ({ ...accumulator, [user.id]: user }), {}),
        [users],
    );

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();
        router.get(
            route('admin.users.index'),
            { search },
            { preserveState: true, preserveScroll: true },
        );
    };

    const updateDraft = (userId: number, patch: Partial<RoleDraft>) => {
        setDrafts((previous) => ({
            ...previous,
            [userId]: {
                ...(previous[userId] ?? { role: 'CLIENT', hotel_id: '' }),
                ...patch,
            },
        }));
    };

    const saveUserRole = (user: UserItem) => {
        const draft = drafts[user.id] ?? { role: user.role, hotel_id: user.hotel_id ? String(user.hotel_id) : '' };
        if (draft.role === 'HOTEL' && draft.hotel_id === '') {
            window.alert('Seleciona um hotel para utilizadores com função HOTEL.');
            return;
        }

        router.patch(
            route('admin.users.update-role', user.id),
            {
                role: draft.role,
                hotel_id: draft.role === 'HOTEL' ? Number.parseInt(draft.hotel_id, 10) : null,
            },
            { preserveScroll: true },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Utilizadores Admin
                </h2>
            }
        >
            <Head title="Utilizadores Admin" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Gere permissões de utilizador e acesso por hotel.
                        </p>
                        <Link
                            href={route('admin.dashboard')}
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

                    <form onSubmit={submitSearch} className="flex gap-2">
                        <input
                            type="text"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Pesquisar por nome ou email"
                            className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        <button
                            type="submit"
                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                        >
                            Pesquisar
                        </button>
                    </form>

                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                                        Utilizador
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                                        Função
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                                        Hotel associado
                                    </th>
                                    <th className="px-4 py-3 text-right font-semibold text-gray-600">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {users.map((user) => {
                                    const draft = drafts[user.id] ?? { role: user.role, hotel_id: user.hotel_id ? String(user.hotel_id) : '' };
                                    const isSelfAdmin = current_admin_id === user.id;
                                    const disableRoleSelect = isSelfAdmin && user.role === 'ADMIN';

                                    return (
                                        <tr key={user.id}>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-900">
                                                    {user.name}
                                                </p>
                                                <p className="text-gray-500">
                                                    {user.email}
                                                </p>
                                                {isSelfAdmin ? (
                                                    <p className="mt-1 text-xs text-gray-500">A tua conta</p>
                                                ) : null}
                                            </td>
                                            <td className="px-4 py-3">
                                                <select
                                                    value={draft.role}
                                                    onChange={(event) => updateDraft(user.id, { role: event.target.value as UserRole, hotel_id: event.target.value === 'HOTEL' ? draft.hotel_id : '' })}
                                                    disabled={disableRoleSelect}
                                                    className="rounded-md border-gray-300 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                                                >
                                                    <option value="CLIENT">CLIENT</option>
                                                    <option value="HOTEL">HOTEL</option>
                                                    <option value="ADMIN">ADMIN</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-3">
                                                {draft.role === 'HOTEL' ? (
                                                    <select
                                                        value={draft.hotel_id}
                                                        onChange={(event) => updateDraft(user.id, { hotel_id: event.target.value })}
                                                        className="w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    >
                                                        <option value="">Seleciona um hotel</option>
                                                        {hotels.map((hotel) => (
                                                            <option key={hotel.id} value={hotel.id}>
                                                                {hotel.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className="text-xs text-gray-500">
                                                        {usersById[user.id]?.hotel_name ?? 'Sem hotel associado'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => saveUserRole(user)}
                                                    className="rounded-md bg-indigo-100 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-200"
                                                >
                                                    Guardar
                                                </button>
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
