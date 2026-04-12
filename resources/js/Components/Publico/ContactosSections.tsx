export function PublicContactosHeroSection() {
    return (
        <section className="rounded-3xl border border-slate-200 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 p-6 text-white shadow-[0_24px_70px_-45px_rgba(249,115,22,0.75)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
                Contacto
            </p>
            <h1 className="mt-2 text-3xl font-black">
                Fala com a equipa OptEventos
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/90">
                Estamos disponíveis para ajudar com reservas, dúvidas sobre
                eventos e suporte de pagamentos.
            </p>
        </section>
    );
}

export function PublicContactosChannelsSection() {
    return (
        <section className="mt-6 grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <p className="text-sm font-semibold text-slate-900">Email</p>
                <p className="mt-2 text-sm text-slate-600">
                    support@optviagens.pt
                </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <p className="text-sm font-semibold text-slate-900">Telefone</p>
                <p className="mt-2 text-sm text-slate-600">+351 210 000 000</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <p className="text-sm font-semibold text-slate-900">Morada</p>
                <p className="mt-2 text-sm text-slate-600">Lisboa, Portugal</p>
            </article>
        </section>
    );
}

export function PublicContactosInfoSection() {
    return (
        <section className="mt-6 grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Horário de suporte
                </p>
                <h2 className="mt-2 text-xl font-black text-slate-900">
                    Segunda a sábado, 09:00 - 21:00
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                    Respondemos com prioridade a pedidos relacionados com
                    reservas em andamento e pagamentos.
                </p>
                <div className="mt-4 space-y-2 text-sm text-slate-700">
                    <p>Tempo médio de resposta por email: até 2h úteis</p>
                    <p>
                        Tempo médio de resposta por telefone: imediato em horário
                        ativo
                    </p>
                </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Perguntas frequentes
                </p>
                <h2 className="mt-2 text-xl font-black text-slate-900">
                    Como te podemos ajudar?
                </h2>
                <div className="mt-4 space-y-3 text-sm text-slate-700">
                    <p>
                        <span className="font-semibold text-slate-900">
                            Alterar uma reserva:
                        </span>{" "}
                        usa o teu painel e abre o detalhe da reserva.
                    </p>
                    <p>
                        <span className="font-semibold text-slate-900">
                            Problemas no pagamento:
                        </span>{" "}
                        envia o ID da reserva para acelerarmos a validação.
                    </p>
                    <p>
                        <span className="font-semibold text-slate-900">
                            Parcerias de hotéis:
                        </span>{" "}
                        contacta-nos por email com os dados comerciais.
                    </p>
                </div>
            </article>
        </section>
    );
}
