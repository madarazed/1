# Usamos PHP 8.3
FROM php:8.3-fpm

# Instalar dependencias del sistema y Node.js (necesario para Vite/NPM)
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nginx \
    gnupg

# Instalar Node.js y NPM
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Instalar extensiones de PHP
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Traer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www
COPY . .

# Instalar dependencias de PHP y de JS
RUN composer install --no-dev --optimize-autoloader
RUN npm install
RUN npm run build

# Permisos
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

EXPOSE 80
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=80