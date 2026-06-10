FROM php:8.3-fpm-bullseye

# ============================================================
# SYSTEM DEPENDENCIES
# ============================================================
RUN apt-get update && apt-get install -y \
    curl \
    zip \
    unzip \
    git \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    libicu-dev \
    libxml2-dev \
    libonig-dev \
    # wkhtmltopdf dependencies
    libxrender1 \
    libfontconfig1 \
    libx11-dev \
    libjpeg62-turbo \
    xfonts-75dpi \
    xfonts-base \
    fontconfig \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# ============================================================
# WKHTMLTOPDF
# ============================================================
RUN curl -L https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6.1-3/wkhtmltox_0.12.6.1-3.bullseye_amd64.deb \
    -o /tmp/wkhtmltox.deb && \
    apt-get update && \
    apt-get install -y /tmp/wkhtmltox.deb && \
    rm /tmp/wkhtmltox.deb && \
    rm -rf /var/lib/apt/lists/*

# ============================================================
# PHP EXTENSIONS
# ============================================================
RUN docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg && \
    docker-php-ext-install \
        pdo \
        pdo_mysql \
        mbstring \
        gd \
        opcache \
        zip \
        intl \
        xml \
        bcmath

# ============================================================
# OPCACHE CONFIG
# ============================================================
RUN echo "opcache.enable=1"                   >> /usr/local/etc/php/conf.d/opcache.ini && \
    echo "opcache.memory_consumption=128"     >> /usr/local/etc/php/conf.d/opcache.ini && \
    echo "opcache.max_accelerated_files=10000">> /usr/local/etc/php/conf.d/opcache.ini && \
    echo "opcache.validate_timestamps=0"      >> /usr/local/etc/php/conf.d/opcache.ini && \
    echo "opcache.revalidate_freq=0"          >> /usr/local/etc/php/conf.d/opcache.ini

# ============================================================
# PHP-FPM CONFIG (hemat RAM)
# ============================================================
RUN echo "[www]"                        >> /usr/local/etc/php-fpm.d/www.conf && \
    echo "pm = dynamic"                 >> /usr/local/etc/php-fpm.d/www.conf && \
    echo "pm.max_children = 5"          >> /usr/local/etc/php-fpm.d/www.conf && \
    echo "pm.start_servers = 2"         >> /usr/local/etc/php-fpm.d/www.conf && \
    echo "pm.min_spare_servers = 1"     >> /usr/local/etc/php-fpm.d/www.conf && \
    echo "pm.max_spare_servers = 3"     >> /usr/local/etc/php-fpm.d/www.conf && \
    echo "pm.max_requests = 500"        >> /usr/local/etc/php-fpm.d/www.conf

# ============================================================
# COMPOSER
# ============================================================
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# ============================================================
# APP
# ============================================================
WORKDIR /var/www/html

COPY . .

RUN composer install --no-dev --optimize-autoloader

RUN chown -R www-data:www-data \
    /var/www/html/storage \
    /var/www/html/bootstrap/cache

# ============================================================
# WKHTMLTOPDF ENV
# ============================================================
ENV WKHTMLTOPDF_PATH=/usr/local/bin/wkhtmltopdf
ENV WKHTMLTOIMAGE_PATH=/usr/local/bin/wkhtmltoimage

# ============================================================
# START
# ============================================================
EXPOSE $PORT

CMD php artisan config:cache && \
    php artisan route:cache && \
    php artisan migrate --force && \
    php artisan serve --host=0.0.0.0 --port=$PORT