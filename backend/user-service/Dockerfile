FROM php:8.4-fpm

RUN apt-get update && apt-get install -y \
    git unzip curl libpng-dev libonig-dev libxml2-dev zip libzip-dev \
    librdkafka-dev libzstd-dev libssl-dev wkhtmltopdf \
    libicu-dev libprotobuf-dev protobuf-compiler \
    && pecl install rdkafka \
    && docker-php-ext-enable rdkafka \
    && docker-php-ext-install pdo_mysql mbstring zip exif pcntl bcmath intl

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

RUN pecl install protobuf \
    && pecl install opentelemetry \
    && docker-php-ext-enable protobuf opentelemetry

WORKDIR /var/www/html

COPY . .

RUN chown -R www-data:www-data /var/www/html

RUN composer install --no-dev --optimize-autoloader \
    && composer require open-telemetry/opentelemetry-auto-laravel \
       open-telemetry/sdk \
       open-telemetry/exporter-otlp \
       php-http/guzzle7-adapter

COPY entrypoint.sh /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]