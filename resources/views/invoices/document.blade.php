<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $document['label'] }} {{ $invoice->invoice_number }}</title>
    <style>
        body {
            font-family: "Arial", sans-serif;
            color: #0f172a;
            margin: 26px;
            font-size: 12px;
            line-height: 1.35;
            background: #ffffff;
        }
        .invoice {
            border: 1px solid #d5dce5;
            padding: 22px;
        }
        .top {
            display: grid;
            grid-template-columns: 1.4fr 1fr;
            gap: 18px;
            align-items: start;
        }
        .brand {
            font-size: 24px;
            font-weight: 800;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            margin-bottom: 10px;
        }
        .seller-lines div,
        .buyer-lines div,
        .meta-lines div {
            margin-bottom: 2px;
        }
        .right { text-align: right; }
        .muted { color: #475569; }
        .qr-box {
            margin-top: 8px;
            display: inline-block;
            border: 1px solid #cbd5e1;
            padding: 6px;
            background: #fff;
        }
        .qr-box img {
            width: 158px;
            height: 158px;
            display: block;
            object-fit: contain;
        }
        .qr-caption {
            margin-top: 4px;
            font-size: 10px;
            color: #334155;
            max-width: 168px;
            word-break: break-all;
        }
        .doc-title {
            margin-top: 18px;
            border-top: 2px solid #111827;
            border-bottom: 1px solid #111827;
            padding: 12px 0;
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 12px;
            align-items: end;
        }
        .doc-title h1 {
            margin: 0;
            font-size: 33px;
            line-height: 1.05;
        }
        .doc-title .number {
            font-size: 18px;
            font-weight: 700;
            margin-top: 4px;
        }
        .meta-grid {
            margin-top: 10px;
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            border-top: 1px solid #111827;
            border-bottom: 1px solid #111827;
        }
        .meta-cell {
            padding: 6px 8px;
            border-right: 1px solid #111827;
            min-height: 44px;
        }
        .meta-cell:last-child { border-right: 0; }
        .meta-cell .label {
            display: block;
            font-size: 10px;
            text-transform: uppercase;
            color: #475569;
            margin-bottom: 2px;
            letter-spacing: 0.04em;
        }
        .meta-cell .value {
            font-size: 12px;
            font-weight: 600;
            color: #0f172a;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 14px;
        }
        .table th,
        .table td {
            border: 1px solid #111827;
            padding: 7px 8px;
            vertical-align: top;
        }
        .table th {
            background: #f8fafc;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            text-align: left;
        }
        .num { text-align: right; white-space: nowrap; }
        .totals {
            margin-top: 14px;
            margin-left: auto;
            width: 320px;
            border-collapse: collapse;
        }
        .totals td {
            border: 1px solid #111827;
            padding: 7px 8px;
        }
        .totals td:first-child { font-weight: 600; background: #f8fafc; }
        .totals tr.grand td {
            font-size: 14px;
            font-weight: 800;
            background: #eef2ff;
        }
        .notes {
            margin-top: 14px;
            border-top: 1px solid #cbd5e1;
            padding-top: 10px;
            color: #334155;
        }
        .foot {
            margin-top: 14px;
            border-top: 1px dashed #94a3b8;
            padding-top: 8px;
            font-size: 11px;
            color: #475569;
        }
    </style>
</head>
<body>
    <div class="invoice">
        <div class="top">
            <div>
                <div class="brand">{{ $seller['brand_name'] ?? 'OPTEVENTOS' }}</div>
                <div class="seller-lines">
                    <div><strong>{{ $seller['legal_name'] ?? 'N/D' }}</strong></div>
                    <div>{{ $seller['address'] ?? 'N/D' }}</div>
                    <div>NIF: {{ $seller['nif'] ?? 'N/D' }}</div>
                    <div>Email: {{ $seller['email'] ?? 'N/D' }}</div>
                    <div>Tel: {{ $seller['phone'] ?? 'N/D' }}</div>
                    <div>Reg. Comercial: {{ $seller['commercial_registry'] ?? 'N/D' }}</div>
                    <div>Capital Social: {{ $seller['share_capital'] ?? 'N/D' }}</div>
                </div>
            </div>

            <div class="right">
                @if(!empty($invoice->atcud))
                    <div><strong>ATCUD:</strong> {{ $invoice->atcud }}</div>
                @endif
                <div class="qr-box">
                    <img src="{{ $qr['image_url'] }}" alt="Código QR da fatura">
                    <!-- <div class="qr-caption">QR fiscal do documento</div> -->
                </div>
                <div><strong>Local de emissão:</strong> {{ $billing['document_place'] ?? 'Lisboa' }}</div>
                <div><strong>Data emissão:</strong> {{ $document['issue_date'] }}</div>
                <div><strong>Vencimento:</strong> {{ $document['due_date'] }}</div>
                <div><strong>Condição pag.:</strong> {{ $billing['payment_terms'] ?? 'Pronto pagamento' }}</div>
                <div><strong>Parcela:</strong> {{ $document['installment_label'] }}</div>
            </div>
        </div>

        <div style="margin-top: 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 18px;">
            <div>
                <div class="muted" style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em;">Cliente</div>
                <div class="buyer-lines">
                    <div><strong>{{ $booking->user?->name ?? 'Consumidor final' }}</strong></div>
                    <div>{{ $booking->user?->email ?? 'N/D' }}</div>
                    <div>NIF: {{ $booking->user?->nif ?? 'Consumidor final' }}</div>
                    <div>Nacionalidade: {{ $booking->user?->nationality ?? 'N/D' }}</div>
                </div>
            </div>
            <div class="right">
                <div class="muted" style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em;">Referências</div>
                <div class="meta-lines">
                    <div><strong>Reserva:</strong> {{ $booking->id }}</div>
                    <div><strong>Cliente cód.:</strong> {{ $document['customer_code'] }}</div>
                    <div><strong>Ref. pagamento:</strong> {{ $payment->provider_reference ?? 'N/D' }}</div>
                    <div><strong>Método:</strong> {{ $payment->provider ?? 'N/D' }}</div>
                </div>
            </div>
        </div>

        <div class="doc-title">
            <div>
                <div class="muted">Original</div>
                <h1>{{ $document['label'] }}</h1>
                <div class="number">N.º {{ $invoice->invoice_number }}</div>
            </div>
            <div class="right muted">Pág. 1 de 1</div>
        </div>

        <div class="meta-grid">
            <div class="meta-cell">
                <span class="label">Data</span>
                <span class="value">{{ $document['issue_date'] }}</span>
            </div>
            <div class="meta-cell">
                <span class="label">Vencimento</span>
                <span class="value">{{ $document['due_date'] }}</span>
            </div>
            <div class="meta-cell">
                <span class="label">Evento</span>
                <span class="value">{{ $booking->event?->name ?? 'N/D' }}</span>
            </div>
            <div class="meta-cell">
                <span class="label">Hotel</span>
                <span class="value">{{ $booking->hotel?->name ?? 'N/D' }}</span>
            </div>
            <div class="meta-cell">
                <span class="label">NIF Cliente</span>
                <span class="value">{{ $booking->user?->nif ?? 'Consumidor final' }}</span>
            </div>
        </div>

        <table class="table">
            <thead>
                <tr>
                    <th>Artigo</th>
                    <th>Descrição</th>
                    <th class="num">Quant.</th>
                    <th class="num">UN</th>
                    <th class="num">Preço Unit.</th>
                    <th class="num">Desc.</th>
                    <th class="num">IVA</th>
                    <th class="num">Total Líquido</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{{ $line['sku'] }}</td>
                    <td>
                        {{ $line['description'] }}<br>
                        <span class="muted">
                            Estadia: {{ $booking->check_in?->format('Y-m-d') }} a {{ $booking->check_out?->format('Y-m-d') }}
                            ({{ $booking->nights }} noite(s), {{ $booking->guests }} hóspede(s))
                        </span>
                    </td>
                    <td class="num">{{ number_format((float) $line['quantity'], 3, ',', '.') }}</td>
                    <td class="num">{{ $line['unit'] }}</td>
                    <td class="num">{{ number_format((float) $line['unit_price'], 2, ',', '.') }} {{ $totals['currency'] }}</td>
                    <td class="num">{{ number_format((float) $line['discount'], 2, ',', '.') }} {{ $totals['currency'] }}</td>
                    <td class="num">
                        @if($line['is_vat_exempt'])
                            Isento
                        @else
                            {{ number_format((float) $line['vat_rate'], 2, ',', '.') }}%
                        @endif
                    </td>
                    <td class="num">{{ number_format((float) $line['tax_base'], 2, ',', '.') }} {{ $totals['currency'] }}</td>
                </tr>
            </tbody>
        </table>

        <table class="totals">
            <tbody>
                <tr>
                    <td>Total ilíquido</td>
                    <td class="num">{{ number_format((float) $totals['tax_base'], 2, ',', '.') }} {{ $totals['currency'] }}</td>
                </tr>
                <tr>
                    <td>Total IVA</td>
                    <td class="num">{{ number_format((float) $totals['vat_amount'], 2, ',', '.') }} {{ $totals['currency'] }}</td>
                </tr>
                <tr class="grand">
                    <td>Total a pagar</td>
                    <td class="num">{{ number_format((float) $totals['total'], 2, ',', '.') }} {{ $totals['currency'] }}</td>
                </tr>
            </tbody>
        </table>

        <div class="notes">
            @if($line['is_vat_exempt'] && !empty($billing['vat_exemption_reason']))
                <div><strong>Motivo de isenção IVA:</strong> {{ $billing['vat_exemption_reason'] }}</div>
            @endif
            <div><strong>Observações:</strong> Documento emitido eletronicamente pela plataforma OptEventos.</div>
            @foreach(($billing['document_notes'] ?? []) as $note)
                <div>{{ $note }}</div>
            @endforeach
        </div>

        <div class="foot">
            {{ $document['label'] }} {{ $invoice->invoice_number }} | Emitido em {{ $document['issue_datetime'] }}
            <br>
            <span class="muted">Dados QR: {{ $invoice->qr_payload ?? $qr['payload'] }}</span>
        </div>
    </div>
</body>
</html>
