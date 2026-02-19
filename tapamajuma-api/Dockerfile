# Gunakan versi Apache agar bisa langsung melayani HTTP
FROM php:8.3-apache

# 1. Install dependensi sistem
RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev zip unzip libzip-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# 2. Install ekstensi PHP (Wajib untuk TiDB Cloud)
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# 3. Aktifkan modul Rewrite Apache (Penting untuk routing Laravel)
RUN a2enmod rewrite

# 4. Ambil Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 5. Set working directory ke standar Apache
WORKDIR /var/www/html

# 6. Copy kodingan dari folder 'tapamajuma-api' (karena Root Directory di Render diset ke 'api')
COPY . .

# 7. Jalankan Composer Install
RUN composer install --no-dev --optimize-autoloader

# 8. Berikan izin akses folder storage & cache
RUN chown -R www-data:www-data storage bootstrap/cache

# 9. Penyesuaian Port untuk Render
# Render akan memberikan port dinamis lewat variabel $PORT (default 10000)
RUN sed -i 's/80/${PORT}/g' /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf

# Start Apache
CMD ["apache2-foreground"]