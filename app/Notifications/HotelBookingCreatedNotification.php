<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class HotelBookingCreatedNotification extends Notification
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
        $booking = $this->booking->loadMissing(['user', 'event', 'hotel', 'payment']);

        return (new MailMessage)
            ->subject("Nova reserva para {$booking->hotel->name}")
            ->greeting("Olá {$notifiable->name},")
            ->line("Uma nova reserva foi criada para {$booking->hotel->name}.")
            ->line("Reserva: {$booking->id}")
            ->line("Cliente: {$booking->user->name} ({$booking->user->email})")
            ->line("Evento: {$booking->event->name}")
            ->line("Montante: {$booking->total_price} ".($booking->payment?->currency ?? 'EUR'))
            ->action('Abrir reservas do hotel', route('hotel.bookings.index', ['search' => $booking->id]));
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $booking = $this->booking->loadMissing(['user', 'event', 'hotel']);

        return [
            'title' => 'Nova reserva recebida',
            'message' => "Reserva {$booking->id} por {$booking->user->name} foi criada para {$booking->hotel->name}.",
            'url' => route('hotel.bookings.index', ['search' => $booking->id]),
            'booking_id' => $booking->id,
            'kind' => 'hotel_booking_created',
        ];
    }
}
