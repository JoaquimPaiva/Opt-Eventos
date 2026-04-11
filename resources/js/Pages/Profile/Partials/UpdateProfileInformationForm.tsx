import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
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

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage().props.auth.user;
    const nationalityOptions = useMemo(() => buildNationalityOptions(), []);

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            nationality: user.nationality ?? '',
            nif: user.nif ?? '',
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Informação de Perfil
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Atualiza os dados do teu perfil e o endereço de email.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Nome" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                <div>
                    <InputLabel htmlFor="nationality" value="Nacionalidade" />
                    <select
                        id="nationality"
                        name="nationality"
                        value={data.nationality}
                        className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        onChange={(e) => setData('nationality', e.target.value)}
                    >
                        <option value="">Seleciona a nacionalidade</option>
                        {nationalityOptions.map((nationality) => (
                            <option key={nationality} value={nationality}>
                                {nationality}
                            </option>
                        ))}
                    </select>

                    <InputError className="mt-2" message={errors.nationality} />
                </div>

                <div>
                    <InputLabel htmlFor="nif" value="NIF (opcional)" />

                    <TextInput
                        id="nif"
                        className="mt-1 block w-full"
                        value={data.nif}
                        onChange={(e) => setData('nif', e.target.value)}
                    />

                    <InputError className="mt-2" message={errors.nif} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            O teu endereço de email não está verificado.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Clica aqui para reenviar o email de verificação.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                Foi enviado um novo link de verificação para o
                                teu email.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Guardar</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">
                            Guardado.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
