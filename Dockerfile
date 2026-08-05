# syntax=docker/dockerfile:1

FROM php:8.4-fpm AS php-base

RUN apt-get update \
    && apt-get install -y --no-install-recommends git libicu-dev libonig-dev libzip-dev unzip \
    && docker-php-ext-install -j"$(nproc)" bcmath intl mbstring opcache pdo_mysql zip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

FROM php-base AS vendor

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-interaction --no-progress --prefer-dist --optimize-autoloader

FROM node:22-bookworm AS frontend

WORKDIR /app

COPY . .
RUN npm ci && WAYFINDER_ENABLED=false npm run build

FROM php-base AS app

COPY . .
COPY --from=vendor /var/www/html/vendor ./vendor
COPY --from=frontend /app/public/build ./public/build
COPY docker/php/entrypoint.sh /usr/local/bin/start-app

RUN chmod +x /usr/local/bin/start-app \
    && mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

USER www-data

EXPOSE 9000

ENTRYPOINT ["start-app"]
CMD ["php-fpm"]

FROM nginx:1.27-alpine AS nginx

COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY public /var/www/html/public
COPY --from=frontend /app/public/build /var/www/html/public/build
