<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('admin/dashboard', [
            'stats' => [
                'users' => User::count(),
                'roles' => Role::count(),
                'permissions' => Permission::count(),
                'menus' => Menu::count(),
                'activities' => Activity::count(),
            ],
            'recentActivities' => Activity::with('causer')
                ->latest()
                ->take(8)
                ->get()
                ->map(fn (Activity $a) => [
                    'id' => $a->id,
                    'description' => $a->description,
                    'subject_type' => $a->subject_type ? class_basename($a->subject_type) : null,
                    'causer_name' => $a->causer?->name ?? 'System',
                    'created_at' => $a->created_at->diffForHumans(),
                ]),
        ]);
    }
}
