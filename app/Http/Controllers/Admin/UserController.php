<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\RefDirektorat;
use App\Models\RefUpt;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::with(['roles', 'direktorat', 'upt'])
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
            'users' => UserResource::collection($users),
            'roles' => Role::orderBy('name')->pluck('name'),
            'filters' => $request->only(['search', 'role', 'status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/users/create', [
            'roles' => Role::orderBy('name')->pluck('name'),
            'direktorats' => RefDirektorat::active()->orderBy('order')->get(['id', 'name']),
            'upts' => RefUpt::active()->orderBy('order')->get(['id', 'name']),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'is_active' => $request->boolean('is_active', true),
            'direktorat_id' => in_array('admin_direktorat', $request->roles) ? $request->direktorat_id : null,
            'upt_id' => in_array('admin_upt', $request->roles) ? $request->upt_id : null,
        ]);

        $user->assignRole($request->roles);

        activity()->causedBy(auth()->user())->on($user)->log('created');

        Inertia::flash('toast', ['type' => 'success', 'message' => 'User berhasil dibuat.']);

        return redirect()->route('admin.users.index');
    }

    public function edit(User $user): Response
    {
        return Inertia::render('admin/users/edit', [
            'user' => new UserResource($user->load(['roles', 'direktorat', 'upt'])),
            'roles' => Role::orderBy('name')->pluck('name'),
            'direktorats' => RefDirektorat::active()->orderBy('order')->get(['id', 'name']),
            'upts' => RefUpt::active()->orderBy('order')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'is_active' => $request->boolean('is_active', true),
            'direktorat_id' => in_array('admin_direktorat', $request->roles) ? $request->direktorat_id : null,
            'upt_id' => in_array('admin_upt', $request->roles) ? $request->upt_id : null,
        ];

        if ($request->filled('password')) {
            $data['password'] = $request->password;
        }

        $user->update($data);
        $user->syncRoles($request->roles);

        activity()->causedBy(auth()->user())->on($user)->log('updated');

        Inertia::flash('toast', ['type' => 'success', 'message' => 'User berhasil diperbarui.']);

        return redirect()->route('admin.users.index');
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Tidak bisa hapus akun sendiri.']);

            return back();
        }

        activity()->causedBy(auth()->user())->on($user)->log('deleted');

        $user->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'User berhasil dihapus.']);

        return back();
    }

    public function toggleActive(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Tidak bisa nonaktifkan akun sendiri.']);

            return back();
        }

        $user->update(['is_active' => ! $user->is_active]);

        activity()->causedBy(auth()->user())->on($user)
            ->log($user->is_active ? 'activated' : 'deactivated');

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Status user berhasil diubah.']);

        return back();
    }

    public function resetPassword(User $user): RedirectResponse
    {
        $user->update(['password' => 'password']);

        activity()->causedBy(auth()->user())->on($user)->log('password_reset');

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Password user berhasil direset ke "password".']);

        return back();
    }
}
