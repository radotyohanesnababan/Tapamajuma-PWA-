FROM php:8.3-apache

# 1. Install dependensi sistem
RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev zip unzip libzip-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# 2. Install ekstensi PHP (Wajib untuk TiDB Cloud)
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# 3. Konfigurasi Apache: Pindahkan DocumentRoot ke /public
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# 4. Aktifkan modul Rewrite
RUN a2enmod rewrite

# 5. Ambil Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 6. Set working directory
WORKDIR /var/www/html

# 7. Copy kodingan (Ingat: Render sudah masuk ke folder 'api' sebagai root)
COPY . .

# 8. Jalankan Composer
RUN composer install --no-dev --optimize-autoloader

# 9. Berikan izin akses folder storage & cache
RUN chown -R www-data:www-data storage bootstrap/cache

# 10. Start Apache dan paksa ganti port ke variabel $PORT saat runtime
CMD sed -i "s/80/$PORT/g" /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf && apache2-foreground