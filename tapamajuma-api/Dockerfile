# Menggunakan PHP 8.2 FPM
FROM php:8.3-fpm

# Install dependensi sistem untuk Ubuntu/Debian
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev

# Bersihkan cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install ekstensi PHP (pdo_mysql wajib untuk TiDB Cloud)
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Ambil Composer terbaru
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy kodingan Laravel ke dalam container
COPY . /var/www

# Berikan izin akses folder storage & cache agar Laravel lancar
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

EXPOSE 9000
CMD ["php-fpm"]