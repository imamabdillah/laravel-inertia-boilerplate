import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    KeyRound,
    LayoutDashboard,
    Menu,
    Moon,
    ShieldCheck,
    Sun,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';
import { dashboard, login, register } from '@/routes';

const FEATURES = [
    {
        icon: Users,
        title: 'User Management',
        desc: 'CRUD user lengkap dengan toggle status aktif, reset password, dan assignment role.',
    },
    {
        icon: ShieldCheck,
        title: 'Role & Permission',
        desc: 'Berbasis Spatie Laravel Permission. Matrix checklist permission per role yang intuitif.',
    },
    {
        icon: Menu,
        title: 'Dynamic Menus',
        desc: 'Menu sidebar diambil dari database. Drag-reorder, parent-child, icon, dan permission gate.',
    },
    {
        icon: Activity,
        title: 'Activity Log',
        desc: 'Semua aksi create/update/delete terekam otomatis via Spatie Activitylog.',
    },
    {
        icon: KeyRound,
        title: 'Settings',
        desc: 'Key-value settings yang tersimpan di database, dikelompokkan per group.',
    },
    {
        icon: LayoutDashboard,
        title: 'Admin Layout',
        desc: 'Sidebar collapsible, breadcrumb, dark/light mode, dan responsive siap pakai.',
    },
];

const STACK = [
    { name: 'Laravel 13', color: 'text-red-500 bg-red-500/10 border-red-500/20' },
    { name: 'PHP 8.3',    color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
    { name: 'Inertia v3', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
    { name: 'React 19',   color: 'text-sky-500 bg-sky-500/10 border-sky-500/20' },
    { name: 'TypeScript', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    { name: 'Tailwind v4', color: 'text-teal-500 bg-teal-500/10 border-teal-500/20' },
    { name: 'shadcn/ui',  color: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20' },
    { name: 'PostgreSQL', color: 'text-blue-700 bg-blue-700/10 border-blue-700/20' },
];

export default function Welcome() {
    const { auth } = usePage().props;
    const { resolvedAppearance, updateAppearance } = useAppearance();

    return (
        <>
            <Head title="Welcome" />

            <div className="min-h-screen bg-background text-foreground antialiased">
                {/* Navbar */}
                <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
                    <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground">
                                <div className="h-3.5 w-3.5 rounded-sm bg-background" />
                            </div>
                            <span className="text-sm font-semibold">Admin Boilerplate</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark')}
                                suppressHydrationWarning
                            >
                                <Sun className="h-4 w-4 hidden dark:block" suppressHydrationWarning />
                                <Moon className="h-4 w-4 dark:hidden" suppressHydrationWarning />
                            </Button>

                            {auth.user ? (
                                <Button asChild size="sm">
                                    <Link href={dashboard()}>Dashboard</Link>
                                </Button>
                            ) : (
                                <>
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={login()}>Log in</Link>
                                    </Button>
                                    <Button size="sm" asChild>
                                        <Link href={register()}>Get started</Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Hero */}
                <section className="mx-auto max-w-6xl px-6 pt-24 pb-16 text-center">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        Laravel 13 + Inertia.js v3 + React 19
                    </div>

                    <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                        Admin panel boilerplate
                        <span className="text-muted-foreground"> siap pakai</span>
                    </h1>

                    <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
                        Fondasi solid untuk membangun aplikasi admin Laravel.
                        Auth, roles, permissions, menus, activity log — semua sudah ada.
                        Fokus ke logika bisnis, bukan setup.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                        {auth.user ? (
                            <Button size="lg" asChild>
                                <Link href={dashboard()}>Buka Dashboard</Link>
                            </Button>
                        ) : (
                            <>
                                <Button size="lg" asChild>
                                    <Link href={register()}>Mulai sekarang</Link>
                                </Button>
                                <Button size="lg" variant="outline" asChild>
                                    <Link href={login()}>Log in</Link>
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Stack badges */}
                    <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
                        {STACK.map((s) => (
                            <span
                                key={s.name}
                                className={`rounded-full border px-3 py-1 text-xs font-medium ${s.color}`}
                            >
                                {s.name}
                            </span>
                        ))}
                    </div>
                </section>

                {/* Features */}
                <section className="mx-auto max-w-6xl px-6 pb-24">
                    <div className="mb-10 text-center">
                        <h2 className="text-2xl font-semibold tracking-tight">Fitur yang sudah ada</h2>
                        <p className="mt-2 text-sm text-muted-foreground">Semua modul sudah terintegrasi dan siap dikustomisasi</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {FEATURES.map(({ icon: Icon, title, desc }) => (
                            <div
                                key={title}
                                className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-foreground/20 hover:bg-accent/30"
                            >
                                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background">
                                    <Icon className="h-5 w-5 text-foreground" />
                                </div>
                                <h3 className="mb-1.5 font-semibold">{title}</h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-border bg-muted/30">
                    <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
                        <span className="text-xs text-muted-foreground">
                            Admin Boilerplate — reusable, tanpa logika bisnis spesifik.
                        </span>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>Laravel 13</span>
                            <span>·</span>
                            <span>PHP 8.3</span>
                            <span>·</span>
                            <span>PostgreSQL 16</span>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
