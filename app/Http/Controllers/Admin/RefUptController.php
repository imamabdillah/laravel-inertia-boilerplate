<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRefUptRequest;
use App\Http\Requests\Admin\UpdateRefUptRequest;
use App\Http\Resources\RefUptResource;
use App\Models\Mitra;
use App\Models\RefUpt;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class RefUptController extends Controller
{
    public function index(Request $request): Response
    {
        $upts = RefUpt::query()
            ->when($request->search, fn ($q, $search) => $q->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('code', 'ilike', "%{$search}%");
            }))
            ->when($request->status !== null && $request->status !== '', fn ($q) => $q->where('is_active', $request->status === '1'))
            ->orderBy('order')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/ref-upt/index', [
            'upts' => RefUptResource::collection($upts),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function store(StoreRefUptRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['code'] = $this->generateCode($data['name']);
        $data['order'] ??= (RefUpt::max('order') ?? 0) + 1;

        $upt = RefUpt::create($data);

        activity()->causedBy(auth()->user())->on($upt)->log('created');

        Inertia::flash('toast', ['type' => 'success', 'message' => "UPT \"{$upt->name}\" berhasil ditambahkan."]);

        return back();
    }

    public function update(UpdateRefUptRequest $request, RefUpt $refUpt): RedirectResponse
    {
        // code sengaja tidak ikut diubah — code adalah value yang tersimpan di mitras.upt
        $refUpt->update($request->validated());

        activity()->causedBy(auth()->user())->on($refUpt)->log('updated');

        Inertia::flash('toast', ['type' => 'success', 'message' => "UPT \"{$refUpt->name}\" berhasil diperbarui."]);

        return back();
    }

    public function destroy(RefUpt $refUpt): RedirectResponse
    {
        if (Mitra::whereJsonContains('upt', $refUpt->code)->exists()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'UPT masih dipakai di profil mitra. Nonaktifkan saja jika tidak ingin muncul di pilihan.']);

            return back();
        }

        activity()->causedBy(auth()->user())->on($refUpt)->log('deleted');

        $refUpt->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'UPT berhasil dihapus.']);

        return back();
    }

    public function toggleActive(RefUpt $refUpt): RedirectResponse
    {
        $refUpt->update(['is_active' => ! $refUpt->is_active]);

        activity()->causedBy(auth()->user())->on($refUpt)
            ->log($refUpt->is_active ? 'activated' : 'deactivated');

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Status UPT berhasil diubah.']);

        return back();
    }

    private function generateCode(string $name): string
    {
        $base = Str::slug($name, '_');
        $code = $base;
        $i = 2;

        while (RefUpt::where('code', $code)->exists()) {
            $code = "{$base}_{$i}";
            $i++;
        }

        return $code;
    }
}
