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
    # Chromium dependencies
    chromium \
    fonts-liberation \
    fonts-noto \
    libxss1 \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# ============================================================
# NODE.JS
# ============================================================
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
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
RUN echo "opcache.enable=1"                    >> /usr/local/etc/php/conf.d/opcache.ini && \
    echo "opcache.memory_consumption=128"      >> /usr/local/etc/php/conf.d/opcache.ini && \
    echo "opcache.max_accelerated_files=10000" >> /usr/local/etc/php/conf.d/opcache.ini && \
    echo "opcache.validate_timestamps=0"       >> /usr/local/etc/php/conf.d/opcache.ini && \
    echo "opcache.revalidate_freq=0"           >> /usr/local/etc/php/conf.d/opcache.ini

# ============================================================
# PHP-FPM CONFIG (hemat RAM)
# ============================================================
RUN echo "[www]"                    >> /usr/local/etc/php-fpm.d/www.conf && \
    echo "pm = dynamic"             >> /usr/local/etc/php-fpm.d/www.conf && \
    echo "pm.max_children = 5"      >> /usr/local/etc/php-fpm.d/www.conf && \
    echo "pm.start_servers = 2"     >> /usr/local/etc/php-fpm.d/www.conf && \
    echo "pm.min_spare_servers = 1" >> /usr/local/etc/php-fpm.d/www.conf && \
    echo "pm.max_spare_servers = 3" >> /usr/local/etc/php-fpm.d/www.conf && \
    echo "pm.max_requests = 500"    >> /usr/local/etc/php-fpm.d/www.conf

# ============================================================
# COMPOSER
# ============================================================
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# ============================================================
# APP
# ============================================================
WORKDIR /var/www/html

COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Install Puppeteer — pakai system Chromium, tidak download sendiri
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
RUN npm init -y && npm install puppeteer

RUN chown -R www-data:www-data \
    /var/www/html/storage \
    /var/www/html/bootstrap/cache

# ============================================================
# BROWSERSHOT ENV
# ============================================================
ENV BROWSERSHOT_CHROMIUM_PATH=/usr/bin/chromium
ENV BROWSERSHOT_NODE_MODULES=/var/www/html/node_modules

# ============================================================
# START
# ============================================================
EXPOSE $PORT

CMD php artisan config:cache && \
    php artisan route:cache && \
    php artisan storage:link && \
    php artisan migrate --force && \
    php artisan serve --host=0.0.0.0 --port=$PORT