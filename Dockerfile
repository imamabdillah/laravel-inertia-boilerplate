# syntax=docker/dockerfile:1

# ============================================================
# Stage 1 — base: PHP 8.3 FPM + Nginx + ekstensi PostgreSQL
# ============================================================
FROM serversideup/php:8.3-fpm-nginx AS base

USER root
RUN install-php-extensions pdo_pgsql pgsql intl gd exif

# ============================================================
# Stage 2 — vendor: composer install tanpa dev dependency
# --no-scripts karena artisan belum ada di stage ini
# ============================================================
FROM base AS vendor

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --no-scripts --prefer-dist --no-progress

# ============================================================
# Stage 3 — assets: build Vite
# Wajib ada PHP + vendor di stage ini: plugin Wayfinder nge-boot
# Laravel buat generate resources/js/routes saat `vite build`
# ============================================================
FROM base AS assets

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

COPY --from=vendor /var/www/html/vendor ./vendor
COPY . .

# APP_KEY dummy cukup — wayfinder:generate tidak butuh DB/key asli
ENV APP_ENV=production \
    APP_DEBUG=false \
    APP_KEY=base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=

RUN npm ci && npm run build

# ============================================================
# Stage 4 — production
# ============================================================
FROM base AS production

ENV APP_ENV=production \
    APP_DEBUG=false \
    PHP_OPCACHE_ENABLE=1

COPY --chown=www-data:www-data --from=vendor /var/www/html/vendor ./vendor
COPY --chown=www-data:www-data . .
COPY --chown=www-data:www-data --from=assets /var/www/html/public/build ./public/build

RUN composer dump-autoload --optimize --no-dev \
    && chown -R www-data:www-data vendor bootstrap/cache storage

USER www-data
