<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminTwoFactorCodeMail extends Mailable
{
    use Queueable;
    use SerializesModels;

    public function __construct(
        public string $name,
        public string $code,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Código de verificação 2FA (Admin)',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.admin-two-factor-code',
            with: [
                'name' => $this->name,
                'code' => $this->code,
            ],
        );
    }
}

