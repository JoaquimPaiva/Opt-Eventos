import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";

type Props = {
    status?: string;
    email: string;
    expiresAt: string;
};

export default function AdminTwoFactorChallenge({ status, email, expiresAt }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        code: "",
    });

    const onSubmit: FormEventHandler = (event) => {
        event.preventDefault();

        post(route("admin.2fa.verify"), {
            onFinish: () => reset("code"),
        });
    };

    const resendCode = () => {
        post(route("admin.2fa.resend"), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const formattedExpiry = new Date(expiresAt).toLocaleTimeString("pt-PT", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <GuestLayout>
            <Head title="Verificação 2FA" />

            {status && (
                <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
                    {status}
                </div>
            )}

            <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Segurança de administrador</p>
                <h1 className="mt-1 text-2xl font-black text-slate-900">Confirma o teu acesso</h1>
                <p className="mt-1 text-sm text-slate-600">
                    Enviámos um código de 6 dígitos para <span className="font-semibold text-slate-800">{email}</span>.
                    Introduz o código para concluir o login.
                </p>
                <p className="mt-2 text-xs text-slate-500">Código válido até às {formattedExpiry}.</p>
            </div>

            <form onSubmit={onSubmit}>
                <div>
                    <InputLabel htmlFor="code" value="Código de verificação" />
                    <TextInput
                        id="code"
                        type="text"
                        name="code"
                        value={data.code}
                        className="mt-1 block w-full tracking-[0.35em]"
                        autoComplete="one-time-code"
                        inputMode="numeric"
                        maxLength={6}
                        isFocused={true}
                        onChange={(event) => setData("code", event.target.value.replace(/\D/g, "").slice(0, 6))}
                    />
                    <InputError message={errors.code} className="mt-2" />
                </div>

                <div className="mt-6 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        className="rounded-md text-sm font-medium text-slate-600 underline hover:text-slate-800"
                        onClick={resendCode}
                        disabled={processing}
                    >
                        Reenviar código
                    </button>

                    <PrimaryButton className="!rounded-xl !px-5 !py-2.5" disabled={processing}>
                        {processing ? "A validar..." : "Validar e entrar"}
                    </PrimaryButton>
                </div>

                <div className="mt-5 text-sm text-slate-600">
                    <Link href={route("login")} className="underline hover:text-slate-800">
                        Voltar ao login
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
