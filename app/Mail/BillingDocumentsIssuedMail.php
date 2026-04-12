<?php

namespace App\Mail;

use App\Models\Booking;
use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailable;
use Illuminate\Support\Collection;

class BillingDocumentsIssuedMail extends Mailable
{
    use Queueable;

    /**
     * @param Collection<int, Invoice> $documents
     */
    public function __construct(
        public readonly Booking $booking,
        public readonly Collection $documents,
        public readonly string $installmentType,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Documentos de pagamento - reserva {$this->booking->id}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.billing-documents-issued',
            with: [
                'booking' => $this->booking,
                'documents' => $this->documents,
                'installmentType' => $this->installmentType,
            ],
        );
    }

    /**
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return $this->documents
            ->filter(fn (Invoice $document) => filled($document->file_path))
            ->map(
                fn (Invoice $document) => Attachment::fromStorageDisk('local', (string) $document->file_path)
                    ->as("{$document->invoice_number}.html")
                    ->withMime('text/html')
            )
            ->values()
            ->all();
    }
}
