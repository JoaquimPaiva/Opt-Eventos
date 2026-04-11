<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fatura {{ $invoice->invoice_number }}</title>
    <style>
        body { font-family: Arial, sans-serif; color: #0f172a; margin: 28px; }
        h1 { margin: 0 0 8px; }
        .muted { color: #475569; }
        .section { margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
        .right { text-align: right; }
    </style>
</head>
<body>
    <h1>Fatura</h1>
    <p class="muted">Nº {{ $invoice->invoice_number }} | Emitida em {{ $invoice->issued_at?->format('Y-m-d H:i') }}</p>

    <div class="section">
        <strong>Cliente</strong><br>
        {{ $booking->user?->name ?? 'N/D' }}<br>
        {{ $booking->user?->email ?? 'N/D' }}<br>
        NIF: {{ $booking->user?->nif ?? 'N/D' }}
    </div>

    <div class="section">
        <strong>Reserva</strong><br>
        ID: {{ $booking->id }}<br>
        Evento: {{ $booking->event->name }}<br>
        Hotel: {{ $booking->hotel->name }}<br>
        Check-in: {{ $booking->check_in?->format('Y-m-d') }}<br>
        Check-out: {{ $booking->check_out?->format('Y-m-d') }}<br>
        Parcela: {{ $invoice->installment_type }}
    </div>

    <div class="section">
        <table>
            <thead>
                <tr>
                    <th>Descrição</th>
                    <th class="right">Valor</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Serviço de alojamento e reserva ({{ $invoice->installment_type }})</td>
                    <td class="right">{{ number_format((float) $invoice->amount, 2, ',', '.') }} {{ $invoice->currency }}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="section right">
        <strong>Total faturado: {{ number_format((float) $invoice->amount, 2, ',', '.') }} {{ $invoice->currency }}</strong>
    </div>
</body>
</html>
