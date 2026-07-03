# Setup Environment

Panduan setup dari nol sampai aplikasi jalan. Baca [CODING_GUIDE.md](./CODING_GUIDE.md) buat konvensi coding setelah environment siap.

## Prasyarat

- PHP 8.3
- Composer
- Node.js 20/22 LTS
- PostgreSQL 16
- Docker Desktop + WSL2 (kalau pakai Sail — direkomendasikan)

## Kenapa Docker/Sail Direkomendasikan

Semua developer pakai PHP version, ekstensi, dan webserver yang sama persis. Kejadian nyata di proyek ini: upload file gagal total (`has_file: false` di server) waktu dijalankan lewat `php artisan serve`, tapi normal lewat Sail/Herd. Root cause: built-in PHP dev server (`php artisan serve` / `php -S`) punya bug menangani multipart file upload, terutama di Windows.

**Aturan wajib: jangan pernah pakai `php artisan serve` untuk apapun yang melibatkan file upload.** Untuk kerja sehari-hari, pakai Sail atau Herd.

## Opsi 1: Docker / Laravel Sail (Direkomendasikan)

```bash
git clone <repo-url>
cd laravel-inertia-boilerplate
cp .env.example .env
```

Kalau folder `vendor/` belum ada (clone pertama kali, belum pernah `composer install`), install dependency lewat container sementara dulu (belum ada PHP lokal):

```bash
docker run --rm \
    -u "$(id -u):$(id -g)" \
    -v "$(pwd):/var/www/html" \
    -w /var/www/html \
    laravelsail/php83-composer:latest \
    composer install --ignore-platform-reqs
```

Kalau sudah ada `vendor/` (repo ini biasanya sudah pernah di-install), langsung lanjut:

```bash
./vendor/bin/sail up -d
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan migrate
npm install
npm run dev
```

Buka `http://localhost` (port default sesuai `APP_PORT` di `.env`, default 80).

`npm run dev` dijalankan di host (bukan di container) — cukup Node.js lokal, tidak perlu masuk container buat kerja di frontend. Yang wajib lewat Sail cuma PHP/DB (`sail artisan`, `sail composer`, dst).

### Windows

Sail butuh **WSL2 + Docker Desktop** dengan WSL2 backend aktif. Jalankan semua command `sail` dari terminal WSL2, bukan PowerShell/CMD native — kalau tidak, file-watching dan performa volume mount bakal lambat/rusak.

### Database di dalam Sail

`.env.example` sudah di-set buat Sail: `DB_HOST=pgsql` (nama service di `compose.yaml`, bukan `127.0.0.1`). Kalau `.env` kamu masih nunjuk ke Postgres native (`127.0.0.1`), ganti ke `pgsql` pas pindah ke Sail.

## Opsi 2: Native (Laravel Herd / instalasi PHP lokal)

Alternatif kalau tidak mau pakai Docker. Tetap **jangan** pakai `php artisan serve` — pakai Herd (atau webserver nyata lainnya: nginx/apache + php-fpm).

1. Install PHP 8.3 dengan ekstensi `pgsql` aktif
2. Install PostgreSQL 16, buat database (default nama: `boilerplate`)
3. `cp .env.example .env`, sesuaikan:
   ```
   DB_HOST=127.0.0.1
   DB_DATABASE=boilerplate
   DB_USERNAME=<user_postgres_kamu>
   DB_PASSWORD=<password_kamu>
   ```
4. `composer install`
5. `php artisan key:generate`
6. `php artisan migrate`
7. `npm install && npm run dev`
8. Park/link folder project di Herd, buka lewat domain `.test`-nya

## Environment Variables Penting

| Variable | Native (Herd) | Sail |
|---|---|---|
| `DB_HOST` | `127.0.0.1` | `pgsql` |
| `DB_DATABASE` | `boilerplate` | `boilerplate` |
| `DB_USERNAME` | sesuai instalasi Postgres kamu | `postgres` |
| `DB_PASSWORD` | sesuai instalasi Postgres kamu | `password` |
| `SESSION_DRIVER` | `database` | `database` |
| `QUEUE_CONNECTION` | `database` | `database` |
| `CACHE_STORE` | `database` | `database` |

## Perintah Sehari-hari

| Task | Sail | Native |
|---|---|---|
| Start/stop server | `sail up -d` / `sail down` | (Herd jalan otomatis) |
| Migrate | `sail artisan migrate` | `php artisan migrate` |
| Migrate fresh + seed | `sail artisan migrate:fresh --seed` | `php artisan migrate:fresh --seed` |
| Tinker | `sail artisan tinker` | `php artisan tinker` |
| Dev server frontend | `npm run dev` (di host) | `npm run dev` |
| Build production | `npm run build` | `npm run build` |
| Lint PHP (Pint) | `sail composer lint` | `composer lint` |
| Static analysis PHP (Larastan) | `sail composer types:check` | `composer types:check` |
| Lint JS/TS (ESLint) | `npm run lint` | `npm run lint` |
| Format JS/TS (Prettier) | `npm run format` | `npm run format` |
| Type check TS | `npm run types:check` | `npm run types:check` |
| Full test suite | `sail composer test` | `composer test` |

`composer test` menjalankan: config clear → lint:check → types:check → `php artisan test`. Jalankan ini sebelum push/PR.

## Troubleshooting

**Upload file gagal, log server `has_file: false`**
Kamu jalanin app lewat `php artisan serve`. Pindah ke Sail atau Herd.

**`SQLSTATE[08006] Connection refused` / DB tidak connect**
Cek `DB_HOST` di `.env` — `127.0.0.1` untuk Postgres native, `pgsql` untuk Sail. Kalau baru pindah dari satu ke yang lain, `.env` kamu kemungkinan masih nunjuk config lama.

**Upload/storage 404 atau file tidak muncul**
`php artisan storage:link` belum dijalankan.

**Vite HMR tidak connect / halaman putih pas dev**
Pastikan `npm run dev` masih jalan di terminal terpisah. `APP_URL` di `.env` harus sesuai domain/port yang benar-benar dipakai browser.

**Windows: `sail` command lambat / file change tidak ke-detect**
Jalankan dari WSL2 terminal, bukan PowerShell. Project sebaiknya juga di-clone di dalam filesystem WSL2 (`\\wsl$\...` atau langsung di `~/`), bukan di drive Windows (`/mnt/d/...`) — mount cross-filesystem jauh lebih lambat.
