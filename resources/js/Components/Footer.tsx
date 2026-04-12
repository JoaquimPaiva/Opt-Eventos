import { usePage, Link } from "@inertiajs/react";
import { PageProps } from "@/types";
import { assetUrl } from "@/lib/assetUrl";

type FooterProps = {
    laravelVersion?: string;
    phpVersion?: string;
};

export default function Footer({ laravelVersion, phpVersion }: FooterProps) {
    const legal = usePage<PageProps>().props.legal;
    const operator = legal?.operator;
    const ral = legal?.ral;
    const complaintsBookUrl =
        legal?.complaints_book_url ?? "https://www.livroreclamacoes.pt/";

    return (
        <footer
            id="contacto"
            className="mt-16 bg-[radial-gradient(circle_at_top_left,_#172554_0%,_#0b1220_46%,_#020617_100%)] px-4 py-14 text-slate-300 sm:px-6 sm:py-16 lg:px-8"
        >
            <div className="mx-auto max-w-7xl space-y-10">
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 shadow-[0_20px_80px_-40px_rgba(2,6,23,0.9)] backdrop-blur-sm sm:p-9">
                    <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr_1fr]">
                        <div>
                            <div className="flex flex-col items-start justify-center gap-3">
                                <Link
                                    href="/"
                                    className="flex items-center gap-3 pb-1"
                                >
                                    <img
                                        className="max-w-[110px]"
                                        src={assetUrl("/optviagens.png")}
                                        alt="OptViagens"
                                    />
                                </Link>
                                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                                    {operator?.brand_name ?? "OptEventos"}
                                </p>
                                {/* <span className="hidden rounded-full bg-[#0f172a] px-3 py-1.5 text-xs font-semibold text-white sm:inline-block">
                                    OptEventos
                                </span> */}
                            </div>
                            <p className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl">
                                Planeamento de estadias para eventos, com foco
                                em transparência e segurança.
                            </p>
                            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
                                Plataforma de reservas com informação clara de
                                tarifas, pagamentos e suporte dedicado para
                                cliente, hotel e equipa de operação.
                            </p>
                        </div>

                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-white/90">
                                Navegação
                            </p>
                            <div className="mt-4 grid gap-2.5 text-sm text-slate-300">
                                <Link
                                    href="/"
                                    className="transition hover:text-white"
                                >
                                    Home
                                </Link>
                                <Link
                                    href={route("events.index")}
                                    className="transition hover:text-white"
                                >
                                    Eventos
                                </Link>
                                <Link
                                    href={route("hotels.index")}
                                    className="transition hover:text-white"
                                >
                                    Hotéis parceiros
                                </Link>
                                <Link
                                    href={route("contacts.index")}
                                    className="transition hover:text-white"
                                >
                                    Contactos
                                </Link>
                                <Link
                                    href={route("legal.privacy")}
                                    className="transition hover:text-white"
                                >
                                    Privacidade
                                </Link>
                                <Link
                                    href={route("legal.cookies")}
                                    className="transition hover:text-white"
                                >
                                    Cookies
                                </Link>
                                <Link
                                    href={route("legal.terms")}
                                    className="transition hover:text-white"
                                >
                                    Termos
                                </Link>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-white/90">
                                Contacto e Reclamações
                            </p>
                            <div className="mt-4 space-y-2 text-sm text-slate-300">
                                <p>
                                    {operator?.email ?? "support@optviagens.pt"}
                                </p>
                                <p>{operator?.phone ?? "+351 210 000 000"}</p>
                                <p>{operator?.address ?? "Lisboa, Portugal"}</p>
                            </div>

                            <div className="mt-5 space-y-2 text-sm text-slate-300">
                                <a
                                    href={complaintsBookUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block transition hover:text-white"
                                >
                                    Livro de Reclamações Eletrónico
                                </a>
                                {ral?.website ? (
                                    <a
                                        href={ral.website}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block transition hover:text-white"
                                    >
                                        Entidade RAL
                                    </a>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-5 text-xs text-slate-400 sm:px-7">
                    <div className="space-y-2">
                        <p className="leading-6">
                            {operator?.legal_name ?? "OptViagens, Lda."} | NIF{" "}
                            {operator?.nif ?? "509999999"} |{" "}
                            {operator?.commercial_registry ??
                                "Conservatória do Registo Comercial de Lisboa"}{" "}
                            | Capital social{" "}
                            {operator?.share_capital ?? "10.000 EUR"}
                        </p>
                        {ral?.entity_name ? (
                            <p className="leading-6">
                                RAL: {ral.entity_name}
                                {ral.email ? ` | ${ral.email}` : ""}
                                {ral.phone ? ` | ${ral.phone}` : ""}
                            </p>
                        ) : null}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                        <p>
                            {operator?.brand_name ?? "OptEventos"} ©{" "}
                            {new Date().getFullYear()} - Todos os direitos
                            reservados.
                        </p>
                        {laravelVersion && phpVersion ? (
                            <p>
                                Laravel v{laravelVersion} | PHP v{phpVersion}
                            </p>
                        ) : null}
                    </div>
                </div>
            </div>
        </footer>
    );
}
