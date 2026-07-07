import { Head, Link, usePage } from '@inertiajs/react';
import { Activity, Building2, FileCheck, FileText, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dashboard, login } from '@/routes';

const FEATURES = [
    {
        icon: FileText,
        title: 'Pengelolaan Dokumen',
        desc: 'Kelola dokumen kerjasama secara digital — pengajuan, verifikasi, hingga arsip tersimpan terpusat.',
    },
    {
        icon: Building2,
        title: 'Data Mitra Terpusat',
        desc: 'Profil dan informasi mitra tersimpan terstruktur, mudah diakses dan selalu mutakhir.',
    },
    {
        icon: FileCheck,
        title: 'Verifikasi & Persetujuan',
        desc: 'Alur review dan persetujuan dokumen yang jelas dengan status yang dapat dipantau setiap tahap.',
    },
    {
        icon: ShieldCheck,
        title: 'Keamanan & Hak Akses',
        desc: 'Kontrol akses berbasis peran — admin dan mitra memiliki kewenangan yang terpisah dan aman.',
    },
    {
        icon: LayoutDashboard,
        title: 'Dashboard Monitoring',
        desc: 'Pantau status dan progres kerjasama secara real-time melalui dashboard yang informatif.',
    },
    {
        icon: Activity,
        title: 'Jejak Audit',
        desc: 'Seluruh aktivitas terekam otomatis untuk menjamin transparansi dan akuntabilitas penuh.',
    },
];

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Sistem Kerjasama GTK" />

            <div className="min-h-screen bg-background text-foreground antialiased">
                {/* Navbar */}
                <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-sm">
                    <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-900">
                                <div className="h-3.5 w-3.5 rounded-sm bg-white" />
                            </div>
                            <span className="text-sm font-semibold tracking-tight">Sistem Kerjasama</span>
                        </div>

                        {auth.user ? (
                            <Button asChild size="sm">
                                <Link href={dashboard()}>Dashboard</Link>
                            </Button>
                        ) : (
                            <Button asChild size="sm">
                                <Link href={login()}>Masuk</Link>
                            </Button>
                        )}
                    </div>
                </header>

                {/* Hero */}
                <section className="bg-slate-950 py-24 text-white">
                    <div className="mx-auto max-w-4xl px-6 text-center">
                        <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-400">
                            Direktorat Jenderal Guru dan Tenaga Kependidikan
                        </p>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                            Sistem Pengelolaan
                            <br />
                            <span className="text-blue-400">Kerjasama GTK</span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-400">
                            Platform digital untuk mengelola kerjasama antara Ditjen GTK dan mitra secara
                            efisien — mulai dari pengajuan, verifikasi, hingga pemantauan perjanjian.
                        </p>
                        <div className="mt-8">
                            {auth.user ? (
                                <Button size="lg" asChild>
                                    <Link href={dashboard()}>Buka Dashboard</Link>
                                </Button>
                            ) : (
                                <Button
                                    size="lg"
                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                    asChild
                                >
                                    <Link href={login()}>Masuk ke Sistem</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="mx-auto max-w-6xl px-6 py-20">
                    <div className="mb-12 text-center">
                        <h2 className="text-2xl font-semibold tracking-tight">Fitur Utama Sistem</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Seluruh kebutuhan pengelolaan kerjasama dalam satu platform terintegrasi
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {FEATURES.map(({ icon: Icon, title, desc }) => (
                            <div
                                key={title}
                                className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-blue-200 hover:bg-blue-50/30 dark:hover:border-blue-900 dark:hover:bg-blue-950/20"
                            >
                                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background">
                                    <Icon className="h-5 w-5 text-blue-700 dark:text-blue-400" />
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
                            © {new Date().getFullYear()} Sistem Kerjasama GTK
                        </span>
                        <span className="text-xs text-muted-foreground">
                            Direktorat Jenderal Guru dan Tenaga Kependidikan
                        </span>
                    </div>
                </footer>
            </div>
        </>
    );
}
