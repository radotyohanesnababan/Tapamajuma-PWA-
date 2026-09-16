<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public $token;

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
        // Ambil domain frontend dari konteks tenant yang sedang aktif.
        // Setiap sekolah punya domain sendiri (bisa subdomain tapamajuma.my.id
        // atau custom domain seperti tapamajuma.smpn1siborongborong.sch.id).
        // Di lokal: selalu pakai FRONTEND_URL agar bisa tes di localhost.
        // Di production: gunakan domain sekolah dari tabel schools.
        $school = app()->has('currentSchool') ? app('currentSchool') : null;

        if (!app()->isLocal() && $school && $school->domain) {
            // domain disimpan tanpa protokol, misal: smpn3siborongborong.tapamajuma.my.id
            $frontendUrl = 'https://' . $school->domain;
        } else {
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
        }

        $url = "{$frontendUrl}/password-reset/{$this->token}?email={$notifiable->getEmailForPasswordReset()}";

        return (new MailMessage)
            ->subject('Reset Password - TAPAMAJUMA')
            ->view('emails.reset-password', [
                'url'   => $url,
                'name'  => $notifiable->name,
                'email' => $notifiable->email,
            ]);
    }
}