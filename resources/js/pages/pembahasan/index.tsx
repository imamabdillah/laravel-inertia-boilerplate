import { Link, router, useForm } from '@inertiajs/react';
import { CalendarCheck, CheckCircle2, Eye, XCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import pembahasanRoutes from '@/routes/pembahasan';
import type { BreadcrumbItem, PaginatedData, Pembahasan } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pembahasan', href: pembahasanRoutes.index().url },
];

type Props = {
    pembahasans: PaginatedData<Pembahasan>;
    filters: { search?: string; status?: string; tahap?: string };
    tahap_labels: Record<string, string>;
    can_monitor: boolean;
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
    berjalan: {
        label: 'Berjalan',
        className:
            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    },
    selesai: {
        label: 'Selesai',
        className:
            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    },
    dibatalkan: {
        label: 'Dibatalkan',
        className:
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    },
};

const STATUS_OPTIONS = [
    { value: 'berjalan', label: 'Berjalan' },
    { value: 'selesai', label: 'Selesai' },
    { value: 'dibatalkan', label: 'Dibatalkan' },
];

export default function PembahasanIndex({
    pembahasans,
    filters,
    tahap_labels,
    can_monitor,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [advanceTarget, setAdvanceTarget] = useState<Pembahasan | null>(
        null,
    );
    const [batalTarget, setBatalTarget] = useState<Pembahasan | null>(null);

    const advanceForm = useForm({
        catatan: '',
        ruang_lingkup: '',
        rencana_kerja: '',
        nomor_pks: '',
        tanggal_tandatangan: '',
    });
    const batalForm = useForm({ catatan: '' });

    const applyFilters = useCallback(
        (overrides: Record<string, string | undefined>) => {
            router.get(
                pembahasanRoutes.index().url,
                {
                    search: filters.search,
                    status: filters.status,
                    tahap: filters.tahap,
                    ...overrides,
                },
                { preserveState: true, replace: true },
            );
        },
        [filters],
    );

    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            if (search !== (filters.search ?? '')) {
                applyFilters({ search: search || undefined, page: undefined });
            }
        }, 400);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [search]);

    const openAdvance = (p: Pembahasan) => {
        setAdvanceTarget(p);
        advanceForm.setData({
            catatan: '',
            ruang_lingkup: p.ruang_lingkup ?? '',
            rencana_kerja: p.rencana_kerja ?? '',
            nomor_pks: p.nomor_pks ?? '',
            tanggal_tandatangan: p.tanggal_tandatangan ?? '',
        });
    };

    const submitAdvance = () => {
        if (!advanceTarget) {
            return;
        }

        advanceForm.patch(pembahasanRoutes.advance(advanceTarget.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                setAdvanceTarget(null);
                advanceForm.reset();
            },
        });
    };

    const openBatal = (p: Pembahasan) => {
        setBatalTarget(p);
        batalForm.setData('catatan', '');
    };

    const submitBatal = () => {
        if (!batalTarget) {
            return;
        }

        batalForm.post(pembahasanRoutes.batal(batalTarget.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                setBatalTarget(null);
                batalForm.reset();
            },
        });
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold">Pembahasan</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {can_monitor
                            ? 'Monitoring seluruh pembahasan kerja sama (Setditjen).'
                            : 'Pembahasan yang ditugaskan ke unit Anda.'}
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Input
                        placeholder="Cari nama lembaga, PIC..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="sm:max-w-xs"
                    />
                    <Select
                        value={filters.status ?? 'all'}
                        onValueChange={(v) =>
                            applyFilters({
                                status: v === 'all' ? undefined : v,
                                page: undefined,
                            })
                        }
                    >
                        <SelectTrigger className="sm:w-44">
                            <SelectValue placeholder="Semua Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            {STATUS_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                    {o.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {can_monitor && (
                        <Select
                            value={filters.tahap ?? 'all'}
                            onValueChange={(v) =>
                                applyFilters({
                                    tahap: v === 'all' ? undefined : v,
                                    page: undefined,
                                })
                            }
                        >
                            <SelectTrigger className="sm:w-56">
                                <SelectValue placeholder="Semua Tahap" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Tahap
                                </SelectItem>
                                {Object.entries(tahap_labels).map(
                                    ([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ),
                                )}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mitra</TableHead>
                                <TableHead>Pelaksana</TableHead>
                                <TableHead>Tahap Saat Ini</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pembahasans.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        Belum ada pembahasan berjalan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pembahasans.data.map((p) => {
                                    const badge =
                                        STATUS_BADGE[p.status] ??
                                        STATUS_BADGE.berjalan;

                                    return (
                                        <TableRow key={p.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">
                                                        {p.mitra?.nama_lembaga}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {p.mitra?.pic_nama}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {p.pelaksana}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {tahap_labels[p.tahap] ??
                                                    p.tahap}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
                                                >
                                                    {badge.label}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 text-xs"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={
                                                                pembahasanRoutes.show(
                                                                    p.id,
                                                                ).url
                                                            }
                                                        >
                                                            <Eye className="mr-1 h-3.5 w-3.5" />
                                                            Detail
                                                        </Link>
                                                    </Button>
                                                    {p.can_advance &&
                                                        p.status ===
                                                            'berjalan' && (
                                                            <Button
                                                                size="sm"
                                                                className="h-7 text-xs"
                                                                onClick={() =>
                                                                    openAdvance(
                                                                        p,
                                                                    )
                                                                }
                                                            >
                                                                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                                                                Lanjutkan
                                                                Tahap
                                                            </Button>
                                                        )}
                                                    {p.can_batalkan &&
                                                        p.status ===
                                                            'berjalan' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-7 text-xs"
                                                                onClick={() =>
                                                                    openBatal(
                                                                        p,
                                                                    )
                                                                }
                                                            >
                                                                <XCircle className="mr-1 h-3.5 w-3.5" />
                                                                Batalkan
                                                            </Button>
                                                        )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {pembahasans.meta.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Menampilkan {pembahasans.meta.from}–
                            {pembahasans.meta.to} dari{' '}
                            {pembahasans.meta.total}
                        </p>
                        <div className="flex gap-1">
                            {pembahasans.meta.links.map((link, i) => (
                                <Button
                                    key={i}
                                    variant={
                                        link.active ? 'default' : 'outline'
                                    }
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() =>
                                        link.url &&
                                        router.get(
                                            link.url,
                                            {},
                                            { preserveState: true },
                                        )
                                    }
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Dialog: Lanjutkan Tahap */}
            <Dialog
                open={!!advanceTarget}
                onOpenChange={(o) => {
                    if (!o) {
                        setAdvanceTarget(null);
                        advanceForm.reset();
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Selesaikan Tahap:{' '}
                            {advanceTarget
                                ? (tahap_labels[advanceTarget.tahap] ??
                                  advanceTarget.tahap)
                                : ''}
                        </DialogTitle>
                        <DialogDescription>
                            Pembahasan dengan{' '}
                            <strong>{advanceTarget?.mitra?.nama_lembaga}</strong>
                            . Mengisi form ini akan menandai tahap saat ini
                            selesai dan lanjut ke tahap berikutnya.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        {advanceTarget?.tahap === 'awal' && (
                            <div className="grid gap-2">
                                <Label htmlFor="ruang_lingkup">
                                    Ruang Lingkup &amp; Hak/Kewajiban{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="ruang_lingkup"
                                    rows={3}
                                    value={advanceForm.data.ruang_lingkup}
                                    onChange={(e) =>
                                        advanceForm.setData(
                                            'ruang_lingkup',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Pemetaan ruang lingkup, hak, dan kewajiban kerja sama..."
                                />
                                {advanceForm.errors.ruang_lingkup && (
                                    <p className="text-xs text-destructive">
                                        {advanceForm.errors.ruang_lingkup}
                                    </p>
                                )}
                            </div>
                        )}
                        {advanceTarget?.tahap === 'rk' && (
                            <div className="grid gap-2">
                                <Label htmlFor="rencana_kerja">
                                    Rencana Kerja{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="rencana_kerja"
                                    rows={3}
                                    value={advanceForm.data.rencana_kerja}
                                    onChange={(e) =>
                                        advanceForm.setData(
                                            'rencana_kerja',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Detail rencana kerja yang disepakati..."
                                />
                                {advanceForm.errors.rencana_kerja && (
                                    <p className="text-xs text-destructive">
                                        {advanceForm.errors.rencana_kerja}
                                    </p>
                                )}
                            </div>
                        )}
                        {advanceTarget?.tahap === 'validasi' && (
                            <div className="grid gap-2">
                                <Label htmlFor="nomor_pks">
                                    Nomor PKS{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="nomor_pks"
                                    value={advanceForm.data.nomor_pks}
                                    onChange={(e) =>
                                        advanceForm.setData(
                                            'nomor_pks',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Nomor PKS dari Biro Hukum"
                                />
                                {advanceForm.errors.nomor_pks && (
                                    <p className="text-xs text-destructive">
                                        {advanceForm.errors.nomor_pks}
                                    </p>
                                )}
                            </div>
                        )}
                        {advanceTarget?.tahap === 'penandatanganan' && (
                            <div className="grid gap-2">
                                <Label htmlFor="tanggal_tandatangan">
                                    Tanggal Tandatangan{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="tanggal_tandatangan"
                                    type="date"
                                    value={
                                        advanceForm.data.tanggal_tandatangan
                                    }
                                    onChange={(e) =>
                                        advanceForm.setData(
                                            'tanggal_tandatangan',
                                            e.target.value,
                                        )
                                    }
                                />
                                {advanceForm.errors.tanggal_tandatangan && (
                                    <p className="text-xs text-destructive">
                                        {
                                            advanceForm.errors
                                                .tanggal_tandatangan
                                        }
                                    </p>
                                )}
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="catatan">
                                Catatan{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="catatan"
                                rows={3}
                                value={advanceForm.data.catatan}
                                onChange={(e) =>
                                    advanceForm.setData(
                                        'catatan',
                                        e.target.value,
                                    )
                                }
                                placeholder="Ringkasan hasil tahap ini..."
                            />
                            {advanceForm.errors.catatan && (
                                <p className="text-xs text-destructive">
                                    {advanceForm.errors.catatan}
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Batal</Button>
                        </DialogClose>
                        <Button
                            onClick={submitAdvance}
                            disabled={advanceForm.processing}
                        >
                            <CalendarCheck className="mr-2 h-4 w-4" />
                            Simpan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog: Batalkan Pembahasan */}
            <Dialog
                open={!!batalTarget}
                onOpenChange={(o) => {
                    if (!o) {
                        setBatalTarget(null);
                        batalForm.reset();
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Batalkan Pembahasan</DialogTitle>
                        <DialogDescription>
                            Pembahasan dengan{' '}
                            <strong>{batalTarget?.mitra?.nama_lembaga}</strong>
                            . Membatalkan pembahasan akan menolak pengajuan
                            mitra.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="batal_catatan">
                                Alasan Pembatalan{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="batal_catatan"
                                rows={3}
                                value={batalForm.data.catatan}
                                onChange={(e) =>
                                    batalForm.setData(
                                        'catatan',
                                        e.target.value,
                                    )
                                }
                                placeholder="Alasan pembahasan dibatalkan..."
                            />
                            {batalForm.errors.catatan && (
                                <p className="text-xs text-destructive">
                                    {batalForm.errors.catatan}
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Batal</Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={submitBatal}
                            disabled={batalForm.processing}
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            Batalkan Pembahasan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
