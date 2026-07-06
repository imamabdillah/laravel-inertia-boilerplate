<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreMenuRequest;
use App\Http\Requests\Admin\UpdateMenuRequest;
use App\Models\Menu;
use App\Models\MenuGroup;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;

class MenuController extends Controller
{
    public function index(): Response
    {
        $menus = Menu::with(['group', 'children.group'])
            ->whereNull('parent_id')
            ->orderBy('order')
            ->get()
            ->map(fn (Menu $m) => $this->formatMenu($m, true));

        $parents = Menu::whereNull('parent_id')
            ->orderBy('order')
            ->get(['id', 'name']);

        return Inertia::render('admin/menus/index', [
            'allMenus' => $menus,
            'parents' => $parents,
            'menuGroups' => MenuGroup::orderBy('name')->pluck('name'),
        ]);
    }

    public function store(StoreMenuRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['order'] ??= Menu::where('parent_id', $data['parent_id'] ?? null)->max('order') + 1;
        $data['group_id'] = $this->resolveGroupId($data['group'] ?? null);
        unset($data['group']);

        $menu = Menu::create($data);

        $this->syncPermissionFromMenu($data['permission'] ?? null);

        activity()->causedBy(auth()->user())->on($menu)->log('created');

        Inertia::flash('toast', ['type' => 'success', 'message' => "Menu \"{$menu->name}\" berhasil dibuat."]);

        return back();
    }

    public function update(UpdateMenuRequest $request, Menu $menu): RedirectResponse
    {
        $data = $request->validated();
        $data['group_id'] = $this->resolveGroupId($data['group'] ?? null);
        unset($data['group']);

        $menu->update($data);

        $this->syncPermissionFromMenu($data['permission'] ?? null);

        activity()->causedBy(auth()->user())->on($menu)->log('updated');

        Inertia::flash('toast', ['type' => 'success', 'message' => "Menu \"{$menu->name}\" berhasil diperbarui."]);

        return back();
    }

    private function resolveGroupId(?string $groupName): ?int
    {
        if (! filled($groupName)) {
            return null;
        }

        return MenuGroup::firstOrCreate(['name' => trim($groupName)])->id;
    }

    private function syncPermissionFromMenu(?string $permission): void
    {
        if (! filled($permission)) {
            return;
        }

        $resource = Str::beforeLast($permission, '.');

        foreach (['view', 'create', 'edit', 'delete'] as $action) {
            Permission::firstOrCreate(['name' => "{$resource}.{$action}", 'guard_name' => 'web']);
        }
    }

    public function destroy(Menu $menu): RedirectResponse
    {
        if ($menu->children()->count() > 0) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Menu masih memiliki submenu. Hapus submenu terlebih dahulu.']);

            return back();
        }

        activity()->causedBy(auth()->user())->on($menu)->log('deleted');

        $menu->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Menu berhasil dihapus.']);

        return back();
    }

    public function toggleActive(Menu $menu): RedirectResponse
    {
        $menu->update(['is_active' => ! $menu->is_active]);

        activity()->causedBy(auth()->user())->on($menu)
            ->log($menu->is_active ? 'activated' : 'deactivated');

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Status menu berhasil diubah.']);

        return back();
    }

    public function reorder(Request $request): RedirectResponse
    {
        $request->validate([
            'items' => ['required', 'array'],
            'items.*.id' => ['required', 'integer', 'exists:menus,id'],
            'items.*.order' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($request->items as $item) {
            Menu::where('id', $item['id'])->update(['order' => $item['order']]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Urutan menu berhasil disimpan.']);

        return back();
    }

    private function formatMenu(Menu $menu, bool $withChildren = false): array
    {
        $data = [
            'id' => $menu->id,
            'name' => $menu->name,
            'group' => $menu->group?->name,
            'icon' => $menu->icon,
            'route' => $menu->route,
            'permission' => $menu->permission,
            'parent_id' => $menu->parent_id,
            'order' => $menu->order,
            'is_active' => $menu->is_active,
        ];

        if ($withChildren) {
            $data['children'] = $menu->children
                ->map(fn (Menu $child) => $this->formatMenu($child, false))
                ->values()
                ->toArray();
        }

        return $data;
    }
}
