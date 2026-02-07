<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public $token;

    // Kita terima token saat class ini dipanggil
    public function __construct($token)
    {
        $this->token = $token;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        // 1. Generate URL Frontend (React)
        // Pastikan FRONTEND_URL ada di .env (http://localhost:5173)
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
        $url = "{$frontendUrl}/password-reset/{$this->token}?email={$notifiable->getEmailForPasswordReset()}";

        // 2. Panggil View Custom tadi
        return (new MailMessage)
            ->subject('Reset Password - TAPAMAJUMA') // Judul Email
            ->view('emails.reset-password', [
                'url' => $url,
                'name' => $notifiable->name,   // Mengirim nama user
                'email' => $notifiable->email, // Mengirim email user
            ]);
    }
}