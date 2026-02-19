FROM php:8.3-apache

# 1. Install dependensi dan ca-certificates (tanpa pemanggilan manual update)
RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev zip unzip libzip-dev ca-certificates \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# 2. Install ekstensi PHP
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# 3. Konfigurasi Apache Root
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# 4. Aktifkan modul Rewrite
RUN a2enmod rewrite

# 5. Ambil Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 6. Set working directory
WORKDIR /var/www/html

# 7. Copy kodingan
COPY . .

# 8. Hapus cache config
RUN rm -f bootstrap/cache/*.php

# 9. Jalankan Composer
RUN composer install --no-dev --optimize-autoloader

# 10. Berikan izin akses
RUN chown -R www-data:www-data storage bootstrap/cache

# 11. Start dengan bungkus "sh -c" agar format tidak pecah (Anti Error 127)
CMD sh -c 'php artisan config:clear && sed -i "s/80/$PORT/g" /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf && apache2-foreground'