<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSettingRequest;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function index(): Response
    {
        $settings = Setting::orderBy('group')->orderBy('key')->get();

        $grouped = $settings->groupBy('group')
            ->map(fn ($items, $group) => [
                'group'    => $group,
                'settings' => $items->map(fn (Setting $s) => [
                    'key'   => $s->key,
                    'value' => $s->value,
                    'group' => $s->group,
                ])->values(),
            ])
            ->values();

        return Inertia::render('admin/settings/index', [
            'groups' => $grouped,
        ]);
    }

    public function update(UpdateSettingRequest $request): RedirectResponse
    {
        foreach ($request->settings as $item) {
            Setting::where('key', $item['key'])->update(['value' => $item['value'] ?? null]);
        }

        activity()->causedBy(auth()->user())->log('settings_updated');

        return back()->with('success', 'Settings berhasil disimpan.');
    }
}
