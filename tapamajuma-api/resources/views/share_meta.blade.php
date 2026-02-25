<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <meta property="og:type" content="article" />
    <meta property="og:title" content="{{ $title }}" />
    <meta property="og:description" content="{{ $description }}" />
    <meta property="og:image" content="{{ $imageUrl }}" />
    <meta property="og:url" content="{{ $destinationUrl }}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{{ $title }}" />
    <meta name="twitter:description" content="{{ $description }}" />
    <meta name="twitter:image" content="{{ $imageUrl }}" />

    <title>{{ $title }}</title>

    <style>
        body { font-family: sans-serif; text-align: center; padding: 50px; background: #f8fafc; color: #64748b; }
        .loader { margin-top: 20px; font-weight: bold; color: #0f172a; }
    </style>
    
    <script>
        setTimeout(function() {
            window.location.href = "{{ $destinationUrl }}";
        }, 100); // Delay dikit 100ms biar browser sempet napas
    </script>
</head>
<body>
    <div class="loader">
        <p>Sedang membuka karya...</p>
        <p><small>Jika tidak dialihkan otomatis, <a href="{{ $destinationUrl }}">klik di sini</a>.</small></p>
    </div>
</body>
</html>