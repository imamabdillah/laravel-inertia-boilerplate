import { Link, usePage } from '@inertiajs/react';
import { Activity, KeyRound, LayoutDashboard, Menu, ShieldCheck, Users } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
];

type Stats = {
    users: number;
    roles: number;
    permissions: number;
    menus: number;
    activities: number;
};

type RecentActivity = {
    id: number;
    description: string;
    subject_type: string | null;
    causer_name: string;
    created_at: string;
};

type Props = {
    stats: Stats;
    recentActivities: RecentActivity[];
};

const EVENT_COLORS: Record<string, string> = {
    created:           'bg-green-500/10 text-green-600 dark:text-green-400',
    updated:           'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    deleted:           'bg-red-500/10 text-red-600 dark:text-red-400',
    permissions_synced: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    settings_updated:  'bg-amber-500/10 text-amber-600 dark:text-amber-400',
};

function eventColor(desc: string) {
    for (const [key, cls] of Object.entries(EVENT_COLORS)) {
        if (desc.includes(key)) return cls;
    }
    return 'bg-muted text-muted-foreground';
}

export default function Dashboard({ stats, recentActivities }: Props) {
    const { auth } = usePage().props;

    const statCards = [
        { title: 'Total Users',       icon: Users,         value: stats.users,       href: '/admin/users',       color: 'text-blue-500' },
        { title: 'Roles',             icon: ShieldCheck,   value: stats.roles,       href: '/admin/roles',       color: 'text-purple-500' },
        { title: 'Permissions',       icon: KeyRound,      value: stats.permissions, href: '/admin/permissions', color: 'text-amber-500' },
        { title: 'Menu Items',        icon: Menu,          value: stats.menus,       href: '/admin/menus',       color: 'text-green-500' },
        { title: 'Activity Logs',     icon: Activity,      value: stats.activities,  href: '/admin/activity-log', color: 'text-rose-500' },
    ];

    const quickActions = [
        { label: 'Add User',       href: '/admin/users/create',  variant: 'default' as const },
        { label: 'Manage Roles',   href: '/admin/roles',         variant: 'outline' as const },
        { label: 'Config Menus',   href: '/admin/menus',         variant: 'outline' as const },
        { label: 'Activity Log',   href: '/admin/activity-log',  variant: 'outline' as const },
    ];

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Welcome */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground text-sm">
                            Welcome back, <span className="font-medium text-foreground">{auth.user?.name}</span>
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {quickActions.map((a) => (
                            <Button key={a.label} variant={a.variant} size="sm" asChild>
                                <Link href={a.href}>{a.label}</Link>
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {statCards.map(({ title, icon: Icon, value, href, color }) => (
                        <Link key={title} href={href} className="group">
                            <Card className="transition-shadow group-hover:shadow-md">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                                    <Icon className={`h-4 w-4 ${color}`} />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{value.toLocaleString()}</div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* Recent Activity */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin/activity-log">View all</Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        {recentActivities.length === 0 ? (
                            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                                No activity yet.
                            </div>
                        ) : (
                            <div className="divide-y">
                                {recentActivities.map((a) => (
                                    <div key={a.id} className="flex items-center gap-4 px-6 py-3">
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${eventColor(a.description)}`}>
                                            {a.description}
                                        </span>
                                        {a.subject_type && (
                                            <span className="text-sm text-muted-foreground">{a.subject_type}</span>
                                        )}
                                        <span className="ml-auto text-xs text-muted-foreground">
                                            {a.causer_name} · {a.created_at}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* System Info */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <LayoutDashboard className="h-4 w-4" />
                                Stack
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-1.5">
                            {['Laravel 13', 'PHP 8.3', 'Inertia v3', 'React 19', 'TypeScript', 'Tailwind v4'].map((t) => (
                                <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                            ))}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <ShieldCheck className="h-4 w-4" />
                                Packages
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-1.5">
                            {['spatie/permission', 'spatie/activitylog', 'spatie/medialibrary', 'shadcn/ui'].map((t) => (
                                <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                            ))}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Users className="h-4 w-4" />
                                Default Roles
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-1.5">
                            {['super_admin', 'admin'].map((r) => (
                                <Badge key={r} className="text-xs">{r}</Badge>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
