# Panduan Coding, Routing & Best Practice

Base boilerplate reusable — tidak ada logika bisnis spesifik di dalamnya. Modul baru mengikuti pola yang sudah dipakai modul Admin (Users, Roles, dst). Lihat [SETUP.md](./SETUP.md) buat setup environment.

## Struktur Modul (Backend)

```
app/Http/Controllers/Admin/UserController.php
app/Http/Requests/Admin/StoreUserRequest.php
app/Http/Requests/Admin/UpdateUserRequest.php
app/Http/Resources/UserResource.php
```

Controller → Form Request (validasi) → Resource (bentuk response) → Model. Modul baru ikut pola 4 file ini.

### Controller — index() dengan search/filter/pagination

Contoh nyata dari `UserController::index()`:

```php
public function index(Request $request): Response
{
    $users = User::with('roles')
        ->when($request->search, fn ($q, $search) => $q->where(function ($q) use ($search) {
            $q->where('name', 'ilike', "%{$search}%")
              ->orWhere('email', 'ilike', "%{$search}%");
        }))
        ->when($request->role, fn ($q, $role) => $q->role($role))
        ->when($request->status !== null && $request->status !== '', fn ($q) => $q->where('is_active', $request->status === '1'))
        ->orderBy('name')
        ->paginate(15)
        ->withQueryString();

    return Inertia::render('admin/users/index', [
        'users'   => UserResource::collection($users),
        'roles'   => Role::orderBy('name')->pluck('name'),
        'filters' => $request->only(['search', 'role', 'status']),
    ]);
}
```

Poin penting:
- `when()` untuk filter kondisional, bukan `if/else` manual berantakan
- `ilike` (bukan `like`) — PostgreSQL, biar pencarian case-insensitive
- `paginate(15)` — standar 15/halaman di seluruh modul
- `withQueryString()` — filter tetap kebawa pas pindah halaman pagination
- Props kembalian **eksplisit**: `users`, `roles`, `filters` — `filters` dipakai frontend buat restore state form pencarian

### Form Request — WAJIB untuk semua validasi

Jangan validasi inline di controller (kecuali kasus kecil yang belum sempat di-refactor — lihat catatan di bagian Known Issues). Pola: `authorize()` cek permission spesifik, bukan `return true` polos.

```php
class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('users.create');
    }

    public function rules(): array
    {
        return [
            'name'      => ['required', 'string', 'max:255'],
            'email'     => ['required', 'email', 'max:255', 'unique:users,email'],
            'password'  => ['required', 'string', Password::defaults(), 'confirmed'],
            'role'      => ['required', 'string', 'exists:roles,name'],
            'is_active' => ['boolean'],
        ];
    }
}
```

Untuk update, exclude ID sendiri di rule `unique`:

```php
'email' => ['required', 'email', 'max:255', "unique:users,email,{$userId}"],
```

### API Resource — WAJIB bungkus semua response data

```php
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'email'      => $this->email,
            'is_active'  => $this->is_active,
            'roles'      => $this->whenLoaded('roles', fn () => $this->roles->pluck('name')->values()->all(), []),
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}
```

Pakai `whenLoaded()` untuk relasi — hindari N+1 kalau relasi memang belum di-`with()`.

### Activity Log — WAJIB di setiap create/update/delete

```php
activity()->causedBy(auth()->user())->on($model)->log('created');
activity()->causedBy(auth()->user())->on($model)->log('updated');
activity()->causedBy(auth()->user())->on($model)->log('deleted');
```

`on($model)` harus mengarah ke model yang benar-benar berubah — konsisten, jangan campur (lihat Known Issues, ada 1 contoh yang tidak konsisten di codebase saat ini).

### File Upload (backend)

```php
$request->validate([
    'jenis_dokumen' => ['required', 'in:...'],
    'file'          => ['required', 'file', 'max:10240', 'mimes:pdf,jpg,jpeg,png'],
]);

$path = $file->store("folder-name/{$parentId}", 'public');
```

`max:10240` = 10MB dalam KB. Simpan lewat disk `public` + `php artisan storage:link` supaya bisa diakses browser.

## Routing

### routes/web.php — struktur

Tiga grup middleware utama:

```php
Route::prefix('admin')
    ->middleware(['auth', 'verified', 'role:super_admin|admin'])
    ->name('admin.')
    ->group(function () { ... });

Route::prefix('mitra')
    ->middleware(['auth', 'verified', 'role:mitra'])
    ->name('mitra.')
    ->group(function () { ... });
```

Route publik pakai shorthand: `Route::inertia('/', 'welcome')->name('home')`. Untuk resource CRUD standar pakai `Route::resource()->except([...])` lalu tambahkan action custom di baris terpisah (contoh: `users.toggle-active`, `users.reset-password`).

### Inertia Page Naming — HARUS persis sama

```php
return Inertia::render('admin/users/index', [...]);
```

wajib punya file persis di:

```
resources/js/pages/admin/users/index.tsx
```

Lowercase, kebab-case, path folder sama persis dengan string di `render()`.

## Frontend

### Wayfinder Routes — WAJIB, JANGAN hardcode URL string

Proyek ini pakai **Laravel Wayfinder**, bukan Ziggy. **Tidak ada** helper global `route()` — motretnya bakal `ReferenceError: route is not defined`.

```ts
import profil from '@/routes/mitra/profil';

router.post(profil.dokumen.upload().url, data, opts);
put(profil.update().url);
router.delete(profil.dokumen.delete(id).url, opts);
```

File di `resources/js/routes/**` itu auto-generated dari `web.php` (via `@laravel/vite-plugin-wayfinder`, regenerate otomatis pas `npm run dev`/`build`). **Jangan edit manual.** Struktur foldernya ngikutin nama route: `mitra.profil.*` → `resources/js/routes/mitra/profil/index.ts`, `admin.users.*` → `resources/js/routes/admin/users/index.ts`.

Contoh yang benar: `resources/js/pages/mitra/profil/edit.tsx`. Lihat Known Issues untuk contoh yang belum ikut pola ini.

### Props Contract

Type di frontend harus persis cocok dengan props yang di-`return` controller:

```ts
type Props = {
    users: PaginatedData<AdminUser>;
    roles: string[];
    filters: { search?: string; role?: string; status?: string };
};
```

Props adalah kontrak antara backend-frontend — kalau mau ubah bentuknya, ubah dua-duanya bareng, jangan sepihak.

### DataTable Pattern (halaman index/list)

Semua modul list (Users, Roles, Permissions, Menus, dst) pakai pola sama:

- shadcn/ui `Table` + pagination dari `users.meta.links` (array link paginator Laravel)
- Search input **didebounce** (400ms) pakai `useRef<ReturnType<typeof setTimeout>>` + `useEffect`, baru trigger request — jangan request tiap keystroke
- Filter (`Select`, dst) trigger langsung ke `applyFilters` saat `onChange`
- Query ke server pakai `router.get()` Inertia, **bukan** `fetch` manual:
  ```ts
  router.get('/admin/users', { ...filters, ...overrides }, { preserveState: true, replace: true });
  ```
- `preserveState: true` — supaya state lokal (misal input search yang lagi diketik) gak reset pas response datang
- Modal create/edit pakai shadcn/ui `Dialog`, **kecuali** form kompleks (boleh halaman terpisah — contoh: form User)
- Row action dengan konfirmasi (delete, reset password) pakai local state (`deleteTarget`) buat kontrol dialog, eksekusi mutation di handler terpisah dengan `onFinish` buat clear state

### File Upload (frontend) — Inertia v3

```ts
router.post(url, { field: 'text', file: fileObj }, opts);
```

Kirim `File` langsung sebagai property di plain object — Inertia otomatis convert ke `FormData` kalau mendeteksi ada `File`/`Blob` di dalamnya. **Jangan** bikin `FormData` manual + `forceFormData: true`, gak perlu (walaupun secara teknis jalan di Inertia v3.5, plain object adalah pola resmi dan lebih simple).

> Kalau upload tetap gagal (`has_file: false` di server) padahal kode di frontend sudah benar: curiga environment, bukan kode. Lihat [SETUP.md](./SETUP.md) — `php artisan serve` punya bug multipart upload.

### TypeScript Types

`resources/js/types/` dipecah per topik, di-barrel-export lewat `index.ts`:

- `auth.ts` — `User`, `Auth`, `Role`, `AdminUser`, `PaginatedData<T>`, dan type domain (`Mitra`, `DokumenMitra`, dst)
- `navigation.ts` — `BreadcrumbItem`, `NavItem`, `MenuItem`
- `ui.ts` — `AppLayoutProps`, `FlashToast`, dst
- `global.d.ts` — module augmentation `InertiaConfig.sharedPageProps` (bikin `usePage().props` ke-type otomatis di seluruh app)

Type domain baru (bukan generic UI) taruh di `auth.ts` kalau terkait entitas utama, atau file baru kalau modulnya besar. Props spesifik 1 halaman boleh didefinisikan inline di page-nya (lihat pola `type Props = {...}` di tiap `index.tsx`/`edit.tsx`).

## Style & Quality Gate

| Check | Command |
|---|---|
| PHP lint (Pint) | `composer lint` |
| PHP static analysis (Larastan) | `composer types:check` |
| JS/TS lint (ESLint) | `npm run lint` |
| JS/TS format (Prettier) | `npm run format` |
| TS type check | `npm run types:check` |
| Semua sekaligus + test | `composer test` |

Jalankan `composer test` sebelum push. Config sumber kebenaran ada di `pint.json`, `eslint.config.js`, `.prettierrc` — jangan override manual per-file kecuali ada alasan kuat.

## Known Issues di Codebase Saat Ini

Dicatat biar modul baru **tidak** ikut nyontoh pola ini:

1. **`resources/js/pages/admin/users/index.tsx`** masih pakai hardcoded URL string (`/admin/users`, dst) untuk `router.get/patch/delete`, belum migrasi ke Wayfinder route object. Modul baru: ikuti pola `resources/js/pages/mitra/profil/edit.tsx` (sudah pakai Wayfinder).
2. **`app/Http/Controllers/Mitra/ProfilController.php@uploadDokumen`** masih ada validasi inline (`$request->validate()`) alih-alih Form Request class, plus leftover `\Log::info('DEBUG upload', ...)` dari sesi debug bug `php artisan serve`. Aman secara fungsi, tapi jangan dicontoh sebagai pola resmi — sebaiknya dibersihkan/dipindah ke `UploadDokumenRequest`.
3. **Konsistensi target Activity Log**: `uploadDokumen()` log ke `on($dokumen)`, tapi `deleteDokumen()` log ke `on($mitra)`. Pilih satu konvensi per jenis action ke depannya.
