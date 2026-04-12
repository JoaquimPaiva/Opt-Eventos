import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useMemo } from 'react';

function buildNationalityOptions(): string[] {
    const fallbackRegions = ['Portugal', 'Brasil', 'Espanha', 'França', 'Alemanha', 'Reino Unido', 'Estados Unidos'];

    if (typeof Intl.DisplayNames === 'undefined') {
        return fallbackRegions;
    }

    const displayNames = new Intl.DisplayNames(['pt-PT', 'pt'], { type: 'region' });
    const regionNames = new Set<string>();
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (const first of letters) {
        for (const second of letters) {
            const regionCode = `${first}${second}`;
            const name = displayNames.of(regionCode);

            if (!name || name === regionCode) {
                continue;
            }

            const normalizedName = name.toLowerCase();
            if (normalizedName.includes('desconhecida') || normalizedName.includes('região desconhecida')) {
                continue;
            }

            regionNames.add(name);
        }
    }

    if (regionNames.size === 0) {
        return fallbackRegions;
    }

    return Array.from(regionNames).sort((a, b) => a.localeCompare(b, 'pt-PT'));
}

export default function Register() {
    const nationalityOptions = useMemo(() => buildNationalityOptions(), []);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        nationality: '',
        nif: '',
        password: '',
        password_confirmation: '',
        accept_terms: false,
        accept_privacy: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Criar conta" />

            <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Nova conta</p>
                <h1 className="mt-1 text-2xl font-black text-slate-900">Cria a tua conta OptEventos</h1>
                <p className="mt-1 text-sm text-slate-600">
                    Regista-te para reservar hotéis por evento e acompanhar o estado dos pagamentos.
                </p>
            </div>

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="name" value="Nome" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="nationality" value="Nacionalidade" />
                    <select
                        id="nationality"
                        name="nationality"
                        value={data.nationality}
                        className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        onChange={(e) => setData('nationality', e.target.value)}
                        required
                    >
                        <option value="">Seleciona a nacionalidade</option>
                        {nationalityOptions.map((nationality) => (
                            <option key={nationality} value={nationality}>
                                {nationality}
                            </option>
                        ))}
                    </select>

                    <InputError message={errors.nationality} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="nif" value="NIF (opcional)" />

                    <TextInput
                        id="nif"
                        name="nif"
                        value={data.nif}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('nif', e.target.value)}
                    />

                    <InputError message={errors.nif} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Palavra-passe" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirmar palavra-passe"
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="mt-5 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <label className="flex items-start gap-3 text-sm text-slate-700">
                        <Checkbox
                            id="accept_terms"
                            name="accept_terms"
                            checked={data.accept_terms}
                            onChange={(event) =>
                                setData('accept_terms', event.target.checked)
                            }
                            className="mt-0.5"
                        />
                        <span>
                            Li e aceito os{' '}
                            <Link href={route('legal.terms')} className="font-semibold underline">
                                Termos e Condições
                            </Link>
                            .
                        </span>
                    </label>
                    <InputError message={errors.accept_terms} />

                    <label className="flex items-start gap-3 text-sm text-slate-700">
                        <Checkbox
                            id="accept_privacy"
                            name="accept_privacy"
                            checked={data.accept_privacy}
                            onChange={(event) =>
                                setData('accept_privacy', event.target.checked)
                            }
                            className="mt-0.5"
                        />
                        <span>
                            Li e aceito a{' '}
                            <Link href={route('legal.privacy')} className="font-semibold underline">
                                Política de Privacidade
                            </Link>
                            .
                        </span>
                    </label>
                    <InputError message={errors.accept_privacy} />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Já tens conta?
                    </Link>

                    <PrimaryButton className="ms-4 !rounded-xl !px-5 !py-2.5" disabled={processing}>
                        {processing ? 'A criar...' : 'Criar conta'}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
