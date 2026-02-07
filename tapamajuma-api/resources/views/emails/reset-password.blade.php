<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Reset Password | TAPAMAJUMA</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">

    <table align="center" width="100%" style="max-width:600px; margin:auto; background-color:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 8px rgba(0,0,0,0.05);">
        <tr>
            <td style="background-color:#ffffff; padding:20px; text-align:center; border-bottom: 3px solid #2563eb;">
                {{-- <img src="{{ $logoUrl ?? asset('images/logo_sekolah.png') }}" alt="Logo Tapamajuma" style="width:80px; height:auto; margin-bottom:10px;"> --}}
                
                <h2 style="color:#111827; margin:0; font-size: 24px;">TAPAMAJUMA</h2>
                <p style="color:#6b7280; margin:5px 0 0; font-size: 14px;">SMP Negeri 1 Siborongborong</p>
            </td>
        </tr>

        <tr>
            <td style="padding:30px;">
                <h3 style="color:#111827; margin-top: 0;">Halo, {{ $name }}!</h3>
                <p style="color:#374151; line-height:1.6;">
                    Kami menerima permintaan untuk mengatur ulang kata sandi (password) untuk akun:
                    <br><strong>{{ $email }}</strong>
                </p>
                <p style="color:#374151; line-height:1.6;">
                    Jika ini benar permintaan Anda, silakan tekan tombol di bawah ini untuk membuat password baru.
                </p>

                <div style="text-align:center; margin:30px 0;">
                    <a href="{{ $url }}" 
                       style="background-color:#2563eb; color:#ffffff; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold; display:inline-block; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);">
                       Reset Password Saya
                    </a>
                </div>

                <p style="color:#6b7280; line-height:1.6; font-size: 14px;">
                    Link ini hanya berlaku selama <strong>60 menit</strong>. Jika Anda tidak merasa meminta reset password, abaikan saja email ini. Akun Anda tetap aman.
                </p>

                <hr style="border:none; border-top:1px solid #e5e7eb; margin: 30px 0;">

                <p style="color:#374151; margin:0;">Salam hangat,</p>
                <p style="color:#2563eb; font-weight:bold; margin:5px 0 0;">Admin TAPAMAJUMA</p>
            </td>
        </tr>

        <tr>
            <td style="background-color:#f3f4f6; text-align:center; padding:20px; font-size:12px; color:#9ca3af;">
                <p style="margin:0;">&copy; {{ date('Y') }} SMP Negeri 1 Siborongborong.</p>
                <p style="margin:5px 0 0;">Jalan Siliwangi No.2 Siborongborong 22474</p>
            </td>
        </tr>
    </table>

</body>
</html>