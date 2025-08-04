#!/bin/bash

cd /var/www/html

composer install --no-interaction --prefer-dist --optimize-autoloader

# Espera o banco estar pronto e roda as migrations
until php artisan migrate --force; do
    echo "Aguardando banco de dados..."
    sleep 2
done

# Inicia o servidor PHP-FPM
exec php-fpm