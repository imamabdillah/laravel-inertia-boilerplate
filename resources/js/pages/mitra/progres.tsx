import {
    AlertCircle,
    Building2,
    CalendarCheck,
    CheckCircle2,
    Clock,
    FileSignature,
    Send,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import DokumenPembahasanCard from '@/components/pembahasan/dokumen-pembahasan-card';
import TahapHistoryDetail, {
    DetailRow,
} from '@/components/pembahasan/tahap-history-detail';
import TahapProgress from '@/components/pembahasan/tahap-progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { progres } from '@/routes/mitra';
import type { BreadcrumbItem, Mitra, PembahasanHistory } from '@/types';

type Props = {
    mitra: Mitra;
    histories: PembahasanHistory[];
    tahap_labels: Record<string, string>;
    pelaksana_labels: Record<string, string>;
};

const STATUS_CONFIG: Record<
    string,
    {
        label: string;
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
        icon: React.ReactNode;
    }
> = {
    draft: {
        label: 'Draft',
        variant: 'secondary',
        icon: <Clock className="h-4 w-4" />,
    },
    menunggu_verifikasi: {
        label: 'Menunggu Verifikasi',
        variant: 'outline',
        icon: <Clock className="h-4 w-4" />,
    },
    diverifikasi: {
        label: 'Diverifikasi',
        variant: 'default',
        icon: <CheckCircle2 className="h-4 w-4" />,
    },
    ditolak: {
        label: 'Ditolak',
        variant: 'destructive',
        icon: <XCircle className="h-4 w-4" />,
    },
    aktif: {
        label: 'Aktif',
        variant: 'default',
        icon: <CheckCircle2 className="h-4 w-4" />,
    },
    nonaktif: {
        label: 'Nonaktif',
        variant: 'secondary',
        icon: <XCircle className="h-4 w-4" />,
    },
};

const AUDIENSI_STATUS: Record<string, string> = {
    ditugaskan: 'Ditugaskan',
    dijadwalkan: 'Dijadwalkan',
    selesai: 'Selesai',
};

const MODA_LABELS: Record<string, string> = {
    daring: 'Daring',
    luring: 'Luring',
};

export default function MitraProgres({
    mitra,
    histories,
    tahap_labels,
    pelaksana_labels,
}: Props) {
    const [selectedTahap, setSelectedTahap] = useState<string | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Progres Kerja Sama', href: progres().url },
    ];

    const statusCfg = STATUS_CONFIG[mitra.status] ?? STATUS_CONFIG.draft;
    const audiensi = mitra.latest_audiensi;
    const pembahasan = mitra.latest_pembahasan;

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold">Progres Kerja Sama</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Pantau perjalanan pengajuan kerja sama lembaga Anda —
                        dari verifikasi, audiensi, hingga penandatanganan PKS.
                    </p>
                </div>

                {/* 1. Status Pengajuan */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Send className="h-4 w-4" />
                            Status Pengajuan
                        </CardTitle>
                        <Badge
                            variant={statusCfg.variant}
                            className="flex items-center gap-1"
                        >
                            {statusCfg.icon}
                            {statusCfg.label}
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-1">
                            <DetailRow
                                label="Lembaga"
                                value={mitra.nama_lembaga || '—'}
                            />
                            <DetailRow
                                label="Terverifikasi"
                                value={
                                    mitra.verified_at
                                        ? new Date(
                                              mitra.verified_at,
                                          ).toLocaleDateString('id-ID', {
                                              dateStyle: 'medium',
                                          })
                                        : null
                                }
                            />
                        </div>
                        {mitra.status === 'ditolak' && mitra.catatan_admin && (
                            <Alert variant="destructive" className="mt-3">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Pengajuan Ditolak</AlertTitle>
                                <AlertDescription>
                                    {mitra.catatan_admin}
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* 2. Audiensi */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <CalendarCheck className="h-4 w-4" />
                            Audiensi
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {audiensi ? (
                            <div className="grid gap-1">
                                <DetailRow
                                    label="Status"
                                    value={
                                        AUDIENSI_STATUS[audiensi.status] ??
                                        audiensi.status
                                    }
                                />
                                <DetailRow
                                    label="Pelaksana"
                                    value={
                                        pelaksana_labels[audiensi.pelaksana] ??
                                        audiensi.pelaksana
                                    }
                                />
                                <DetailRow
                                    label="Jadwal"
                                    value={
                                        audiensi.jadwal
                                            ? new Date(
                                                  audiensi.jadwal,
                                              ).toLocaleString('id-ID', {
                                                  dateStyle: 'full',
                                                  timeStyle: 'short',
                                              })
                                            : null
                                    }
                                />
                                <DetailRow
                                    label="Moda"
                                    value={
                                        audiensi.moda
                                            ? (MODA_LABELS[audiensi.moda] ??
                                              audiensi.moda)
                                            : null
                                    }
                                />
                                <DetailRow
                                    label="Lokasi"
                                    value={audiensi.lokasi}
                                />
                                <DetailRow
                                    label="Hasil"
                                    value={
                                        audiensi.hasil
                                            ? audiensi.hasil === 'lanjut'
                                                ? 'Lanjut ke Pembahasan'
                                                : 'Ditolak'
                                            : null
                                    }
                                />
                                <DetailRow
                                    label="Catatan Hasil"
                                    value={audiensi.catatan_hasil}
                                />
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Belum sampai tahap ini.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* 3. Pembahasan */}
                {pembahasan ? (
                    <>
                        <TahapProgress
                            tahap={pembahasan.tahap}
                            status={pembahasan.status}
                            tahapLabels={tahap_labels}
                            histories={histories}
                            selectedTahap={selectedTahap}
                            onSelectTahap={setSelectedTahap}
                        />

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <FileSignature className="h-4 w-4" />
                                    Detail Pembahasan
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-1">
                                    <DetailRow
                                        label="Tahap Saat Ini"
                                        value={
                                            tahap_labels[pembahasan.tahap] ??
                                            pembahasan.tahap
                                        }
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
                                                  ).toLocaleDateString(
                                                      'id-ID',
                                                      {
                                                          dateStyle: 'medium',
                                                      },
                                                  )
                                                : null
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {selectedTahap && (
                            <TahapHistoryDetail
                                tahap={selectedTahap}
                                histories={histories}
                                tahapLabels={tahap_labels}
                                onClose={() => setSelectedTahap(null)}
                            />
                        )}

                        {/* 4. Dokumen — resource sudah memfilter ke PKS saja untuk mitra */}
                        <DokumenPembahasanCard
                            pembahasan={pembahasan}
                            jenisLabels={{
                                pks_tertandatangan: 'PKS Tertandatangan',
                            }}
                            tahapLabels={tahap_labels}
                            canUpload={false}
                            readOnly
                        />
                    </>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Building2 className="h-4 w-4" />
                                Pembahasan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Belum sampai tahap ini.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
}
