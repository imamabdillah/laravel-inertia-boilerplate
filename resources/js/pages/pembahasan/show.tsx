import { Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarCheck,
    Check,
    CheckCircle2,
    ClipboardList,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import pembahasanRoutes from '@/routes/pembahasan';
import type { BreadcrumbItem, Pembahasan, PembahasanHistory } from '@/types';

type Props = {
    pembahasan: Pembahasan;
    histories: PembahasanHistory[];
    tahap_labels: Record<string, string>;
    can_monitor: boolean;
};

const EVENT_LABELS: Record<string, string> = {
    dimulai: 'Pembahasan Dimulai',
    tahap_selesai: 'Tahap Selesai',
    dibatalkan: 'Dibatalkan',
};

function historyExtraField(
    h: PembahasanHistory,
): { label: string; value: string } | null {
    if (h.ruang_lingkup) {
        return {
            label: 'Ruang Lingkup & Hak/Kewajiban',
            value: h.ruang_lingkup,
        };
    }
    if (h.rencana_kerja) {
        return { label: 'Rencana Kerja', value: h.rencana_kerja };
    }
    if (h.nomor_pks) {
        return { label: 'Nomor PKS', value: h.nomor_pks };
    }
    if (h.tanggal_tandatangan) {
        return {
            label: 'Tanggal Tandatangan',
            value: new Date(h.tanggal_tandatangan).toLocaleDateString(
                'id-ID',
                { dateStyle: 'medium' },
            ),
        };
    }

    return null;
}

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

function DetailRow({
    label,
    value,
}: {
    label: string;
    value?: React.ReactNode;
}) {
    if (!value) {
        return null;
    }

    return (
        <div className="grid grid-cols-3 gap-2 border-b py-2 last:border-0">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="col-span-2 text-sm whitespace-pre-wrap">
                {value}
            </span>
        </div>
    );
}

export default function PembahasanShow({
    pembahasan,
    histories,
    tahap_labels,
    can_monitor,
}: Props) {
    const [selectedTahap, setSelectedTahap] = useState<string | null>(null);
    const [advanceOpen, setAdvanceOpen] = useState(false);

    const advanceForm = useForm({
        catatan: '',
        ruang_lingkup: pembahasan.ruang_lingkup ?? '',
        rencana_kerja: pembahasan.rencana_kerja ?? '',
        nomor_pks: pembahasan.nomor_pks ?? '',
        tanggal_tandatangan: pembahasan.tanggal_tandatangan ?? '',
    });

    const openAdvance = () => {
        advanceForm.setData({
            catatan: '',
            ruang_lingkup: pembahasan.ruang_lingkup ?? '',
            rencana_kerja: pembahasan.rencana_kerja ?? '',
            nomor_pks: pembahasan.nomor_pks ?? '',
            tanggal_tandatangan: pembahasan.tanggal_tandatangan ?? '',
        });
        setAdvanceOpen(true);
    };

    const submitAdvance = () => {
        advanceForm.patch(pembahasanRoutes.advance(pembahasan.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                setAdvanceOpen(false);
                advanceForm.reset();
            },
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pembahasan', href: pembahasanRoutes.index().url },
        {
            title: pembahasan.mitra?.nama_lembaga ?? 'Detail',
            href: pembahasanRoutes.show(pembahasan.id).url,
        },
    ];

    const badge = STATUS_BADGE[pembahasan.status] ?? STATUS_BADGE.berjalan;
    const tahapOrder = Object.keys(tahap_labels);
    const currentIndex = tahapOrder.indexOf(pembahasan.tahap);
    const selectedHistories = histories.filter(
        (h) => h.tahap === selectedTahap,
    );

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={pembahasanRoutes.index().url}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">
                            {pembahasan.mitra?.nama_lembaga}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {pembahasan.mitra?.pic_nama}
                        </p>
                    </div>
                    {pembahasan.can_advance &&
                        pembahasan.status === 'berjalan' && (
                            <Button onClick={openAdvance}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Lanjutkan Tahap
                            </Button>
                        )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Progres Tahap
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {tahapOrder.map((tahap, i) => {
                                const isDone =
                                    pembahasan.status === 'selesai' ||
                                    i < currentIndex;
                                const isCurrent =
                                    i === currentIndex &&
                                    pembahasan.status !== 'selesai';
                                const hasHistory = histories.some(
                                    (h) => h.tahap === tahap,
                                );
                                const isSelected = selectedTahap === tahap;

                                return (
                                    <button
                                        key={tahap}
                                        type="button"
                                        disabled={!hasHistory}
                                        onClick={() =>
                                            setSelectedTahap(tahap)
                                        }
                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-opacity ${
                                            hasHistory
                                                ? 'cursor-pointer hover:opacity-80'
                                                : 'cursor-not-allowed'
                                        } ${
                                            isSelected
                                                ? 'ring-2 ring-offset-1'
                                                : ''
                                        } ${
                                            isDone
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                : isCurrent
                                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                  : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        {isDone && (
                                            <Check className="h-3 w-3" />
                                        )}
                                        {tahap_labels[tahap]}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                            Klik tahap yang sudah tercapai untuk melihat
                            detail historisnya.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <ClipboardList className="h-4 w-4" />
                            Detail Pembahasan
                        </CardTitle>
                        <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
                        >
                            {badge.label}
                        </span>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-1">
                            <DetailRow
                                label="Pelaksana"
                                value={pembahasan.pelaksana}
                            />
                            <DetailRow
                                label="Tahap Saat Ini"
                                value={
                                    tahap_labels[pembahasan.tahap] ??
                                    pembahasan.tahap
                                }
                            />
                            <DetailRow
                                label="Ruang Lingkup & Hak/Kewajiban"
                                value={pembahasan.ruang_lingkup}
                            />
                            <DetailRow
                                label="Rencana Kerja"
                                value={pembahasan.rencana_kerja}
                            />
                            <DetailRow
                                label="Nomor PKS"
                                value={pembahasan.nomor_pks}
                            />
                            <DetailRow
                                label="Tanggal Tandatangan"
                                value={
                                    pembahasan.tanggal_tandatangan
                                        ? new Date(
                                              pembahasan.tanggal_tandatangan,
                                          ).toLocaleDateString('id-ID', {
                                              dateStyle: 'medium',
                                          })
                                        : null
                                }
                            />
                            <DetailRow
                                label="Catatan Terakhir"
                                value={pembahasan.catatan}
                            />
                            <DetailRow
                                label="Diselesaikan oleh"
                                value={pembahasan.completed_by}
                            />
                        </div>
                    </CardContent>
                </Card>

                {selectedTahap && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <ClipboardList className="h-4 w-4" />
                                Detail Historis —{' '}
                                {tahap_labels[selectedTahap] ??
                                    selectedTahap}
                            </CardTitle>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs"
                                onClick={() => setSelectedTahap(null)}
                            >
                                <X className="mr-1 h-3.5 w-3.5" />
                                Tutup
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-4">
                                {selectedHistories.map((h) => {
                                    const extra = historyExtraField(h);

                                    return (
                                        <div
                                            key={h.id}
                                            className="rounded-md border p-3"
                                        >
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-sm font-medium">
                                                    {EVENT_LABELS[h.event] ??
                                                        h.event}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(
                                                        h.created_at,
                                                    ).toLocaleString(
                                                        'id-ID',
                                                        {
                                                            dateStyle:
                                                                'medium',
                                                            timeStyle:
                                                                'short',
                                                        },
                                                    )}
                                                </span>
                                            </div>
                                            <div className="grid gap-1">
                                                {extra && (
                                                    <DetailRow
                                                        label={extra.label}
                                                        value={extra.value}
                                                    />
                                                )}
                                                <DetailRow
                                                    label="Catatan"
                                                    value={h.catatan}
                                                />
                                                <DetailRow
                                                    label="Oleh"
                                                    value={h.completed_by}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {can_monitor && pembahasan.mitra && (
                    <div className="flex justify-end">
                        <Button variant="outline" asChild>
                            <Link
                                href={`/admin/mitras/${pembahasan.mitra.id}`}
                            >
                                Lihat Profil Mitra
                            </Link>
                        </Button>
                    </div>
                )}
            </div>

            {/* Dialog: Lanjutkan Tahap */}
            <Dialog
                open={advanceOpen}
                onOpenChange={(o) => {
                    setAdvanceOpen(o);
                    if (!o) {
                        advanceForm.reset();
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Selesaikan Tahap:{' '}
                            {tahap_labels[pembahasan.tahap] ??
                                pembahasan.tahap}
                        </DialogTitle>
                        <DialogDescription>
                            Pembahasan dengan{' '}
                            <strong>{pembahasan.mitra?.nama_lembaga}</strong>.
                            Mengisi form ini akan menandai tahap saat ini
                            selesai dan lanjut ke tahap berikutnya.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        {pembahasan.tahap === 'awal' && (
                            <div className="grid gap-2">
                                <Label htmlFor="show_ruang_lingkup">
                                    Ruang Lingkup &amp; Hak/Kewajiban{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="show_ruang_lingkup"
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
                        {pembahasan.tahap === 'rk' && (
                            <div className="grid gap-2">
                                <Label htmlFor="show_rencana_kerja">
                                    Rencana Kerja{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="show_rencana_kerja"
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
                        {pembahasan.tahap === 'validasi' && (
                            <div className="grid gap-2">
                                <Label htmlFor="show_nomor_pks">
                                    Nomor PKS{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="show_nomor_pks"
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
                        {pembahasan.tahap === 'penandatanganan' && (
                            <div className="grid gap-2">
                                <Label htmlFor="show_tanggal_tandatangan">
                                    Tanggal Tandatangan{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="show_tanggal_tandatangan"
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
                            <Label htmlFor="show_catatan">
                                Catatan{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="show_catatan"
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
        </AdminLayout>
    );
}
