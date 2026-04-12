<?php

namespace App\Services\Billing;

use App\Mail\BillingDocumentsIssuedMail;
use App\Models\Booking;
use App\Models\Invoice;
use App\Models\InvoiceSeriesCounter;
use App\Models\Payment;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class InvoiceService
{
    public function issueAndSendForInstallment(Booking $booking, Payment $payment, string $installmentType): Invoice
    {
        $booking->loadMissing(['user', 'event', 'hotel', 'rate.roomType', 'rate.mealPlan', 'payment']);

        $invoice = $this->issueDocument(
            booking: $booking,
            payment: $payment,
            installmentType: $installmentType,
            documentType: Invoice::TYPE_INVOICE,
        );

        if (filled($booking->user?->email)) {
            /** @var Collection<int, Invoice> $documents */
            $documents = collect([$invoice])
                ->filter(fn (Invoice $document) => filled($document->file_path))
                ->values();

            Mail::to((string) $booking->user->email)->send(
                new BillingDocumentsIssuedMail(
                    booking: $booking,
                    documents: $documents,
                    installmentType: $installmentType,
                )
            );
        }

        return $invoice;
    }

    public function regenerateDocumentFile(Invoice $invoice): ?Invoice
    {
        $invoice->loadMissing(['booking.user', 'booking.event', 'booking.hotel', 'booking.rate.roomType', 'booking.rate.mealPlan', 'payment']);

        $booking = $invoice->booking;
        if (! $booking instanceof Booking) {
            return null;
        }

        /** @var Payment|null $payment */
        $payment = $invoice->payment ?? $booking->payment;
        if (! $payment instanceof Payment) {
            return null;
        }

        $this->storeRenderedDocument(
            document: $invoice,
            booking: $booking,
            payment: $payment,
            amount: (float) $invoice->amount,
            installmentType: (string) $invoice->installment_type,
            documentType: (string) $invoice->document_type,
        );

        return $invoice->fresh();
    }

    private function issueDocument(
        Booking $booking,
        Payment $payment,
        string $installmentType,
        string $documentType,
    ): Invoice {
        $existing = Invoice::query()
            ->where('booking_id', $booking->id)
            ->where('installment_type', $installmentType)
            ->where('document_type', $documentType)
            ->first();

        if ($existing !== null) {
            return $existing;
        }

        $amount = $this->resolveAmount($payment, $installmentType);
        $document = DB::transaction(function () use ($booking, $payment, $installmentType, $documentType, $amount): Invoice {
            $seriesCode = $this->resolveSeriesCode($documentType);
            $seriesValidationCode = $this->resolveSeriesValidationCode($documentType);

            /** @var InvoiceSeriesCounter $counter */
            $counter = InvoiceSeriesCounter::query()
                ->where('series_code', $seriesCode)
                ->lockForUpdate()
                ->first();

            if (! $counter) {
                $counter = InvoiceSeriesCounter::query()->create([
                    'series_code' => $seriesCode,
                    'document_type' => $documentType,
                    'validation_code' => $seriesValidationCode !== '' ? $seriesValidationCode : null,
                    'next_number' => 1,
                ]);
                $counter->refresh();
            }

            $sequentialNumber = (int) $counter->next_number;
            $counter->update([
                'next_number' => $sequentialNumber + 1,
                'validation_code' => $seriesValidationCode !== '' ? $seriesValidationCode : $counter->validation_code,
            ]);

            $issuedAt = now();
            $invoiceNumber = $this->formatDocumentNumber($seriesCode, $issuedAt, $sequentialNumber);
            $atcud = $this->formatAtcud(
                seriesValidationCode: $seriesValidationCode,
                sequentialNumber: $sequentialNumber
            );

            return Invoice::query()->create([
                'booking_id' => $booking->id,
                'payment_id' => $payment->id,
                'document_type' => $documentType,
                'series_code' => $seriesCode,
                'series_validation_code' => $seriesValidationCode !== '' ? $seriesValidationCode : null,
                'sequential_number' => $sequentialNumber,
                'atcud' => $atcud,
                'installment_type' => $installmentType,
                'invoice_number' => $invoiceNumber,
                'amount' => $amount,
                'currency' => (string) $payment->currency,
                'file_path' => null,
                'issued_at' => $issuedAt,
            ]);
        }, 3);

        $document->refresh();

        $this->storeRenderedDocument(
            document: $document,
            booking: $booking,
            payment: $payment,
            amount: $amount,
            installmentType: $installmentType,
            documentType: $documentType,
        );

        return $document->fresh();
    }

    private function storeRenderedDocument(
        Invoice $document,
        Booking $booking,
        Payment $payment,
        float $amount,
        string $installmentType,
        string $documentType,
    ): void {
        $document = $this->ensureFiscalIdentity($document, $documentType);
        $vatRatePercent = (float) config('billing.vat_rate_percent', 6.0);
        $isVatExempt = $vatRatePercent <= 0;
        $taxBase = $isVatExempt
            ? round($amount, 2)
            : round($amount / (1 + ($vatRatePercent / 100)), 2);
        $vatAmount = round($amount - $taxBase, 2);
        $issuedAt = $document->issued_at ?? now();
        $qrPayload = $this->buildPortugueseBillingQrPayload(
            invoice: $document,
            booking: $booking,
            payment: $payment,
            taxBase: $taxBase,
            vatAmount: $vatAmount,
            total: round($amount, 2),
            vatRatePercent: $vatRatePercent
        );
        $qrImageUrl = $this->buildQrImageUrl($qrPayload);

        $html = view('invoices.document', [
            'invoice' => $document,
            'booking' => $booking,
            'payment' => $payment,
            'seller' => config('legal.operator', []),
            'billing' => [
                'document_place' => (string) config('billing.document_place', 'Lisboa'),
                'document_series_invoice' => (string) config('billing.document_series_invoice', 'FS'),
                'document_series_receipt' => (string) config('billing.document_series_receipt', 'RC'),
                'payment_terms' => (string) config('billing.payment_terms', 'Pronto pagamento'),
                'atcud' => (string) config('billing.atcud', ''),
                'document_notes' => (array) config('billing.document_notes', []),
                'vat_exemption_reason' => (string) config('billing.vat_exemption_reason', ''),
            ],
            'document' => [
                'label' => $documentType === Invoice::TYPE_RECEIPT ? 'Recibo' : 'Fatura',
                'installment_label' => $this->installmentLabel($installmentType),
                'issue_date' => $issuedAt->format('Y-m-d'),
                'issue_datetime' => $issuedAt->format('Y-m-d H:i'),
                'due_date' => $this->formatDate($payment->due_date),
                'customer_code' => sprintf('CLI-%06d', (int) ($booking->user?->id ?? 0)),
            ],
            'line' => [
                'sku' => sprintf('RES-%s', Str::upper(substr((string) $booking->id, 0, 8))),
                'description' => sprintf(
                    'Serviço de reserva de alojamento (%s) - Evento %s / Hotel %s',
                    $this->installmentLabel($installmentType),
                    (string) $booking->event?->name,
                    (string) $booking->hotel?->name
                ),
                'quantity' => 1,
                'unit' => 'UN',
                'unit_price' => $taxBase,
                'discount' => 0.0,
                'vat_rate' => $vatRatePercent,
                'tax_base' => $taxBase,
                'vat_amount' => $vatAmount,
                'total' => round($amount, 2),
                'is_vat_exempt' => $isVatExempt,
            ],
            'totals' => [
                'tax_base' => $taxBase,
                'vat_amount' => $vatAmount,
                'total' => round($amount, 2),
                'currency' => (string) $payment->currency,
            ],
            'qr' => [
                'payload' => $qrPayload,
                'image_url' => $qrImageUrl,
            ],
        ])->render();

        $safeFileNumber = str_replace([' ', '/'], ['-', '_'], (string) $document->invoice_number);
        $filePath = sprintf('invoices/%s/%s.html', ($issuedAt ?? now())->format('Y/m'), $safeFileNumber);
        Storage::disk('local')->put($filePath, $html);

        $document->update([
            'file_path' => $filePath,
            'qr_payload' => $qrPayload,
            'tax_base' => $taxBase,
            'vat_amount' => $vatAmount,
            'vat_rate_percent' => $vatRatePercent,
        ]);
    }

    private function resolveAmount(Payment $payment, string $installmentType): float
    {
        return match ($installmentType) {
            Payment::INSTALLMENT_DEPOSIT => (float) ($payment->deposit_amount ?? $payment->amount),
            Payment::INSTALLMENT_BALANCE => (float) ($payment->balance_amount ?? $payment->amount),
            default => (float) $payment->amount,
        };
    }

    private function resolveSeriesCode(string $documentType): string
    {
        return $documentType === Invoice::TYPE_RECEIPT
            ? (string) config('billing.document_series_receipt', 'RC')
            : (string) config('billing.document_series_invoice', 'FS');
    }

    private function resolveSeriesValidationCode(string $documentType): string
    {
        return $documentType === Invoice::TYPE_RECEIPT
            ? (string) config('billing.series_validation_code_receipt', '')
            : (string) config('billing.series_validation_code_invoice', '');
    }

    private function formatDocumentNumber(string $seriesCode, CarbonInterface $issuedAt, int $sequentialNumber): string
    {
        return sprintf('%s %s/%06d', $seriesCode, $issuedAt->format('y'), $sequentialNumber);
    }

    private function formatAtcud(string $seriesValidationCode, int $sequentialNumber): string
    {
        $code = trim($seriesValidationCode);
        if ($code === '') {
            return sprintf('PENDENTE-%06d', $sequentialNumber);
        }

        return sprintf('%s-%06d', $code, $sequentialNumber);
    }

    private function ensureFiscalIdentity(Invoice $invoice, string $documentType): Invoice
    {
        if ($invoice->series_code !== null && $invoice->sequential_number !== null && $invoice->atcud !== null) {
            return $invoice;
        }

        $seriesCode = $invoice->series_code ?: $this->resolveSeriesCode($documentType);
        $seriesValidationCode = $invoice->series_validation_code ?: $this->resolveSeriesValidationCode($documentType);
        $sequentialNumber = (int) ($invoice->sequential_number ?? $invoice->id);
        $issuedAt = $invoice->issued_at ?? now();
        $invoiceNumber = $this->formatDocumentNumber($seriesCode, $issuedAt, $sequentialNumber);
        $atcud = $this->formatAtcud($seriesValidationCode, $sequentialNumber);

        $invoice->update([
            'series_code' => $seriesCode,
            'series_validation_code' => $seriesValidationCode !== '' ? $seriesValidationCode : null,
            'sequential_number' => $sequentialNumber,
            'invoice_number' => $invoiceNumber,
            'atcud' => $atcud,
        ]);

        return $invoice->fresh() ?? $invoice;
    }

    private function installmentLabel(string $installmentType): string
    {
        return match ($installmentType) {
            Payment::INSTALLMENT_DEPOSIT => 'Sinal',
            Payment::INSTALLMENT_BALANCE => 'Restante',
            default => 'Total',
        };
    }

    private function formatDate(null|CarbonInterface|string $value): string
    {
        if ($value instanceof CarbonInterface) {
            return $value->format('Y-m-d');
        }

        if (is_string($value) && $value !== '') {
            return $value;
        }

        return 'N/D';
    }

    private function buildPortugueseBillingQrPayload(
        Invoice $invoice,
        Booking $booking,
        Payment $payment,
        float $taxBase,
        float $vatAmount,
        float $total,
        float $vatRatePercent
    ): string {
        $sellerNif = preg_replace('/\D+/', '', (string) (config('legal.operator.nif') ?? '')) ?: '999999990';
        $buyerNif = preg_replace('/\D+/', '', (string) ($booking->user?->nif ?? '999999990')) ?: '999999990';
        $issueDate = ($invoice->issued_at ?? now())->format('Ymd');
        $docNo = str_replace(' ', '', (string) $invoice->invoice_number);
        $country = strtoupper(substr((string) ($booking->user?->nationality ?? 'PT'), 0, 2));
        $currency = strtoupper((string) $payment->currency);
        $atcud = (string) ($invoice->atcud ?? '');
        $docType = $invoice->document_type === Invoice::TYPE_RECEIPT ? 'RC' : 'FT';
        $vatRateCode = $vatRatePercent <= 0 ? 'M99' : 'NOR';

        return implode('*', [
            'A:'.$sellerNif,
            'B:'.$buyerNif,
            'C:PT',
            'D:'.$docType,
            'E:N',
            'F:'.$issueDate,
            'G:'.$docNo,
            'H:'.$atcud,
            'I1:'.$country,
            'I2:'.$vatRateCode,
            'I3:'.number_format(max(0, $taxBase), 2, '.', ''),
            'I4:'.number_format(max(0, $vatAmount), 2, '.', ''),
            'I7:'.number_format(max(0, $vatRatePercent), 2, '.', ''),
            'I8:'.number_format(max(0, $total), 2, '.', ''),
            'N:'.number_format(max(0, $total), 2, '.', ''),
            'O:'.$currency,
            'Q:'.$docNo,
        ]);
    }

    private function buildQrImageUrl(string $payload): string
    {
        return sprintf(
            'https://api.qrserver.com/v1/create-qr-code/?size=220x220&ecc=M&data=%s',
            rawurlencode($payload)
        );
    }
}
