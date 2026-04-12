<?php

return [
    // Série documental recomendada para faturas e recibos.
    'document_series_invoice' => env('BILLING_SERIES_INVOICE', 'FS'),
    'document_series_receipt' => env('BILLING_SERIES_RECEIPT', 'RC'),
    'series_validation_code_invoice' => env('BILLING_SERIES_VALIDATION_CODE_INVOICE', ''),
    'series_validation_code_receipt' => env('BILLING_SERIES_VALIDATION_CODE_RECEIPT', ''),

    // Local de emissão apresentado no documento.
    'document_place' => env('BILLING_DOCUMENT_PLACE', 'Lisboa'),

    // Condição de pagamento apresentada no documento.
    'payment_terms' => env('BILLING_PAYMENT_TERMS', 'Pronto pagamento'),

    // Taxa de IVA usada para o cálculo da linha documental (ajustável no .env).
    'vat_rate_percent' => (float) env('BILLING_VAT_RATE_PERCENT', 6),

    // Motivo de isenção para documentos com IVA a 0%.
    'vat_exemption_reason' => env('BILLING_VAT_EXEMPTION_REASON', ''),

    // ATCUD (quando disponível no teu software certificado/integração).
    'atcud' => env('BILLING_ATCUD', ''),

    // Notas adicionais no rodapé do documento (separadas por |).
    'document_notes' => array_values(array_filter(array_map(
        fn (string $item) => trim($item),
        explode('|', (string) env('BILLING_DOCUMENT_NOTES', ''))
    ))),
];
