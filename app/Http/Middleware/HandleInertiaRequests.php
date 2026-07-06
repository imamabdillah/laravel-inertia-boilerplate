<?php

namespace App\Http\Middleware;

use App\Models\Menu;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        $permissions = [];
        $menus = [];

        if ($user) {
            // Load once — used both for auth.permissions (frontend) and menu filtering.
            // Using the same source ensures sidebar visibility is always in sync
            // with what auth.permissions says the user has.
            $permissionSet = $user->getAllPermissions()->pluck('name')->flip()->toArray();
            $permissions = array_keys($permissionSet);

            $canSee = fn (?string $permission): bool => $permission === null || isset($permissionSet[$permission]);

            $menus = Menu::where('is_active', true)
                ->whereNull('parent_id')
                ->orderBy('order')
                ->with([
                    'group',
                    'children' => fn ($q) => $q->where('is_active', true)->orderBy('order'),
                ])
                ->get()
                ->filter(fn (Menu $menu) => $canSee($menu->permission))
                ->map(fn (Menu $menu) => [
                    'id' => $menu->id,
                    'name' => $menu->name,
                    'group' => $menu->group?->name,
                    'icon' => $menu->icon,
                    'route' => $menu->route,
                    'permission' => $menu->permission,
                    'order' => $menu->order,
                    'children' => $menu->children
                        ->filter(fn (Menu $child) => $canSee($child->permission))
                        ->map(fn (Menu $child) => [
                            'id' => $child->id,
                            'name' => $child->name,
                            'icon' => $child->icon,
                            'route' => $child->route,
                            'permission' => $child->permission,
                            'order' => $child->order,
                        ])
                        ->values(),
                ])
                ->values();
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? array_merge($user->toArray(), [
                    'roles' => $user->getRoleNames()->toArray(),
                    'permissions' => $permissions,
                ]) : null,
            ],
            'menus' => $menus,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
