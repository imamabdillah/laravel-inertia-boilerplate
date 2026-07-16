import { Link, router, useForm } from '@inertiajs/react';
import {
    CalendarClock,
    CheckCircle2,
    ClipboardCheck,
    Eye,
    XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
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
import audiensiRoutes from '@/routes/audiensi';
import type { Audiensi, BreadcrumbItem, PaginatedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Audiensi', href: audiensiRoutes.index().url },
];

type Props = {
    audiensis: PaginatedData<Audiensi>;
    filters: { search?: string; status?: string; pelaksana?: string };
    pelaksana_labels: Record<string, string>;
    can_monitor: boolean;
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
    ditugaskan: {
        label: 'Ditugaskan',
        className:
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    },
    dijadwalkan: {
        label: 'Dijadwalkan',
        className:
            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    },
    selesai: {
        label: 'Selesai',
        className:
            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    },
};

const HASIL_BADGE: Record<string, { label: string; className: string }> = {
    lanjut: {
        label: 'Lanjut Pembahasan',
        className:
            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    },
    ditolak: {
        label: 'Ditolak',
        className:
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    },
};

const STATUS_OPTIONS = [
    { value: 'ditugaskan', label: 'Ditugaskan' },
    { value: 'dijadwalkan', label: 'Dijadwalkan' },
    { value: 'selesai', label: 'Selesai' },
];

const MODA_LABELS: Record<string, string> = {
    daring: 'Daring',
    luring: 'Luring',
};

// 'YYYY-MM-DD HH:mm:ss' → 'YYYY-MM-DDTHH:mm' untuk input datetime-local
function toDatetimeLocal(value: string | null): string {
    if (!value) {
        return '';
    }

    return value.replace(' ', 'T').slice(0, 16);
}

export default function AudiensiIndex({
    audiensis,
    filters,
    pelaksana_labels,
    can_monitor,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [jadwalTarget, setJadwalTarget] = useState<Audiensi | null>(null);
    const [hasilTarget, setHasilTarget] = useState<Audiensi | null>(null);

    const jadwalForm = useForm({ jadwal: '', moda: 'luring', lokasi: '' });
    const hasilForm = useForm({ hasil: '', catatan_hasil: '' });

    const applyFilters = useCallback(
        (overrides: Record<string, string | undefined>) => {
            router.get(
                audiensiRoutes.index().url,
                {
                    search: filters.search,
                    status: filters.status,
                    pelaksana: filters.pelaksana,
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

    const openJadwal = (a: Audiensi) => {
        setJadwalTarget(a);
        jadwalForm.setData({
            jadwal: toDatetimeLocal(a.jadwal),
            moda: a.moda ?? 'luring',
            lokasi: a.lokasi ?? '',
        });
    };

    const submitJadwal = () => {
        if (!jadwalTarget) {
            return;
        }

        jadwalForm.patch(audiensiRoutes.jadwal(jadwalTarget.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                setJadwalTarget(null);
                jadwalForm.reset();
            },
        });
    };

    const openHasil = (a: Audiensi) => {
        setHasilTarget(a);
        hasilForm.setData({ hasil: '', catatan_hasil: '' });
    };

    const submitHasil = () => {
        if (!hasilTarget) {
            return;
        }

        hasilForm.post(audiensiRoutes.hasil(hasilTarget.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                setHasilTarget(null);
                hasilForm.reset();
            },
        });
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold">Audiensi</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {can_monitor
                            ? 'Monitoring seluruh audiensi kerja sama (Setditjen).'
                            : 'Audiensi yang ditugaskan ke unit Anda.'}
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
                            value={filters.pelaksana ?? 'all'}
                            onValueChange={(v) =>
                                applyFilters({
                                    pelaksana: v === 'all' ? undefined : v,
                                    page: undefined,
                                })
                            }
                        >
                            <SelectTrigger className="sm:w-56">
                                <SelectValue placeholder="Semua Pelaksana" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Pelaksana
                                </SelectItem>
                                {Object.entries(pelaksana_labels).map(
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
                                <TableHead>Jadwal</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Hasil</TableHead>
                                <TableHead className="text-right">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {audiensis.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        Belum ada penugasan audiensi.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                audiensis.data.map((a) => {
                                    const badge =
                                        STATUS_BADGE[a.status] ??
                                        STATUS_BADGE.ditugaskan;
                                    const hasil = a.hasil
                                        ? HASIL_BADGE[a.hasil]
                                        : null;

                                    return (
                                        <TableRow key={a.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">
                                                        {a.mitra?.nama_lembaga}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {a.mitra?.pic_nama}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {pelaksana_labels[
                                                        a.pelaksana
                                                    ] ?? a.pelaksana}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {a.jadwal ? (
                                                    <div>
                                                        <p className="text-xs font-medium text-muted-foreground">
                                                            {a.moda
                                                                ? MODA_LABELS[
                                                                      a.moda
                                                                  ]
                                                                : '-'}
                                                        </p>
                                                        <p>
                                                            {new Date(
                                                                a.jadwal,
                                                            ).toLocaleString(
                                                                'id-ID',
                                                                {
                                                                    dateStyle:
                                                                        'medium',
                                                                    timeStyle:
                                                                        'short',
                                                                },
                                                            )}
                                                        </p>
                                                        {a.lokasi && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {a.lokasi}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        Belum dijadwalkan
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
                                                >
                                                    {badge.label}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {hasil ? (
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${hasil.className}`}
                                                    >
                                                        {hasil.label}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
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
                                                                audiensiRoutes.show(
                                                                    a.id,
                                                                ).url
                                                            }
                                                        >
                                                            <Eye className="mr-1 h-3.5 w-3.5" />
                                                            Detail
                                                        </Link>
                                                    </Button>
                                                    {a.can_execute &&
                                                        a.status !==
                                                            'selesai' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-7 text-xs"
                                                                onClick={() =>
                                                                    openJadwal(
                                                                        a,
                                                                    )
                                                                }
                                                            >
                                                                <CalendarClock className="mr-1 h-3.5 w-3.5" />
                                                                {a.status ===
                                                                'dijadwalkan'
                                                                    ? 'Ubah Jadwal'
                                                                    : 'Jadwalkan'}
                                                            </Button>
                                                        )}
                                                    {a.can_execute &&
                                                        a.status ===
                                                            'dijadwalkan' && (
                                                            <Button
                                                                size="sm"
                                                                className="h-7 text-xs"
                                                                onClick={() =>
                                                                    openHasil(a)
                                                                }
                                                            >
                                                                <ClipboardCheck className="mr-1 h-3.5 w-3.5" />
                                                                Catat Hasil
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
                {audiensis.meta.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Menampilkan {audiensis.meta.from}–
                            {audiensis.meta.to} dari {audiensis.meta.total}
                        </p>
                        <div className="flex gap-1">
                            {audiensis.meta.links.map((link, i) => (
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

            {/* Dialog: Jadwalkan */}
            <Dialog
                open={!!jadwalTarget}
                onOpenChange={(o) => {
                    if (!o) {
                        setJadwalTarget(null);
                        jadwalForm.reset();
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Jadwalkan Audiensi</DialogTitle>
                        <DialogDescription>
                            Audiensi dengan{' '}
                            <strong>{jadwalTarget?.mitra?.nama_lembaga}</strong>
                            .
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="jadwal">
                                Tanggal & Waktu{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="jadwal"
                                type="datetime-local"
                                value={jadwalForm.data.jadwal}
                                onChange={(e) =>
                                    jadwalForm.setData('jadwal', e.target.value)
                                }
                            />
                            {jadwalForm.errors.jadwal && (
                                <p className="text-xs text-destructive">
                                    {jadwalForm.errors.jadwal}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label>
                                Moda{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={jadwalForm.data.moda}
                                onValueChange={(v) =>
                                    jadwalForm.setData('moda', v)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih moda audiensi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="luring">
                                        Luring (Tatap Muka)
                                    </SelectItem>
                                    <SelectItem value="daring">
                                        Daring (Online)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {jadwalForm.errors.moda && (
                                <p className="text-xs text-destructive">
                                    {jadwalForm.errors.moda}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="lokasi">
                                {jadwalForm.data.moda === 'daring'
                                    ? 'Link Meeting'
                                    : 'Tempat'}{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="lokasi"
                                value={jadwalForm.data.lokasi}
                                onChange={(e) =>
                                    jadwalForm.setData('lokasi', e.target.value)
                                }
                                placeholder={
                                    jadwalForm.data.moda === 'daring'
                                        ? 'Contoh: link Zoom / Google Meet'
                                        : 'Contoh: Ruang Rapat GTK Lt. 12'
                                }
                            />
                            {jadwalForm.errors.lokasi && (
                                <p className="text-xs text-destructive">
                                    {jadwalForm.errors.lokasi}
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Batal</Button>
                        </DialogClose>
                        <Button
                            onClick={submitJadwal}
                            disabled={jadwalForm.processing}
                        >
                            <CalendarClock className="mr-2 h-4 w-4" />
                            Simpan Jadwal
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog: Catat Hasil */}
            <Dialog
                open={!!hasilTarget}
                onOpenChange={(o) => {
                    if (!o) {
                        setHasilTarget(null);
                        hasilForm.reset();
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Catat Hasil Audiensi</DialogTitle>
                        <DialogDescription>
                            Hasil audiensi dengan{' '}
                            <strong>{hasilTarget?.mitra?.nama_lembaga}</strong>.
                            Hasil <em>Ditolak</em> akan menolak pengajuan mitra.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <Label>
                                Hasil{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={hasilForm.data.hasil}
                                onValueChange={(v) =>
                                    hasilForm.setData('hasil', v)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih hasil audiensi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="lanjut">
                                        Lanjut ke Pembahasan
                                    </SelectItem>
                                    <SelectItem value="ditolak">
                                        Ditolak
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {hasilForm.errors.hasil && (
                                <p className="text-xs text-destructive">
                                    {hasilForm.errors.hasil}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="catatan_hasil">
                                Catatan Hasil{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="catatan_hasil"
                                rows={3}
                                value={hasilForm.data.catatan_hasil}
                                onChange={(e) =>
                                    hasilForm.setData(
                                        'catatan_hasil',
                                        e.target.value,
                                    )
                                }
                                placeholder="Ringkasan hasil audiensi, kesepakatan, atau alasan penolakan..."
                            />
                            {hasilForm.errors.catatan_hasil && (
                                <p className="text-xs text-destructive">
                                    {hasilForm.errors.catatan_hasil}
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Batal</Button>
                        </DialogClose>
                        <Button
                            variant={
                                hasilForm.data.hasil === 'ditolak'
                                    ? 'destructive'
                                    : 'default'
                            }
                            onClick={submitHasil}
                            disabled={hasilForm.processing}
                        >
                            {hasilForm.data.hasil === 'ditolak' ? (
                                <>
                                    <XCircle className="mr-2 h-4 w-4" /> Simpan
                                    Hasil
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />{' '}
                                    Simpan Hasil
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
