import { Link, usePage } from '@inertiajs/react';
import { Check } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

const FEATURES = [
    'Role & Permission management (Spatie)',
    'Dynamic menu system from database',
    'Activity logging & audit trail',
    'User management with status control',
    'shadcn/ui components + Tailwind v4',
    'Dark & light mode support',
];

const STACK = ['Laravel 13', 'Inertia v3', 'React 19', 'TypeScript'];

export default function AuthSplitLayout({ children, title, description }: AuthLayoutProps) {
    const { name } = usePage().props as { name: string };

    return (
        <div className="grid min-h-dvh lg:grid-cols-2">
            {/* Left branding panel */}
            <div className="relative hidden flex-col justify-between bg-zinc-950 p-10 text-white lg:flex">
                {/* Grid pattern overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                        backgroundSize: '40px 40px',
                    }}
                />

                {/* Logo */}
                <Link href={home()} className="relative z-10 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                        <AppLogoIcon className="size-5 fill-current text-white" />
                    </div>
                    <span className="font-semibold">{name ?? 'Admin Panel'}</span>
                </Link>

                {/* Main content */}
                <div className="relative z-10 flex flex-col gap-8">
                    <div>
                        <h2 className="text-3xl font-bold leading-tight tracking-tight">
                            Admin Boilerplate<br />
                            <span className="text-white/50">siap pakai.</span>
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-white/60">
                            Fondasi solid untuk aplikasi admin Laravel —
                            dengan auth, roles, permission, dan menu sudah terkonfigurasi.
                        </p>
                    </div>

                    <ul className="flex flex-col gap-2.5">
                        {FEATURES.map((f) => (
                            <li key={f} className="flex items-center gap-3 text-sm text-white/80">
                                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10">
                                    <Check className="h-3 w-3 text-white" />
                                </div>
                                {f}
                            </li>
                        ))}
                    </ul>

                    <div className="flex flex-wrap gap-2">
                        {STACK.map((s) => (
                            <span
                                key={s}
                                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60"
                            >
                                {s}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <p className="relative z-10 text-xs text-white/30">
                    Base boilerplate — tidak ada logika bisnis spesifik.
                </p>
            </div>

            {/* Right form panel */}
            <div className="flex items-center justify-center bg-background p-8">
                <div className="w-full max-w-sm">
                    {/* Mobile logo */}
                    <Link href={home()} className="mb-8 flex items-center justify-center gap-2 lg:hidden">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
                            <AppLogoIcon className="size-5 fill-current text-background" />
                        </div>
                        <span className="font-semibold">{name ?? 'Admin Panel'}</span>
                    </Link>

                    <div className="mb-6 flex flex-col gap-1.5">
                        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
