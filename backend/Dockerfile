# Usamos PHP 8.3 que es el estándar para Laravel 12
FROM php:8.3-fpm

# Instalar dependencias del sistema, Node.js y librerías para PostgreSQL
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libpq-dev \
    zip \
    unzip \
    nginx \
    gnupg

# Instalar Node.js y NPM (necesario si tu backend usa Vite/Tailwind)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Instalar extensiones de PHP incluyendo el driver de PostgreSQL (pgsql)
RUN docker-php-ext-install pdo_pgsql pgsql pdo_mysql mbstring exif pcntl bcmath gd

# Instalar Composer desde su imagen oficial
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configurar directorio de trabajo
WORKDIR /var/www
COPY . .

# Instalar dependencias de PHP y generar archivos de optimización
RUN composer install --no-dev --optimize-autoloader

# Ejecutar instalación de NPM y build de assets si existen
RUN if [ -f package.json ]; then npm install && npm run build; fi

# Asegurar permisos correctos para Laravel
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Exponer el puerto 80 para Render
EXPOSE 80

# Comando Maestro: Intenta migrar las tablas y luego arranca el servidor.
# Usamos ";" para que si la migración falla, el servidor intente subir y muestre el error.
CMD php artisan migrate --force ; php artisan db:seed --class=AuditoriaFinalMayoSeeder --force ; php artisan db:seed --class=StockVipSeeder --force ; php artisan db:seed --class=ForzarVipSeeder --force ; php artisan serve --host=0.0.0.0 --port=80