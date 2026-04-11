@php
    $customerName = $booking->user?->name ?? 'Cliente';
@endphp

<p>Olá {{ $customerName }},</p>
<p>A sua fatura <strong>{{ $invoice->invoice_number }}</strong> foi emitida com sucesso.</p>
<p>
    Reserva: {{ $booking->id }}<br>
    Evento: {{ $booking->event->name }}<br>
    Hotel: {{ $booking->hotel->name }}<br>
    Valor faturado: {{ number_format((float) $invoice->amount, 2, ',', '.') }} {{ $invoice->currency }}
</p>
<p>Segue em anexo o documento da fatura.</p>
<p>Obrigado.</p>
