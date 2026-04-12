@php
    $customerName = $booking->user?->name ?? 'Cliente';
@endphp

<p>Olá {{ $customerName }},</p>
<p>Os documentos do seu pagamento foram emitidos com sucesso.</p>
<p>
    Reserva: {{ $booking->id }}<br>
    Evento: {{ $booking->event?->name ?? 'N/D' }}<br>
    Hotel: {{ $booking->hotel?->name ?? 'N/D' }}<br>
    Parcela: {{ $installmentType }}
</p>

<p>Documentos emitidos:</p>
<ul>
    @foreach($documents as $document)
        <li>
            Fatura
            {{ $document->invoice_number }} -
            {{ number_format((float) $document->amount, 2, ',', '.') }} {{ $document->currency }}
        </li>
    @endforeach
</ul>

<p>Segue em anexo a fatura correspondente.</p>
<p>Obrigado.</p>
