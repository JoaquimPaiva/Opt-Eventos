<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentConfirmedNotification extends Notification
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
            ->subject("Pagamento confirmado para a reserva {$booking->id}")
            ->greeting("Olá {$notifiable->name},")
            ->line("O seu pagamento para {$booking->event->name} em {$booking->hotel->name} foi confirmado.")
            ->line("Montante pago: {$booking->total_price} ".($booking->payment?->currency ?? 'EUR'))
            ->action('Ver reserva', route('dashboard.bookings.show', $booking))
            ->line('Esperamos que desfrute da sua estadia.');
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $booking = $this->booking->loadMissing(['event', 'hotel']);

        return [
            'title' => 'Pagamento confirmado',
            'message' => "Pagamento confirmado para {$booking->event->name} em {$booking->hotel->name}.",
            'url' => route('dashboard.bookings.show', $booking),
            'booking_id' => $booking->id,
            'kind' => 'payment_confirmed',
        ];
    }
}
