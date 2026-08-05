#!/bin/sh
set -eu

php artisan package:discover --ansi

until php artisan migrate --force --no-interaction; do
    echo "Database belum siap; mencoba ulang dalam 3 detik..."
    sleep 3
done

php artisan config:cache
php artisan route:cache
php artisan view:cache

exec "$@"
