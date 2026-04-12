import { Link, usePage } from "@inertiajs/react";
import { PageProps } from "@/types";
import LegalLayout from "./Partials/LegalLayout";

export default function CookiePolicy() {
    const legal = usePage<PageProps>().props.legal;
    const operator = legal?.operator;

    return (
        <LegalLayout
            title="Política de Cookies"
            subtitle="Como recolhemos consentimento, que cookies usamos e como os podes gerir."
        >
            <h2>1. O que são cookies</h2>
            <p>
                Cookies são pequenos ficheiros de texto guardados no dispositivo do utilizador para permitir funcionalidades técnicas, segurança e, mediante consentimento, funcionalidades opcionais.
            </p>

            <h2>2. Categorias de cookies</h2>
            <ul>
                <li>
                    <strong>Necessários:</strong> autenticação, segurança, sessão e funcionamento essencial.
                </li>
                <li>
                    <strong>Analíticos (opcionais):</strong> medição e melhoria de desempenho.
                </li>
                <li>
                    <strong>Personalização (opcionais):</strong> preferências e experiência adaptada.
                </li>
                <li>
                    <strong>Marketing (opcionais):</strong> medição e campanhas, quando implementadas.
                </li>
            </ul>

            <h2>3. Base legal</h2>
            <p>
                Cookies opcionais só são ativados após consentimento prévio e explícito do utilizador. O consentimento pode ser retirado a qualquer momento no gestor de cookies.
            </p>

            <h2>4. Bloqueio técnico e gestão de consentimento</h2>
            <p>
                Scripts e funcionalidades opcionais permanecem bloqueados até existir consentimento válido para a respetiva categoria. O website mantém registo técnico do estado de consentimento para efeitos de prova e auditoria.
            </p>

            <h2>5. Como alterar preferências</h2>
            <p>
                Podes alterar a qualquer momento através do botão flutuante de cookies, disponível no canto inferior esquerdo do website.
            </p>

            <h2>6. Contacto</h2>
            <p>
                Para questões sobre cookies e privacidade: <strong>{legal?.privacy?.contact_email ?? operator?.email ?? "privacy@optviagens.pt"}</strong>.
            </p>

            <h2>7. Ligações relacionadas</h2>
            <ul>
                <li>
                    <Link href={route("legal.privacy")} className="underline">
                        Política de Privacidade
                    </Link>
                </li>
                <li>
                    <Link href={route("legal.terms")} className="underline">
                        Termos e Condições
                    </Link>
                </li>
            </ul>

            <p className="text-xs text-slate-500">
                Versão legal: {legal?.version ?? "2026-04-11"}.
            </p>
        </LegalLayout>
    );
}
