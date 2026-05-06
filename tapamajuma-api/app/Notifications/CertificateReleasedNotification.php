<?php

// app/Notifications/CertificateReleasedNotification.php
namespace App\Notifications;

use App\Models\Certificate;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Http;

class CertificateReleasedNotification extends Notification
{
    public function __construct(public Certificate $certificate) {}

    public function via($notifiable): array
    {
        return ['database', 'webpush'];
    }

    public function toWebpush($notifiable): array
    {
        return [
            'title' => 'Sertifikat Tersedia',
            'body'  => "Sertifikat penghargaanmu sudah bisa diunduh!",
            'icon'  => '/icons/icon-192.png',
            'data'  => [
                'url' => '/siswa/sertifikat/' . $this->certificate->id,
            ],
        ];
    }

    public function toArray($notifiable): array
    {
        return [
            'certificate_id' => $this->certificate->id,
            'message'        => 'Sertifikat penghargaanmu sudah tersedia',
        ];
    }
}
