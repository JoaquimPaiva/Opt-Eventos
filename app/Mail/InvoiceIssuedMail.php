<?php

namespace App\Mail;

use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailable;

class InvoiceIssuedMail extends Mailable
{
    use Queueable;

    public function __construct(public readonly Invoice $invoice)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Fatura {$this->invoice->invoice_number} - reserva {$this->invoice->booking_id}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.invoice-issued',
            with: [
                'invoice' => $this->invoice,
                'booking' => $this->invoice->booking,
            ],
        );
    }

    /**
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        if (! $this->invoice->file_path) {
            return [];
        }

        return [
            Attachment::fromStorageDisk('local', $this->invoice->file_path)
                ->as("{$this->invoice->invoice_number}.html")
                ->withMime('text/html'),
        ];
    }
}
