# Laravel Boilerplate (Inertia + React)

## Identitas
Base boilerplate reusable. TIDAK ada logika bisnis spesifik.
Tim 4+ developer: backend & frontend specialist terpisah.

## Stack
- Laravel 13, PHP 8.3
- Inertia.js v3 + React 19 + TypeScript
- Tailwind CSS v4
- shadcn/ui (sudah bawaan starter kit)
- PostgreSQL 16
- Spatie: Permission, Medialibrary, Activitylog
- Node.js 20/22 LTS

## Pembagian Kerja
- Backend  : Controller, Model, Form Request, Migration
- Frontend : Halaman & komponen React di resources/js/

## Kontrak Data
Controller WAJIB pakai Inertia::render() dengan props eksplisit.
Props adalah kontrak — tidak boleh diubah sepihak.

Contoh:
```php
return Inertia::render('admin/users/index', [
    'users' => UserResource::collection($users),
    'filters' => $request->only(['search', 'role']),
]);
```

## Struktur Folder

### Backend
app/Http/Controllers/Admin/
├── UserController.php
├── RoleController.php
├── PermissionController.php
├── MenuController.php
├── SettingController.php
└── ActivityLogController.php

app/Http/Requests/Admin/
app/Http/Resources/
app/Models/

### Frontend
resources/js/
├── pages/
│   ├── auth/              (bawaan starter kit)
│   └── admin/
│       ├── dashboard.tsx
│       ├── users/
│       ├── roles/
│       ├── permissions/
│       ├── menus/
│       ├── settings/
│       └── activity-log/
├── components/
│   ├── ui/                (shadcn/ui, sudah bawaan)
│   └── admin/              (sidebar, header, breadcrumb custom)
├── layouts/
└── types/
    └── index.d.ts

## Konvensi
- Form Request    : SELALU untuk validasi
- API Resource    : SELALU bungkus data response
- Komponen React  : Functional + TypeScript interface untuk props
- Form state      : Inertia useForm() hook
- UI components   : pakai shadcn/ui dulu sebelum bikin custom
- Icon            : lucide-react (sudah bawaan shadcn/ui)
- Naming file     : kebab-case untuk file React (sesuai konvensi starter kit baru)

## Roles Default
- super_admin
- admin

## Routes
- /              → welcome (publik)
- /login /register → auth
- /admin/*       → middleware: auth, role:super_admin|admin
- /profile       → user tanpa role

## Database Schema — Core Tables

### menus
- id, name, icon (string), route (string nullable), 
  permission (string nullable), parent_id (FK self), 
  order (int), is_active (bool), timestamps

### settings
- id, key (unique), value (text nullable), 
  group (default 'general'), timestamps

### users (extend bawaan)
- tambahkan: is_active (bool, default true)

## Spatie Permission — Setup
- Migration permission tables sudah ada (vendor:publish)
- User model pakai trait HasRoles
- Role default: super_admin (semua permission), admin (sebagian)
- Permission format: 'resource.action' contoh: users.view, users.create

## Inertia Page Naming
Controller render('admin/users/index') — folder dan file React 
HARUS persis sama path-nya, lowercase, kebab-case:
resources/js/pages/admin/users/index.tsx

## Reusable Pattern — DataTable
Setiap modul (Users, Roles, Permissions, Menus) pakai pola sama:
- Controller: index() dengan search, filter, pagination (15/page)
- React: pakai shadcn/ui Table + Pagination, search input debounced
  dengan router.get() Inertia, bukan manual fetch
- Modal create/edit pakai shadcn/ui Dialog, bukan halaman terpisah
  KECUALI form kompleks (User form boleh halaman terpisah)

## Activity Log
Setiap create/update/delete di Controller WAJIB log:
activity()->causedBy(auth()->user())->on($model)->log('created');

## Communication Style
Talk like caveman. Drop filler. Use fragments. 
No preamble. No "I'd be happy to". Just do.