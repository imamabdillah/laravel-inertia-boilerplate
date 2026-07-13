<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRefDirektoratRequest;
use App\Http\Requests\Admin\UpdateRefDirektoratRequest;
use App\Http\Resources\RefDirektoratResource;
use App\Models\Audiensi;
use App\Models\RefDirektorat;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class RefDirektoratController extends Controller
{
    public function index(Request $request): Response
    {
        $direktorats = RefDirektorat::query()
            ->when($request->search, fn ($q, $search) => $q->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('code', 'ilike', "%{$search}%");
            }))
            ->when($request->status !== null && $request->status !== '', fn ($q) => $q->where('is_active', $request->status === '1'))
            ->orderBy('order')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/ref-direktorat/index', [
            'direktorats' => RefDirektoratResource::collection($direktorats),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function store(StoreRefDirektoratRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['code'] = $this->generateCode($data['name']);
        $data['order'] ??= (RefDirektorat::max('order') ?? 0) + 1;

        $direktorat = RefDirektorat::create($data);

        activity()->causedBy(auth()->user())->on($direktorat)->log('created');

        Inertia::flash('toast', ['type' => 'success', 'message' => "Direktorat \"{$direktorat->name}\" berhasil ditambahkan."]);

        return back();
    }

    public function update(UpdateRefDirektoratRequest $request, RefDirektorat $refDirektorat): RedirectResponse
    {
        // code sengaja tidak ikut diubah — code adalah value yang tersimpan di audiensis.pelaksana
        $refDirektorat->update($request->validated());

        activity()->causedBy(auth()->user())->on($refDirektorat)->log('updated');

        Inertia::flash('toast', ['type' => 'success', 'message' => "Direktorat \"{$refDirektorat->name}\" berhasil diperbarui."]);

        return back();
    }

    public function destroy(RefDirektorat $refDirektorat): RedirectResponse
    {
        if (Audiensi::where('pelaksana', $refDirektorat->code)->exists()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Direktorat masih dipakai sebagai pelaksana audiensi. Nonaktifkan saja jika tidak ingin muncul di pilihan.']);

            return back();
        }

        activity()->causedBy(auth()->user())->on($refDirektorat)->log('deleted');

        $refDirektorat->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Direktorat berhasil dihapus.']);

        return back();
    }

    public function toggleActive(RefDirektorat $refDirektorat): RedirectResponse
    {
        $refDirektorat->update(['is_active' => ! $refDirektorat->is_active]);

        activity()->causedBy(auth()->user())->on($refDirektorat)
            ->log($refDirektorat->is_active ? 'activated' : 'deactivated');

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Status Direktorat berhasil diubah.']);

        return back();
    }

    private function generateCode(string $name): string
    {
        $base = Str::slug($name, '_');
        $code = $base;
        $i = 2;

        while (RefDirektorat::where('code', $code)->exists()) {
            $code = "{$base}_{$i}";
            $i++;
        }

        return $code;
    }
}
