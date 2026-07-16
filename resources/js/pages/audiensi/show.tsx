import { Link } from '@inertiajs/react';
import { ArrowLeft, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import audiensiRoutes from '@/routes/audiensi';
import type { Audiensi, BreadcrumbItem } from '@/types';

type Props = {
    audiensi: Audiensi;
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

const MODA_LABELS: Record<string, string> = {
    daring: 'Daring',
    luring: 'Luring',
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

export default function AudiensiShow({
    audiensi,
    pelaksana_labels,
    can_monitor,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Audiensi', href: audiensiRoutes.index().url },
        {
            title: audiensi.mitra?.nama_lembaga ?? 'Detail',
            href: audiensiRoutes.show(audiensi.id).url,
        },
    ];

    const badge = STATUS_BADGE[audiensi.status] ?? STATUS_BADGE.ditugaskan;
    const hasil = audiensi.hasil ? HASIL_BADGE[audiensi.hasil] : null;

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={audiensiRoutes.index().url}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">
                            {audiensi.mitra?.nama_lembaga}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {audiensi.mitra?.pic_nama}
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <CalendarClock className="h-4 w-4" />
                            Detail Audiensi
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
                                value={
                                    pelaksana_labels[audiensi.pelaksana] ??
                                    audiensi.pelaksana
                                }
                            />
                            <DetailRow
                                label="Moda"
                                value={
                                    audiensi.moda
                                        ? MODA_LABELS[audiensi.moda]
                                        : null
                                }
                            />
                            <DetailRow
                                label="Jadwal"
                                value={
                                    audiensi.jadwal
                                        ? new Date(
                                              audiensi.jadwal,
                                          ).toLocaleString('id-ID', {
                                              dateStyle: 'medium',
                                              timeStyle: 'short',
                                          })
                                        : null
                                }
                            />
                            <DetailRow
                                label={
                                    audiensi.moda === 'daring'
                                        ? 'Link Meeting'
                                        : 'Tempat'
                                }
                                value={audiensi.lokasi}
                            />
                            <DetailRow
                                label="Ditugaskan oleh"
                                value={audiensi.assigned_by}
                            />
                            <DetailRow
                                label="Ditugaskan pada"
                                value={
                                    audiensi.assigned_at
                                        ? new Date(
                                              audiensi.assigned_at,
                                          ).toLocaleString('id-ID', {
                                              dateStyle: 'medium',
                                              timeStyle: 'short',
                                          })
                                        : null
                                }
                            />
                            <DetailRow
                                label="Hasil"
                                value={hasil?.label}
                            />
                            <DetailRow
                                label="Catatan Hasil"
                                value={audiensi.catatan_hasil}
                            />
                            <DetailRow
                                label="Dicatat oleh"
                                value={audiensi.completed_by}
                            />
                        </div>
                    </CardContent>
                </Card>

                {can_monitor && audiensi.mitra && (
                    <div className="flex justify-end">
                        <Button variant="outline" asChild>
                            <Link
                                href={`/admin/mitras/${audiensi.mitra.id}`}
                            >
                                Lihat Profil Mitra
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
