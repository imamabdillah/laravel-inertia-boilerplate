import { Link, usePage } from '@inertiajs/react';
import { Check } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

const FEATURES = [
    'Pengelolaan dokumen kerjasama digital',
    'Verifikasi & persetujuan multi-tahap',
    'Data mitra terpusat dan terstruktur',
    'Monitoring status perjanjian real-time',
    'Jejak audit dan riwayat aktivitas',
    'Kontrol akses berbasis peran',
];

export default function AuthSplitLayout({ children, title, description }: AuthLayoutProps) {
    const { name } = usePage().props as { name: string };

    return (
        <div className="grid min-h-dvh lg:grid-cols-2">
            {/* Left branding panel */}
            <div className="relative hidden flex-col justify-between bg-slate-950 p-10 text-white lg:flex">
                {/* Subtle diagonal grid */}
                <div
                    className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                        backgroundSize: '48px 48px',
                    }}
                />

                {/* Logo */}
                <Link href={home()} className="relative z-10 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                        <AppLogoIcon className="size-5 fill-current text-white" />
                    </div>
                    <span className="font-semibold">{name ?? 'Sistem Kerjasama'}</span>
                </Link>

                {/* Main content */}
                <div className="relative z-10 flex flex-col gap-8">
                    <div>
                        <h2 className="text-3xl font-bold leading-tight tracking-tight">
                            Sistem Kerjasama
                            <br />
                            <span className="text-blue-400">GTK.</span>
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-white/60">
                            Platform digital pengelolaan kerjasama Direktorat Jenderal
                            Guru dan Tenaga Kependidikan dengan mitra.
                        </p>
                    </div>

                    <ul className="flex flex-col gap-2.5">
                        {FEATURES.map((f) => (
                            <li key={f} className="flex items-center gap-3 text-sm text-white/80">
                                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600/20">
                                    <Check className="h-3 w-3 text-blue-400" />
                                </div>
                                {f}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Footer */}
                <p className="relative z-10 text-xs text-white/25">
                    Ditjen GTK — Kementerian Pendidikan Dasar dan Menengah
                </p>
            </div>

            {/* Right form panel */}
            <div className="flex items-center justify-center bg-background p-8">
                <div className="w-full max-w-sm">
                    {/* Mobile logo */}
                    <Link href={home()} className="mb-8 flex items-center justify-center gap-2 lg:hidden">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-900">
                            <AppLogoIcon className="size-5 fill-current text-white" />
                        </div>
                        <span className="font-semibold">{name ?? 'Sistem Kerjasama'}</span>
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
