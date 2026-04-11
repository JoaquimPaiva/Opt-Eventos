<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingCancelledNotification extends Notification
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
        $booking = $this->booking->loadMissing(['event', 'hotel']);

        return (new MailMessage)
            ->subject("Reserva {$booking->id} cancelada")
            ->greeting("Olá {$notifiable->name},")
            ->line("A Sua reserva para {$booking->event->name} em {$booking->hotel->name} foi cancelada.")
            ->action('Ver detalhes da reserva', route('dashboard.bookings.show', $booking))
            ->line('Se precisar de ajuda, entre em contato com o suporte.');
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $booking = $this->booking->loadMissing(['event', 'hotel']);

        return [
            'title' => 'Reserva cancelada',
            'message' => "A Sua reserva para {$booking->event->name} em {$booking->hotel->name} foi cancelada.",
            'url' => route('dashboard.bookings.show', $booking),
            'booking_id' => $booking->id,
            'kind' => 'booking_cancelled',
        ];
    }
}
