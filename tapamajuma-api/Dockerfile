# backend/Dockerfile
FROM php:8.2-fpm

# Install dependencies system
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    curl

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Get Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy existing application directory
COPY . .

# Install dependencies Laravel
RUN composer install --no-interaction --optimize-autoloader --no-dev

# Permission (Penting!)
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache