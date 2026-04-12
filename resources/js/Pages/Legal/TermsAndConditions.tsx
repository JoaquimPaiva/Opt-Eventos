import { Link, usePage } from "@inertiajs/react";
import { PageProps } from "@/types";
import LegalLayout from "./Partials/LegalLayout";

export default function TermsAndConditions() {
    const legal = usePage<PageProps>().props.legal;
    const operator = legal?.operator;
    const ral = legal?.ral;
    const complaintsBookUrl =
        legal?.complaints_book_url ?? "https://www.livroreclamacoes.pt/";

    return (
        <LegalLayout
            title="Termos e Condições"
            subtitle="Condições contratuais aplicáveis ao uso da plataforma e às reservas."
        >
            <h2>1. Identificação do operador</h2>
            <p>
                Este website é operado por <strong>{operator?.legal_name ?? "OptViagens, Lda."}</strong>, NIF <strong>{operator?.nif ?? "509999999"}</strong>, com sede em <strong>{operator?.address ?? "Lisboa, Portugal"}</strong>, email <strong>{operator?.email ?? "support@optviagens.pt"}</strong> e telefone <strong>{operator?.phone ?? "+351 210 000 000"}</strong>.
            </p>

            <h2>2. Objeto e âmbito</h2>
            <p>
                Os presentes termos regulam a utilização da plataforma OptEventos, incluindo pesquisa, seleção, reserva e pagamento de alojamento associado a eventos.
            </p>

            <h2>3. Condições de registo e conta</h2>
            <ul>
                <li>O utilizador compromete-se a fornecer dados verdadeiros e atualizados.</li>
                <li>As credenciais são pessoais e intransmissíveis.</li>
                <li>Qualquer uso indevido ou acesso não autorizado deve ser comunicado de imediato.</li>
            </ul>

            <h2>4. Informação pré-contratual de reserva</h2>
            <ul>
                <li>Preço total estimado, moeda, tipologia de quarto, regime e número de noites.</li>
                <li>Janela de reserva e limites de disponibilidade em tempo real.</li>
                <li>Política de cancelamento por tarifa: cancelamento gratuito, não reembolsável ou sinal não reembolsável.</li>
                <li>Quando aplicável, valor de sinal fixo e prazo para pagamento do remanescente antes do check-in.</li>
            </ul>

            <h2>5. Pagamentos, faturação e incumprimento</h2>
            <ul>
                <li>O pagamento é processado pelos métodos apresentados no checkout.</li>
                <li>Após pagamento, é emitido documento de faturação com base nos dados fornecidos pelo cliente.</li>
                <li>O incumprimento de prazos de pagamento pode determinar cancelamento ou alteração do estado da reserva conforme a tarifa contratada.</li>
            </ul>

            <h2>6. Cancelamentos e reembolsos</h2>
            <p>
                As regras de cancelamento e reembolso dependem estritamente da tarifa selecionada no momento da contratação, sendo apresentadas ao utilizador antes da confirmação da reserva.
            </p>

            <h2>7. Responsabilidade e disponibilidade</h2>
            <p>
                A plataforma adota medidas razoáveis para manter informação atualizada e serviços disponíveis, mas não garante disponibilidade ininterrupta nem se responsabiliza por falhas externas de terceiros (por exemplo, provedores de pagamento ou rede).
            </p>

            <h2>8. Proteção de dados e cookies</h2>
            <ul>
                <li>
                    <Link href={route("legal.privacy")} className="underline">
                        Política de Privacidade
                    </Link>
                </li>
                <li>
                    <Link href={route("legal.cookies")} className="underline">
                        Política de Cookies
                    </Link>
                </li>
            </ul>

            <h2>9. Reclamações e resolução de litígios</h2>
            <p>
                O utilizador pode apresentar reclamação através do Livro de Reclamações Eletrónico:
                <a
                    href={complaintsBookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-1 underline"
                >
                    {complaintsBookUrl}
                </a>
                .
            </p>
            {ral?.entity_name ? (
                <p>
                    Entidade RAL: <strong>{ral.entity_name}</strong>
                    {ral.website ? (
                        <>
                            {" "}
                            -{" "}
                            <a
                                href={ral.website}
                                target="_blank"
                                rel="noreferrer"
                                className="underline"
                            >
                                {ral.website}
                            </a>
                        </>
                    ) : null}
                    {ral.email ? ` | ${ral.email}` : ""}
                    {ral.phone ? ` | ${ral.phone}` : ""}
                </p>
            ) : null}

            <h2>10. Lei aplicável e foro</h2>
            <p>
                Os presentes termos regem-se pela lei portuguesa, sem prejuízo das normas imperativas de proteção do consumidor.
            </p>

            <h2>11. Nota sobre plataforma ODR europeia</h2>
            <p>
                A plataforma europeia ODR/RLL foi descontinuada em 20 de julho de 2025. Este website não utiliza esse mecanismo descontinuado.
            </p>

            <p className="text-xs text-slate-500">
                Versão legal: {legal?.version ?? "2026-04-11"}.
            </p>
        </LegalLayout>
    );
}
