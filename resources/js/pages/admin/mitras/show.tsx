import { router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    ExternalLink,
    FileText,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import { JENJANG_LABELS, UPT_LABELS, WILAYAH_LABELS } from '@/lib/mitra-tags';
import type { BreadcrumbItem, DokumenMitra, Mitra } from '@/types';

type LogEntry = {
    id: number;
    description: string;
    causer_name: string;
    created_at: string;
};

type Props = {
    mitra: Mitra;
    logs: LogEntry[];
};

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
    draft:               { label: 'Draft',                variant: 'secondary',   icon: <Clock className="h-4 w-4" /> },
    menunggu_verifikasi: { label: 'Menunggu Verifikasi',  variant: 'outline',     icon: <Clock className="h-4 w-4" /> },
    diverifikasi:        { label: 'Diverifikasi',         variant: 'default',     icon: <CheckCircle2 className="h-4 w-4" /> },
    ditolak:             { label: 'Ditolak',              variant: 'destructive', icon: <XCircle className="h-4 w-4" /> },
    aktif:               { label: 'Aktif',                variant: 'default',     icon: <CheckCircle2 className="h-4 w-4" /> },
    nonaktif:            { label: 'Nonaktif',             variant: 'secondary',   icon: <XCircle className="h-4 w-4" /> },
};

const DOK_STATUS: Record<string, { label: string; className: string }> = {
    menunggu: { label: 'Menunggu', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
    diterima: { label: 'Diterima', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
    ditolak:  { label: 'Ditolak',  className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
};

const DOKUMEN_LABELS: Record<string, string> = {
    surat_pengajuan:      'Surat Pengajuan Kerja Sama',
    proposal_kerja_sama:  'Proposal Kerja Sama',
    dokumen_legalitas:    'Dokumen Legalitas',
    profil_perusahaan:    'Profil Perusahaan',
};

const JENIS_LABELS: Record<string, string> = {
    perguruan_tinggi:    'Perguruan Tinggi',
    lembaga_pelatihan:   'Lembaga Pelatihan',
    perusahaan:          'Perusahaan',
    lsm:                 'LSM',
    instansi_pemerintah: 'Instansi Pemerintah',
    lainnya:             'Lainnya',
};

function DetailRow({ label, value }: { label: string; value?: string | null }) {
    if (!value) return null;
    return (
        <div className="grid grid-cols-3 gap-2 py-2 border-b last:border-0">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm col-span-2">{value}</span>
        </div>
    );
}

export default function AdminMitraShow({ mitra, logs }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Mitra', href: '/admin/mitras' },
        { title: mitra.nama_lembaga, href: `/admin/mitras/${mitra.id}` },
    ];

    const [rejectOpen, setRejectOpen]           = useState(false);
    const [verifyOpen, setVerifyOpen]           = useState(false);
    const [dokReviewTarget, setDokReviewTarget] = useState<DokumenMitra | null>(null);
    const [dokAction, setDokAction]             = useState<'diterima' | 'ditolak' | null>(null);

    const rejectForm = useForm({ catatan_admin: '' });
    const dokForm    = useForm({ status: '', catatan: '' });

    const canVerifyOrReject = ['menunggu_verifikasi', 'ditolak', 'diverifikasi'].includes(mitra.status);

    const handleVerify = () => {
        router.post(`/admin/mitras/${mitra.id}/verify`, {}, {
            preserveScroll: true,
            onSuccess: () => setVerifyOpen(false),
        });
    };

    const handleReject = () => {
        rejectForm.post(`/admin/mitras/${mitra.id}/reject`, {
            preserveScroll: true,
            onSuccess: () => { setRejectOpen(false); rejectForm.reset(); },
        });
    };

    const openDokReview = (dok: DokumenMitra, action: 'diterima' | 'ditolak') => {
        setDokReviewTarget(dok);
        setDokAction(action);
        dokForm.setData('status', action);
        dokForm.setData('catatan', '');
    };

    const handleDokReview = () => {
        if (!dokReviewTarget) return;
        dokForm.post(`/admin/mitras/${mitra.id}/dokumens/${dokReviewTarget.id}/review`, {
            preserveScroll: true,
            onSuccess: () => { setDokReviewTarget(null); setDokAction(null); dokForm.reset(); },
        });
    };

    const statusCfg = STATUS_CONFIG[mitra.status] ?? STATUS_CONFIG.draft;

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-1 flex-col gap-2 p-4 md:p-6 max-w-7xl mx-auto w-full">

                {/* Header */}
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">{mitra.nama_lembaga}</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            {JENIS_LABELS[mitra.jenis_lembaga] ?? mitra.jenis_lembaga} · {mitra.bidang_kerja}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={statusCfg.variant} className="flex items-center gap-1.5 px-3 py-1.5">
                            {statusCfg.icon}
                            {statusCfg.label}
                        </Badge>
                        {canVerifyOrReject && mitra.status !== 'diverifikasi' && (
                            <Button
                                size="sm"
                                onClick={() => setVerifyOpen(true)}
                                disabled={mitra.status === 'draft' || !mitra.is_all_dokumen_verified}
                                title={!mitra.is_all_dokumen_verified ? 'Semua dokumen wajib harus diverifikasi (diterima) dulu' : undefined}
                            >
                                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                Verifikasi
                            </Button>
                        )}
                        {canVerifyOrReject && mitra.status !== 'ditolak' && (
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setRejectOpen(true)}
                                disabled={mitra.status === 'draft'}
                            >
                                <XCircle className="mr-1.5 h-4 w-4" />
                                Tolak
                            </Button>
                        )}
                    </div>
                </div>

                {mitra.status === 'draft' && (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Belum disubmit</AlertTitle>
                        <AlertDescription>Mitra belum menyelesaikan dan mengsubmit profilnya.</AlertDescription>
                    </Alert>
                )}

                {canVerifyOrReject && mitra.status !== 'diverifikasi' && mitra.status !== 'draft' && !mitra.is_all_dokumen_verified && (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Dokumen belum lengkap diverifikasi</AlertTitle>
                        <AlertDescription>Semua dokumen wajib berstatus "Diterima" sebelum mitra ini dapat diverifikasi.</AlertDescription>
                    </Alert>
                )}

                {(mitra.jenjang?.length || mitra.wilayah?.length || mitra.upt?.length) ? (
                            <div className="flex flex-wrap gap-1.5 mb-4 pb-4 border-b">  
                                {mitra.jenjang?.map((v) => (
                                    <Badge key={`jenjang-${v}`} variant="outline">{JENJANG_LABELS[v] ?? v}</Badge>
                                ))}
                                {mitra.wilayah?.map((v) => (
                                    <Badge className="bg-blue-100 text-blue-800" key={`wilayah-${v}`} variant="secondary">{WILAYAH_LABELS[v] ?? v}</Badge>
                                ))}
                                {mitra.upt?.map((v) => (
                                    <Badge className="bg-blue-100 text-blue-800" key={`upt-${v}`} variant="secondary">{UPT_LABELS[v] ?? v}</Badge>
                                ))}
                            </div>
                        ) : null}
                                   

                {mitra.catatan_admin && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Catatan Admin</AlertTitle>
                        <AlertDescription>{mitra.catatan_admin}</AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-2">
                    {/* Data Lembaga */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Data Lembaga</CardTitle></CardHeader>
                        <CardContent>
                            <DetailRow label="Nama" value={mitra.nama_lembaga} />
                            <DetailRow label="Jenis" value={JENIS_LABELS[mitra.jenis_lembaga]} />
                            <DetailRow label="Bidang Kerja" value={mitra.bidang_kerja} />
                            <DetailRow label="Deskripsi" value={mitra.deskripsi} />
                            <DetailRow label="Website" value={mitra.website} />
                            <DetailRow label="Email" value={mitra.email_lembaga} />
                            <DetailRow label="Telepon" value={mitra.telepon} />
                        </CardContent>
                    </Card>

                    {/* Alamat */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Alamat</CardTitle></CardHeader>
                        <CardContent>
                            <DetailRow label="Alamat" value={mitra.alamat} />
                            <DetailRow label="Kota" value={mitra.kota} />
                            <DetailRow label="Provinsi" value={mitra.provinsi} />
                            <DetailRow label="Kode Pos" value={mitra.kode_pos} />
                        </CardContent>
                    </Card>

                    {/* PIC */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Person in Charge</CardTitle></CardHeader>
                        <CardContent>
                            <DetailRow label="Nama" value={mitra.pic_nama} />
                            <DetailRow label="Jabatan" value={mitra.pic_jabatan} />
                            <DetailRow label="Telepon" value={mitra.pic_telepon} />
                            <DetailRow label="Email" value={mitra.pic_email} />
                        </CardContent>
                    </Card>

                    {/* Legalitas */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Legalitas</CardTitle></CardHeader>
                        <CardContent>
                            <DetailRow label="Nomor Akta / SK" value={mitra.nomor_akta} />
                            <DetailRow label="NIB" value={mitra.nomor_nib} />
                            <DetailRow label="NPWP" value={mitra.nomor_npwp} />
                            {!mitra.nomor_akta && !mitra.nomor_nib && !mitra.nomor_npwp && (
                                <p className="text-sm text-muted-foreground">Belum diisi</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Dokumen */}
                <div className="mt-5">
                <Card>
                    <CardHeader><CardTitle className="text-base">Dokumen</CardTitle></CardHeader>
                    <CardContent>
                        {(mitra.jenjang?.length || mitra.wilayah?.length || mitra.upt?.length) ? (
                            <div className="flex flex-wrap gap-1.5 mb-4 pb-4 border-b">
                                {mitra.jenjang?.map((v) => (
                                    <Badge key={`jenjang-${v}`} variant="outline">{JENJANG_LABELS[v] ?? v}</Badge>
                                ))}
                                {mitra.wilayah?.map((v) => (
                                    <Badge key={`wilayah-${v}`} variant="secondary">{WILAYAH_LABELS[v] ?? v}</Badge>
                                ))}
                                {mitra.upt?.map((v) => (
                                    <Badge key={`upt-${v}`} variant="secondary">{UPT_LABELS[v] ?? v}</Badge>
                                ))}
                            </div>
                        ) : null}
                        {(!mitra.dokumens || mitra.dokumens.length === 0) ? (
                            <p className="text-sm text-muted-foreground">Belum ada dokumen diupload.</p>
                        ) : (
                            <div className="divide-y">
                                {mitra.dokumens.map((dok) => {
                                    const ds = DOK_STATUS[dok.status] ?? DOK_STATUS.menunggu;
                                    return (
                                        <div key={dok.id} className="flex items-center justify-between gap-3 py-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="text-sm font-medium">{DOKUMEN_LABELS[dok.jenis_dokumen] ?? dok.jenis_dokumen}</p>
                                                        {dok.wajib && <span className="text-xs text-muted-foreground">(wajib)</span>}
                                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ds.className}`}>
                                                            {ds.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground truncate">{dok.nama_file} · {dok.file_size_formatted}</p>
                                                    {dok.catatan && <p className="text-xs text-muted-foreground mt-0.5">Catatan: {dok.catatan}</p>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <a href={dok.file_url} target="_blank" rel="noreferrer">
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                    </a>
                                                </Button>
                                                {dok.status !== 'diterima' && (
                                                    <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => openDokReview(dok, 'diterima')}>
                                                        Terima
                                                    </Button>
                                                )}
                                                {dok.status !== 'ditolak' && (
                                                    <Button size="sm" variant="outline" className="text-xs h-7 text-destructive border-destructive/50" onClick={() => openDokReview(dok, 'ditolak')}>
                                                        Tolak
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
                </div>

                {/* Activity Log */}
                <div className="mt-5">
                <Card>
                    <CardHeader><CardTitle className="text-base">Activity Log</CardTitle></CardHeader>
                    <CardContent>
                        {logs.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Belum ada aktivitas.</p>
                        ) : (
                            <div className="divide-y">
                                {logs.map((log) => (
                                    <div key={log.id} className="flex items-start justify-between gap-3 py-2.5">
                                        <div>
                                            <p className="text-sm font-medium">{log.description}</p>
                                            <p className="text-xs text-muted-foreground">{log.causer_name}</p>
                                        </div>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {new Date(log.created_at).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
                </div>
            </div>

            {/* Dialog: Verifikasi */}
            <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Verifikasi Mitra</DialogTitle>
                        <DialogDescription>
                            Verifikasi <strong>{mitra.nama_lembaga}</strong>? Status akan berubah menjadi <em>Diverifikasi</em>.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                        <Button onClick={handleVerify}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Verifikasi
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog: Tolak Mitra */}
            <Dialog open={rejectOpen} onOpenChange={(o) => { setRejectOpen(o); if (!o) rejectForm.reset(); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tolak Mitra</DialogTitle>
                        <DialogDescription>
                            Tolak <strong>{mitra.nama_lembaga}</strong>. Isi alasan penolakan — akan terlihat oleh mitra.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-2 py-2">
                        <Label htmlFor="catatan_admin">Catatan / Alasan <span className="text-destructive">*</span></Label>
                        <Textarea
                            id="catatan_admin"
                            rows={3}
                            value={rejectForm.data.catatan_admin}
                            onChange={(e) => rejectForm.setData('catatan_admin', e.target.value)}
                            placeholder="Contoh: Akta pendirian tidak valid..."
                        />
                        {rejectForm.errors.catatan_admin && (
                            <p className="text-xs text-destructive">{rejectForm.errors.catatan_admin}</p>
                        )}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                        <Button variant="destructive" onClick={handleReject} disabled={rejectForm.processing}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Tolak
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog: Review Dokumen */}
            <Dialog open={!!dokReviewTarget} onOpenChange={(o) => { if (!o) { setDokReviewTarget(null); setDokAction(null); dokForm.reset(); } }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {dokAction === 'diterima' ? 'Terima' : 'Tolak'} Dokumen
                        </DialogTitle>
                        <DialogDescription>
                            {dokReviewTarget ? DOKUMEN_LABELS[dokReviewTarget.jenis_dokumen] : ''} — {dokReviewTarget?.nama_file}
                        </DialogDescription>
                    </DialogHeader>
                    {dokAction === 'ditolak' && (
                        <div className="grid gap-2 py-2">
                            <Label htmlFor="dok_catatan">Catatan (opsional)</Label>
                            <Textarea
                                id="dok_catatan"
                                rows={2}
                                value={dokForm.data.catatan}
                                onChange={(e) => dokForm.setData('catatan', e.target.value)}
                                placeholder="Alasan penolakan..."
                            />
                        </div>
                    )}
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                        <Button
                            variant={dokAction === 'ditolak' ? 'destructive' : 'default'}
                            onClick={handleDokReview}
                            disabled={dokForm.processing}
                        >
                            {dokAction === 'diterima' ? (
                                <><CheckCircle2 className="mr-2 h-4 w-4" /> Terima</>
                            ) : (
                                <><XCircle className="mr-2 h-4 w-4" /> Tolak</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
