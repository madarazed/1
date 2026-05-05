# Etapa 1: Construcción de assets con Node
FROM node:18 AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Entorno de ejecución con PHP
FROM php:8.2-fpm

# Instalar dependencias del sistema y extensiones de PHP para MySQL
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    unzip \
    git \
    curl \
    && docker-php-ext-install pdo_mysql gd

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copiar el proyecto
COPY . .

# Copiar los assets construidos en la etapa 1
COPY --from=build-stage /app/public/build ./public/build

# Instalar dependencias de PHP
RUN composer install --no-dev --optimize-autoloader

# Ajustar permisos para Laravel
RUN chown -R www-data:www-data /var/www/storage /var/www/cache

EXPOSE 9000
CMD ["php-fpm"]