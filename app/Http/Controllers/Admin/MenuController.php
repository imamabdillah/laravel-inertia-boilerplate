<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreMenuRequest;
use App\Http\Requests\Admin\UpdateMenuRequest;
use App\Models\Menu;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;

class MenuController extends Controller
{
    public function index(): Response
    {
        $menus = Menu::with('children')
            ->whereNull('parent_id')
            ->orderBy('order')
            ->get()
            ->map(fn (Menu $m) => $this->formatMenu($m, true));

        $parents = Menu::whereNull('parent_id')
            ->orderBy('order')
            ->get(['id', 'name']);

        return Inertia::render('admin/menus/index', [
            'menus'   => $menus,
            'parents' => $parents,
        ]);
    }

    public function store(StoreMenuRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['order'] ??= Menu::where('parent_id', $data['parent_id'] ?? null)->max('order') + 1;

        $menu = Menu::create($data);

        $this->syncPermissionFromMenu($data['permission'] ?? null);

        activity()->causedBy(auth()->user())->on($menu)->log('created');

        return back()->with('success', "Menu \"{$menu->name}\" berhasil dibuat.");
    }

    public function update(UpdateMenuRequest $request, Menu $menu): RedirectResponse
    {
        $data = $request->validated();
        $menu->update($data);

        $this->syncPermissionFromMenu($data['permission'] ?? null);

        activity()->causedBy(auth()->user())->on($menu)->log('updated');

        return back()->with('success', "Menu \"{$menu->name}\" berhasil diperbarui.");
    }

    private function syncPermissionFromMenu(?string $permission): void
    {
        if (filled($permission)) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }
    }

    public function destroy(Menu $menu): RedirectResponse
    {
        if ($menu->children()->count() > 0) {
            return back()->with('error', 'Menu masih memiliki submenu. Hapus submenu terlebih dahulu.');
        }

        activity()->causedBy(auth()->user())->on($menu)->log('deleted');

        $menu->delete();

        return back()->with('success', 'Menu berhasil dihapus.');
    }

    public function toggleActive(Menu $menu): RedirectResponse
    {
        $menu->update(['is_active' => ! $menu->is_active]);

        activity()->causedBy(auth()->user())->on($menu)
            ->log($menu->is_active ? 'activated' : 'deactivated');

        return back()->with('success', 'Status menu berhasil diubah.');
    }

    public function reorder(Request $request): RedirectResponse
    {
        $request->validate([
            'items'        => ['required', 'array'],
            'items.*.id'   => ['required', 'integer', 'exists:menus,id'],
            'items.*.order' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($request->items as $item) {
            Menu::where('id', $item['id'])->update(['order' => $item['order']]);
        }

        return back()->with('success', 'Urutan menu berhasil disimpan.');
    }

    private function formatMenu(Menu $menu, bool $withChildren = false): array
    {
        $data = [
            'id'         => $menu->id,
            'name'       => $menu->name,
            'icon'       => $menu->icon,
            'route'      => $menu->route,
            'permission' => $menu->permission,
            'parent_id'  => $menu->parent_id,
            'order'      => $menu->order,
            'is_active'  => $menu->is_active,
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
