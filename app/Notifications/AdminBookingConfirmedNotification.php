<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminBookingConfirmedNotification extends Notification
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
            ->subject("A reserva {$booking->id} foi paga!")
            ->greeting("Olá {$notifiable->name},")
            ->line('Uma reserva foi confirmada e paga.')
            ->line("Cliente: {$booking->user->name} ({$booking->user->email})")
            ->line("Evento: {$booking->event->name}")
            ->line("Hotel: {$booking->hotel->name}")
            ->line("Montante: {$booking->total_price} ".($booking->payment?->currency ?? 'EUR'))
            ->action('Abrir Gestor de Reservas', route('admin.bookings.index', ['search' => $booking->id]));
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $booking = $this->booking->loadMissing(['user', 'event', 'hotel']);

        return [
            'title' => 'Reserva Paga',
            'message' => "A Reserva {$booking->id} por {$booking->user->name} foi paga.",
            'url' => route('admin.bookings.index', ['search' => $booking->id]),
            'booking_id' => $booking->id,
            'kind' => 'admin_booking_paid',
        ];
    }
}
