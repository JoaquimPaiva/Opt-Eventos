import { Link, usePage } from "@inertiajs/react";
import { PageProps } from "@/types";
import LegalLayout from "./Partials/LegalLayout";

export default function PrivacyPolicy() {
    const legal = usePage<PageProps>().props.legal;
    const operator = legal?.operator;
    const privacy = legal?.privacy;

    const retention = privacy?.retention ?? {};
    const processors = privacy?.processors ?? [];

    return (
        <LegalLayout
            title="Política de Privacidade"
            subtitle="Informação detalhada sobre o tratamento de dados pessoais na plataforma OptEventos."
        >
            <h2>1. Responsável pelo tratamento</h2>
            <p>
                O responsável pelo tratamento é <strong>{operator?.legal_name ?? "OptViagens, Lda."}</strong>, com NIF <strong>{operator?.nif ?? "509999999"}</strong>, sede em <strong>{operator?.address ?? "Lisboa, Portugal"}</strong>, contacto geral <strong>{operator?.email ?? "support@optviagens.pt"}</strong> e contacto de privacidade <strong>{privacy?.contact_email ?? "privacy@optviagens.pt"}</strong>.
            </p>

            <h2>2. Finalidades e fundamentos jurídicos</h2>
            <ul>
                <li>Gestão de conta e autenticação (execução de contrato).</li>
                <li>Processamento de reservas, pagamentos e faturação (execução de contrato e obrigação legal).</li>
                <li>Suporte ao cliente e prevenção de fraude (interesse legítimo).</li>
                <li>Cookies opcionais e comunicações não essenciais (consentimento).</li>
            </ul>

            <h2>3. Categorias de dados tratados</h2>
            <ul>
                <li>Identificação e contacto: nome, email, nacionalidade e NIF (quando fornecido).</li>
                <li>Dados de reserva: evento, hotel, datas, hóspedes e estado da reserva.</li>
                <li>Dados de pagamento: referências, estado, datas de pagamento e comprovativos técnicos.</li>
                <li>Dados técnicos: IP, registos de acesso, browser/dispositivo e preferências de cookies.</li>
            </ul>

            <h2>4. Prazos de conservação</h2>
            <p>Os dados são conservados apenas pelo período necessário e pelos prazos legais aplicáveis. Referência atual:</p>
            <ul>
                {Object.entries(retention).map(([category, value]) => (
                    <li key={category}>
                        <strong>{category}:</strong> {value}
                    </li>
                ))}
            </ul>

            <h2>5. Subcontratantes e destinatários</h2>
            <p>Os dados podem ser tratados por subcontratantes estritamente necessários à operação da plataforma, incluindo:</p>
            <ul>
                {processors.map((processor) => (
                    <li key={processor}>{processor}</li>
                ))}
            </ul>

            <h2>6. Transferências internacionais</h2>
            <p>
                {privacy?.international_transfers ??
                    "Quando existam transferências internacionais, são adotadas garantias legais adequadas."}
            </p>

            <h2>7. Direitos dos titulares</h2>
            <p>
                Nos termos do RGPD, podes exercer os direitos de acesso, retificação, apagamento, limitação, oposição, portabilidade e retirada de consentimento. Para exercer direitos, contacta <strong>{privacy?.contact_email ?? "privacy@optviagens.pt"}</strong>.
            </p>
            <p>
                Sem prejuízo de outros meios, podes apresentar reclamação à CNPD.
            </p>

            <h2>8. Segurança</h2>
            <p>
                São adotadas medidas técnicas e organizativas proporcionais ao risco para proteger os dados contra perda, uso indevido, acesso não autorizado e alteração indevida.
            </p>

            <h2>9. Cookies</h2>
            <p>
                A informação sobre cookies está na{" "}
                <Link href={route("legal.cookies")} className="underline">
                    Política de Cookies
                </Link>
                .
            </p>

            <h2>10. Atualizações</h2>
            <p>
                Esta política pode ser revista para refletir alterações legais, técnicas e operacionais.
            </p>
            <p className="text-xs text-slate-500">
                Versão legal: {legal?.version ?? "2026-04-11"}.
            </p>
        </LegalLayout>
    );
}
