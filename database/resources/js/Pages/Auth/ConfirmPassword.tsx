import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Confirmar acesso" />

            <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Área segura</p>
                <h1 className="mt-1 text-2xl font-black text-slate-900">Confirma a tua palavra-passe</h1>
                <p className="mt-1 text-sm text-slate-600">
                    Para continuar nesta ação sensível, valida novamente as tuas credenciais.
                </p>
            </div>

            <form onSubmit={submit}>
                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Palavra-passe" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        isFocused={true}
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <PrimaryButton className="ms-4 !rounded-xl !px-5 !py-2.5" disabled={processing}>
                        {processing ? 'A confirmar...' : 'Confirmar'}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
