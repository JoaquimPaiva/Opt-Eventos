<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingCreatedNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly Booking $booking)
    {
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $booking = $this->booking->loadMissing(['event', 'hotel', 'payment']);

        return (new MailMessage)
            ->subject("Reserva {$booking->id} criada")
            ->greeting("Olá {$notifiable->name},")
            ->line("A Sua reserva para {$booking->event->name} em {$booking->hotel->name} foi criada com sucesso.")
            ->line("Montante total: {$booking->total_price} ".($booking->payment?->currency ?? 'EUR'))
            ->action('Completar pagamento', route('dashboard.bookings.payment', $booking))
            ->line('Obrigado por nos escolher.');
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $booking = $this->booking->loadMissing(['event', 'hotel', 'payment']);

        return [
            'title' => 'Reserva criada',
            'message' => "A Sua reserva para {$booking->event->name} em {$booking->hotel->name} foi criada com sucesso.",
            'url' => route('dashboard.bookings.payment', $booking),
            'booking_id' => $booking->id,
            'kind' => 'booking_created',
        ];
    }
}
