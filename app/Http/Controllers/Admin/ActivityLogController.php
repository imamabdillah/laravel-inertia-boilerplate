<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        $paginator = Activity::with(['causer'])
            ->when($request->search, fn ($q, $s) => $q->where('description', 'ilike', "%{$s}%"))
            ->when($request->event, fn ($q, $e) => $q->where('description', $e))
            ->when($request->user_id, fn ($q, $uid) => $q->where('causer_id', $uid)->where('causer_type', User::class))
            ->when($request->date_from, fn ($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($request->date_to, fn ($q, $d) => $q->whereDate('created_at', '<=', $d))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        $items = collect($paginator->items())->map(fn (Activity $log) => [
            'id'           => $log->id,
            'description'  => $log->description,
            'event'        => $log->description,
            'subject_type' => $log->subject_type ? class_basename($log->subject_type) : null,
            'subject_id'   => $log->subject_id,
            'causer_name'  => $log->causer?->name ?? 'System',
            'causer_email' => $log->causer?->email,
            'created_at'   => $log->created_at?->toDateTimeString(),
        ]);

        return Inertia::render('admin/activity-log/index', [
            'logs' => [
                'data'  => $items,
                'links' => [
                    'first' => $paginator->url(1),
                    'last'  => $paginator->url($paginator->lastPage()),
                    'prev'  => $paginator->previousPageUrl(),
                    'next'  => $paginator->nextPageUrl(),
                ],
                'meta'  => [
                    'current_page' => $paginator->currentPage(),
                    'from'         => $paginator->firstItem(),
                    'last_page'    => $paginator->lastPage(),
                    'per_page'     => $paginator->perPage(),
                    'to'           => $paginator->lastItem(),
                    'total'        => $paginator->total(),
                    'links'        => $paginator->linkCollection()->toArray(),
                ],
            ],
            'users'   => User::orderBy('name')->get()->map(fn (User $u) => ['id' => $u->id, 'name' => $u->name]),
            'filters' => $request->only(['search', 'event', 'user_id', 'date_from', 'date_to']),
        ]);
    }
}
