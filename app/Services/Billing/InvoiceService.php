<?php

namespace App\Services\Billing;

use App\Mail\InvoiceIssuedMail;
use App\Models\Booking;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class InvoiceService
{
    public function issueAndSendForInstallment(Booking $booking, Payment $payment, string $installmentType): Invoice
    {
        $booking->loadMissing(['user', 'event', 'hotel', 'rate.roomType', 'rate.mealPlan', 'payment']);

        $existing = Invoice::query()
            ->where('booking_id', $booking->id)
            ->where('installment_type', $installmentType)
            ->first();

        if ($existing !== null) {
            return $existing;
        }

        $amount = $this->resolveAmount($payment, $installmentType);
        $invoiceNumber = $this->generateInvoiceNumber();

        $invoice = Invoice::query()->create([
            'booking_id' => $booking->id,
            'payment_id' => $payment->id,
            'installment_type' => $installmentType,
            'invoice_number' => $invoiceNumber,
            'amount' => $amount,
            'currency' => (string) $payment->currency,
            'file_path' => null,
            'issued_at' => now(),
        ]);

        $html = view('invoices.document', [
            'invoice' => $invoice,
            'booking' => $booking,
            'payment' => $payment,
        ])->render();

        $filePath = sprintf('invoices/%s/%s.html', now()->format('Y/m'), $invoiceNumber);
        Storage::disk('local')->put($filePath, $html);
        $invoice->update([
            'file_path' => $filePath,
        ]);

        if (filled($booking->user?->email)) {
            Mail::to((string) $booking->user->email)->send(new InvoiceIssuedMail($invoice->fresh(['booking.user', 'booking.event', 'booking.hotel'])));
        }

        return $invoice;
    }

    private function resolveAmount(Payment $payment, string $installmentType): float
    {
        return match ($installmentType) {
            Payment::INSTALLMENT_DEPOSIT => (float) ($payment->deposit_amount ?? $payment->amount),
            Payment::INSTALLMENT_BALANCE => (float) ($payment->balance_amount ?? $payment->amount),
            default => (float) $payment->amount,
        };
    }

    private function generateInvoiceNumber(): string
    {
        return sprintf('INV-%s-%s', now()->format('YmdHis'), Str::upper(Str::random(6)));
    }
}
