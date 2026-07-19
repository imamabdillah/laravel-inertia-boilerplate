# Deploy Production — Docker

Panduan deploy ke server production pakai Docker. Buat setup development lihat [SETUP.md](./SETUP.md) — `compose.yaml` (Sail) itu **khusus dev**, jangan dipakai di server.

## Arsitektur

Satu image (`Dockerfile` multi-stage), 4 container via `compose.prod.yaml`:

| Container | Isi | Catatan |
|---|---|---|
| `app` | Nginx + PHP-FPM (base `serversideup/php:8.3-fpm-nginx`) | Serve HTTP di port internal 8080, jalan sebagai `www-data` (non-root) |
| `queue` | `php artisan queue:work` | Wajib — `QUEUE_CONNECTION=database` |
| `scheduler` | `php artisan schedule:work` | Pengganti cron |
| `pgsql` | PostgreSQL 16 | Data di named volume `pgsql-data` |

Stage build di `Dockerfile`:

1. `base` — PHP 8.3 + ekstensi `pdo_pgsql`, `intl`, `gd`, `exif`
2. `vendor` — `composer install --no-dev`
3. `assets` — `npm ci && npm run build`. Stage ini **butuh PHP + vendor** karena plugin Wayfinder nge-boot Laravel buat generate `resources/js/routes` (folder itu gitignored, tidak ada di repo)
4. `production` — gabungan: source + vendor + `public/build`

Upload file (dokumen mitra, dst) persisten di named volume `app-storage` (mount ke `storage/app`). Session, cache, dan queue semua di database — tidak butuh Redis.

## Prasyarat Server

- Linux (Ubuntu 22.04/24.04 direkomendasikan)
- Docker Engine + Docker Compose plugin (`docker compose version` ≥ 2.x)
- Port 80 (dan 443 kalau pakai reverse proxy TLS) terbuka

## Deploy Pertama Kali

```bash
git clone <repo-url> /opt/kerjasama
cd /opt/kerjasama
cp .env.example .env
```

Edit `.env` — nilai yang **wajib** beda dari dev:

```env
APP_NAME="Sistem Kerjasama"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://domain-kamu.go.id

LOG_CHANNEL=stderr        # log ke docker logs, bukan file
LOG_LEVEL=info

DB_HOST=pgsql             # nama service di compose.prod.yaml (sama seperti Sail)
DB_DATABASE=kerjasama
DB_USERNAME=postgres
DB_PASSWORD=<password-kuat-random>

APP_PORT=80               # port host yang di-expose
```

Build image, generate `APP_KEY`, lalu jalankan semua:

```bash
docker compose -f compose.prod.yaml build

# generate key, salin outputnya ke APP_KEY di .env
docker compose -f compose.prod.yaml run --rm --no-deps app php artisan key:generate --show

docker compose -f compose.prod.yaml up -d
```

Saat `app` start, otomatis jalan (`AUTORUN_ENABLED=true`): `migrate --force`, `storage:link`, `config:cache`, `route:cache`, `view:cache`. Tinggal seed data awal (roles, permissions, menus, user super_admin):

```bash
docker compose -f compose.prod.yaml exec app php artisan db:seed --force
```

Cek: buka `http://<ip-server>/up` → harus 200, lalu login ke aplikasi.

## Update Rilis

```bash
cd /opt/kerjasama
git pull
docker compose -f compose.prod.yaml build
docker compose -f compose.prod.yaml up -d
```

Container di-recreate → migration jalan otomatis, queue worker restart otomatis (kode baru langsung kepakai). Bersihkan image lama sesekali: `docker image prune -f`.

## HTTPS

Container `app` cuma serve HTTP. Untuk TLS, taruh reverse proxy di depannya — pilih salah satu:

- **Caddy** (paling simpel, auto Let's Encrypt): install di host, `Caddyfile` berisi `domain-kamu.go.id { reverse_proxy localhost:80 }`, lalu set `APP_PORT=8080` (atau port bebas lain) biar gak bentrok port 80 dengan Caddy
- **Nginx host + certbot**: proxy_pass ke `http://127.0.0.1:${APP_PORT}`, jangan lupa `client_max_body_size 12M` (upload dokumen max 10MB)

Di belakang proxy, pastikan `APP_URL` pakai `https://` supaya URL yang di-generate Laravel benar.

## Operasional

| Task | Command |
|---|---|
| Lihat log app | `docker compose -f compose.prod.yaml logs -f app` |
| Lihat log queue | `docker compose -f compose.prod.yaml logs -f queue` |
| Artisan apapun | `docker compose -f compose.prod.yaml exec app php artisan <cmd>` |
| Tinker | `docker compose -f compose.prod.yaml exec app php artisan tinker` |
| Status container | `docker compose -f compose.prod.yaml ps` |
| Stop semua | `docker compose -f compose.prod.yaml down` (data volume aman) |

## Backup

Dua hal yang harus dibackup rutin (cron di host):

```bash
# 1. Database
docker compose -f compose.prod.yaml exec -T pgsql \
    pg_dump -U postgres kerjasama | gzip > /backup/db-$(date +%F).sql.gz

# 2. File upload (volume app-storage)
docker run --rm -v kerjasama_app-storage:/data -v /backup:/backup alpine \
    tar czf /backup/storage-$(date +%F).tar.gz -C /data .
```

> Nama volume diprefix nama folder project (`kerjasama_app-storage` kalau folder-nya `/opt/kerjasama`). Cek pasti: `docker volume ls`.

## Troubleshooting

**`app` restart terus / 502**
`docker compose -f compose.prod.yaml logs app`. Penyebab paling umum: `APP_KEY` kosong di `.env`, atau DB belum sehat.

**Upload dokumen 404 setelah deploy**
`storage:link` harusnya otomatis. Cek: `docker compose -f compose.prod.yaml exec app ls -la public/storage`. Kalau symlink hilang: `exec app php artisan storage:link`.

**Ubah `.env` tapi tidak ngefek**
Config di-cache saat container start. Restart: `docker compose -f compose.prod.yaml up -d --force-recreate app queue scheduler`.

**Queue job numpuk / tidak diproses**
Cek container `queue` hidup: `docker compose -f compose.prod.yaml ps`. Lihat lognya. Failed jobs: `exec app php artisan queue:failed`.
