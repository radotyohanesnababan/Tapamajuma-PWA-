FROM php:8.3-apache

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

# Set working directory
WORKDIR /var/www

# Copy kodingan Laravel ke dalam container
COPY . /var/www

# Berikan izin akses folder storage & cache agar Laravel lancar
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

EXPOSE 9000
CMD ["php-fpm"]