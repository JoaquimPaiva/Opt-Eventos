import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Recuperar acesso" />

            <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Recuperação</p>
                <h1 className="mt-1 text-2xl font-black text-slate-900">Esqueceste a palavra-passe?</h1>
                <p className="mt-1 text-sm text-slate-600">
                    Indica o teu email e enviamos um link para definires uma nova palavra-passe.
                </p>
            </div>

            {status && (
                <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <TextInput
                    id="email"
                    type="email"
                    name="email"
                    value={data.email}
                    className="mt-1 block w-full"
                    isFocused={true}
                    onChange={(e) => setData('email', e.target.value)}
                />

                <InputError message={errors.email} className="mt-2" />

                <div className="mt-4 flex items-center justify-end">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Voltar ao login
                    </Link>

                    <PrimaryButton className="ms-4 !rounded-xl !px-5 !py-2.5" disabled={processing}>
                        {processing ? 'A enviar...' : 'Enviar link de recuperação'}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
