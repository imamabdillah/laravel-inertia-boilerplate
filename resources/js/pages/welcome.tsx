import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    BadgeCheck,
    Building2,
    CheckCircle2,
    ClipboardList,
    FileCheck,
    FileText,
    LayoutDashboard,
    Send,
    ShieldCheck,
    UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dashboard, login, register } from '@/routes';

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

const STEPS = [
    {
        icon: UserPlus,
        title: 'Daftar Akun',
        desc: 'Buat akun mitra dengan email institusi Anda dan verifikasi alamat email.',
    },
    {
        icon: ClipboardList,
        title: 'Lengkapi Profil',
        desc: 'Isi data lembaga dan unggah dokumen persyaratan kerjasama secara digital.',
    },
    {
        icon: Send,
        title: 'Ajukan Verifikasi',
        desc: 'Kirim pengajuan — tim Ditjen GTK akan mereviu profil dan dokumen Anda.',
    },
    {
        icon: BadgeCheck,
        title: 'Kerjasama Aktif',
        desc: 'Setelah terverifikasi, status kerjasama aktif dan dapat dipantau kapan saja.',
    },
];

const MITRA_POINTS = [
    'Pendaftaran dan pengajuan sepenuhnya online',
    'Unggah dokumen persyaratan langsung dari browser',
    'Status pengajuan transparan di setiap tahap',
    'Notifikasi hasil reviu dokumen dan verifikasi',
];

const ADMIN_POINTS = [
    'Reviu pengajuan mitra dalam satu antrean terpusat',
    'Verifikasi atau tolak dokumen dengan catatan',
    'Manajemen pengguna, peran, dan hak akses',
    'Jejak audit lengkap untuk seluruh aktivitas',
];

function StatusPreviewCard() {
    return (
        <div className="relative">
            <div
                className="absolute -inset-4 rounded-3xl bg-blue-500/20 blur-2xl"
                aria-hidden
            />
            <div className="relative rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl backdrop-blur">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                        <p className="text-xs text-slate-400">
                            Pengajuan Kerjasama
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-white">
                            PT Mitra Edukasi Nusantara
                        </p>
                    </div>
                    <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-medium text-amber-400">
                        Menunggu Verifikasi
                    </span>
                </div>

                <ul className="mt-4 space-y-3">
                    {[
                        { label: 'Akun terdaftar', done: true },
                        { label: 'Profil lembaga lengkap', done: true },
                        { label: 'Dokumen persyaratan diunggah', done: true },
                        { label: 'Verifikasi oleh Ditjen GTK', done: false },
                    ].map(({ label, done }) => (
                        <li
                            key={label}
                            className="flex items-center gap-3 text-sm"
                        >
                            <CheckCircle2
                                className={`h-4.5 w-4.5 shrink-0 ${done ? 'text-emerald-400' : 'text-slate-600'}`}
                            />
                            <span
                                className={
                                    done ? 'text-slate-200' : 'text-slate-500'
                                }
                            >
                                {label}
                            </span>
                        </li>
                    ))}
                </ul>

                <div className="mt-5 rounded-lg border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center gap-2.5">
                        <FileText className="h-4 w-4 text-blue-400" />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-slate-200">
                                surat-permohonan-kerjasama.pdf
                            </p>
                            <p className="text-[11px] text-slate-500">
                                Diunggah • 2,4 MB
                            </p>
                        </div>
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                            Diterima
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Sistem Kerjasama GTK" />

            <div className="min-h-screen bg-background text-foreground antialiased">
                {/* Navbar */}
                <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-sm">
                    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700">
                                <BadgeCheck className="h-4.5 w-4.5 text-white" />
                            </div>
                            <div className="leading-tight">
                                <p className="text-sm font-bold tracking-tight">
                                    Sistem Kerjasama GTK
                                </p>
                                <p className="hidden text-[10px] text-muted-foreground sm:block">
                                    Direktorat Jenderal Guru dan Tenaga
                                    Kependidikan
                                </p>
                            </div>
                        </div>

                        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
                            <a
                                href="#alur"
                                className="transition-colors hover:text-foreground"
                            >
                                Alur
                            </a>
                            <a
                                href="#fitur"
                                className="transition-colors hover:text-foreground"
                            >
                                Fitur
                            </a>
                            <a
                                href="#peran"
                                className="transition-colors hover:text-foreground"
                            >
                                Layanan
                            </a>
                        </nav>

                        <div className="flex items-center gap-2">
                            {auth.user ? (
                                <Button asChild size="sm">
                                    <Link href={dashboard()}>Dashboard</Link>
                                </Button>
                            ) : (
                                <>
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href={login()}>Masuk</Link>
                                    </Button>
                                    <Button
                                        asChild
                                        size="sm"
                                        className="bg-blue-700 text-white hover:bg-blue-800"
                                    >
                                        <Link href={register()}>
                                            Daftar Mitra
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Hero */}
                <section className="relative overflow-hidden bg-slate-950 text-white">
                    <div
                        className="pointer-events-none absolute inset-0 opacity-40"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle at 20% 20%, rgba(37,99,235,0.35), transparent 45%), radial-gradient(circle at 80% 70%, rgba(30,64,175,0.3), transparent 45%)',
                        }}
                        aria-hidden
                    />
                    <div
                        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:48px_48px]"
                        aria-hidden
                    />

                    <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:py-28">
                        <div>
                            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-blue-300">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Direktorat Jenderal Guru dan Tenaga Kependidikan
                            </p>
                            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                                Kelola Kerjasama
                                <br />
                                <span className="bg-gradient-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent">
                                    Lebih Cepat & Transparan
                                </span>
                            </h1>
                            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-400">
                                Platform digital pengelolaan kerjasama antara
                                Ditjen GTK dan mitra — pengajuan, unggah
                                dokumen, verifikasi, hingga pemantauan status
                                dalam satu sistem terintegrasi.
                            </p>
                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                {auth.user ? (
                                    <Button
                                        size="lg"
                                        className="bg-blue-600 text-white hover:bg-blue-700"
                                        asChild
                                    >
                                        <Link href={dashboard()}>
                                            Buka Dashboard
                                            <ArrowRight className="ml-1 h-4 w-4" />
                                        </Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            size="lg"
                                            className="bg-blue-600 text-white hover:bg-blue-700"
                                            asChild
                                        >
                                            <Link href={register()}>
                                                Daftar sebagai Mitra
                                                <ArrowRight className="ml-1 h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                                            asChild
                                        >
                                            <Link href={login()}>
                                                Masuk ke Sistem
                                            </Link>
                                        </Button>
                                    </>
                                )}
                            </div>

                            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-8">
                                {[
                                    { value: '100%', label: 'Proses digital' },
                                    { value: '4', label: 'Langkah pengajuan' },
                                    { value: '24/7', label: 'Pantau status' },
                                ].map(({ value, label }) => (
                                    <div key={label}>
                                        <dt className="sr-only">{label}</dt>
                                        <dd className="text-2xl font-bold text-white">
                                            {value}
                                        </dd>
                                        <dd className="mt-1 text-xs text-slate-400">
                                            {label}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </div>

                        <div className="hidden lg:block">
                            <StatusPreviewCard />
                        </div>
                    </div>
                </section>

                {/* Alur */}
                <section
                    id="alur"
                    className="scroll-mt-16 border-b border-border bg-muted/30"
                >
                    <div className="mx-auto max-w-6xl px-6 py-20">
                        <div className="mb-12 text-center">
                            <p className="text-xs font-semibold tracking-[0.2em] text-blue-700 uppercase dark:text-blue-400">
                                Alur Pengajuan
                            </p>
                            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                                Empat langkah menuju kerjasama
                            </h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Proses pengajuan dirancang sederhana —
                                selesaikan seluruhnya secara online
                            </p>
                        </div>

                        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {STEPS.map(({ icon: Icon, title, desc }, i) => (
                                <li
                                    key={title}
                                    className="relative rounded-xl border border-border bg-card p-6"
                                >
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-700/10 dark:bg-blue-400/10">
                                            <Icon className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                                        </div>
                                        <span className="text-3xl font-bold text-border">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                    </div>
                                    <h3 className="mb-1.5 font-semibold">
                                        {title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        {desc}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                {/* Features */}
                <section id="fitur" className="scroll-mt-16">
                    <div className="mx-auto max-w-6xl px-6 py-20">
                        <div className="mb-12 text-center">
                            <p className="text-xs font-semibold tracking-[0.2em] text-blue-700 uppercase dark:text-blue-400">
                                Fitur Utama
                            </p>
                            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                                Satu platform untuk seluruh kebutuhan
                            </h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Seluruh kebutuhan pengelolaan kerjasama dalam
                                satu platform terintegrasi
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {FEATURES.map(({ icon: Icon, title, desc }) => (
                                <div
                                    key={title}
                                    className="group rounded-xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:hover:border-blue-800"
                                >
                                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background transition-colors group-hover:border-blue-300 group-hover:bg-blue-50 dark:group-hover:border-blue-800 dark:group-hover:bg-blue-950/40">
                                        <Icon className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                                    </div>
                                    <h3 className="mb-1.5 font-semibold">
                                        {title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        {desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Peran */}
                <section
                    id="peran"
                    className="scroll-mt-16 border-y border-border bg-muted/30"
                >
                    <div className="mx-auto max-w-6xl px-6 py-20">
                        <div className="mb-12 text-center">
                            <p className="text-xs font-semibold tracking-[0.2em] text-blue-700 uppercase dark:text-blue-400">
                                Layanan
                            </p>
                            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                                Dirancang untuk dua sisi
                            </h2>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="rounded-xl border border-border bg-card p-8">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-700/10 dark:bg-blue-400/10">
                                        <Building2 className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">
                                            Untuk Mitra
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            Lembaga & institusi calon mitra
                                        </p>
                                    </div>
                                </div>
                                <ul className="space-y-3">
                                    {MITRA_POINTS.map((point) => (
                                        <li
                                            key={point}
                                            className="flex items-start gap-2.5 text-sm"
                                        >
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-700 dark:text-blue-400" />
                                            <span className="text-muted-foreground">
                                                {point}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="rounded-xl border border-border bg-card p-8">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-700/10 dark:bg-blue-400/10">
                                        <ShieldCheck className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">
                                            Untuk Pengelola
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            Tim verifikasi Ditjen GTK
                                        </p>
                                    </div>
                                </div>
                                <ul className="space-y-3">
                                    {ADMIN_POINTS.map((point) => (
                                        <li
                                            key={point}
                                            className="flex items-start gap-2.5 text-sm"
                                        >
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-700 dark:text-blue-400" />
                                            <span className="text-muted-foreground">
                                                {point}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="bg-slate-950 text-white">
                    <div className="mx-auto max-w-4xl px-6 py-20 text-center">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Siap menjalin kerjasama?
                        </h2>
                        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-slate-400">
                            Daftarkan lembaga Anda sekarang dan ajukan kerjasama
                            dengan Ditjen GTK sepenuhnya secara online.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                            {auth.user ? (
                                <Button
                                    size="lg"
                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                    asChild
                                >
                                    <Link href={dashboard()}>
                                        Buka Dashboard
                                        <ArrowRight className="ml-1 h-4 w-4" />
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        size="lg"
                                        className="bg-blue-600 text-white hover:bg-blue-700"
                                        asChild
                                    >
                                        <Link href={register()}>
                                            Daftar sebagai Mitra
                                            <ArrowRight className="ml-1 h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                                        asChild
                                    >
                                        <Link href={login()}>
                                            Sudah punya akun? Masuk
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-border bg-muted/30">
                    <div className="mx-auto max-w-6xl px-6 py-12">
                        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700">
                                        <BadgeCheck className="h-4.5 w-4.5 text-white" />
                                    </div>
                                    <span className="text-sm font-bold tracking-tight">
                                        Sistem Kerjasama GTK
                                    </span>
                                </div>
                                <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                                    Platform digital pengelolaan kerjasama
                                    Direktorat Jenderal Guru dan Tenaga
                                    Kependidikan.
                                </p>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold">
                                    Navigasi
                                </h4>
                                <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                                    <li>
                                        <a
                                            href="#alur"
                                            className="transition-colors hover:text-foreground"
                                        >
                                            Alur Pengajuan
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#fitur"
                                            className="transition-colors hover:text-foreground"
                                        >
                                            Fitur Utama
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#peran"
                                            className="transition-colors hover:text-foreground"
                                        >
                                            Layanan
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold">Akses</h4>
                                <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                                    <li>
                                        <Link
                                            href={login()}
                                            className="transition-colors hover:text-foreground"
                                        >
                                            Masuk ke Sistem
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href={register()}
                                            className="transition-colors hover:text-foreground"
                                        >
                                            Daftar sebagai Mitra
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-border pt-6 sm:flex-row">
                            <span className="text-xs text-muted-foreground">
                                © {new Date().getFullYear()} Sistem Kerjasama
                                GTK
                            </span>
                            <span className="text-xs text-muted-foreground">
                                Direktorat Jenderal Guru dan Tenaga Kependidikan
                            </span>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
