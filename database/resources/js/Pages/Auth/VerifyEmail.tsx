import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Verificar email" />

            <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Confirmação</p>
                <h1 className="mt-1 text-2xl font-black text-slate-900">Verifica o teu email</h1>
                <p className="mt-1 text-sm text-slate-600">
                    Antes de continuar, confirma o teu endereço através do link que enviámos.
                    Se não recebeste, podes pedir novo envio.
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
                    Enviámos um novo link de verificação para o teu email.
                </div>
            )}

            <form onSubmit={submit}>
                <div className="mt-4 flex items-center justify-between">
                    <PrimaryButton className="!rounded-xl !px-5 !py-2.5" disabled={processing}>
                        {processing ? 'A reenviar...' : 'Reenviar verificação'}
                    </PrimaryButton>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Terminar sessão
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
