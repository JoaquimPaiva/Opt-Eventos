<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Código de verificação de administrador</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
                    <tr>
                        <td style="padding:24px 24px 10px 24px;">
                            <p style="margin:0 0 10px 0;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#64748b;font-weight:700;">OptEventos</p>
                            <h1 style="margin:0 0 10px 0;font-size:22px;line-height:1.25;color:#0f172a;">Código de segurança para acesso de administrador</h1>
                            <p style="margin:0 0 18px 0;font-size:14px;line-height:1.6;color:#334155;">Olá {{ $name }}, recebemos um pedido de acesso ao painel de administração. Usa o código abaixo para concluir o login.</p>
                            <div style="display:inline-block;padding:14px 18px;border-radius:10px;background:#0f172a;color:#ffffff;font-size:30px;letter-spacing:.22em;font-weight:800;">{{ $code }}</div>
                            <p style="margin:16px 0 0 0;font-size:13px;line-height:1.6;color:#475569;">Este código expira em 10 minutos. Se não foste tu, ignora este email e altera a tua palavra-passe.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:14px 24px 22px 24px;border-top:1px solid #e2e8f0;">
                            <p style="margin:0;font-size:12px;color:#64748b;">Mensagem automática de segurança. Não respondas diretamente a este email.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
