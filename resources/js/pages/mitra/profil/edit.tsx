import { router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    FileText,
    Loader2,
    Trash2,
    Upload,
    XCircle,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import type { BreadcrumbItem, DokumenMitra, Mitra } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Profil Mitra', href: '/mitra/profil' },
];

type Props = {
    mitra: Mitra;
    dokumen_wajib: string[];
};

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
    draft:                { label: 'Draft',                variant: 'secondary',    icon: <Clock className="h-4 w-4" /> },
    menunggu_verifikasi:  { label: 'Menunggu Verifikasi',  variant: 'outline',      icon: <Clock className="h-4 w-4" /> },
    diverifikasi:         { label: 'Diverifikasi',         variant: 'default',      icon: <CheckCircle2 className="h-4 w-4" /> },
    ditolak:              { label: 'Ditolak',              variant: 'destructive',  icon: <XCircle className="h-4 w-4" /> },
    aktif:                { label: 'Aktif',                variant: 'default',      icon: <CheckCircle2 className="h-4 w-4" /> },
    nonaktif:             { label: 'Nonaktif',             variant: 'secondary',    icon: <XCircle className="h-4 w-4" /> },
};

const DOK_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    menunggu: { label: 'Menunggu', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
    diterima: { label: 'Diterima', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
    ditolak:  { label: 'Ditolak',  className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
};

const JENIS_LEMBAGA_OPTIONS = [
    { value: 'perguruan_tinggi',  label: 'Perguruan Tinggi' },
    { value: 'lembaga_pelatihan', label: 'Lembaga Pelatihan' },
    { value: 'perusahaan',        label: 'Perusahaan' },
    { value: 'lsm',               label: 'LSM' },
    { value: 'instansi_pemerintah', label: 'Instansi Pemerintah' },
    { value: 'lainnya',           label: 'Lainnya' },
];

const DOKUMEN_LABELS: Record<string, string> = {
    ad_art:           'AD/ART',
    akta_pendirian:   'Akta Pendirian',
    sk_pendirian:     'SK Pendirian',
    sk_penandatangan: 'SK Penandatangan',
    nib:              'NIB',
    npwp:             'NPWP',
    profil_lembaga:   'Profil Lembaga',
    logo:             'Logo',
    lainnya:          'Lainnya',
};

const DOKUMEN_OPSIONAL = ['sk_pendirian', 'sk_penandatangan', 'nib', 'npwp', 'profil_lembaga', 'logo'];

function DokumenUploadCard({
    jenis,
    label,
    dokumen,
    onUpload,
    onDelete,
    uploading,
}: {
    jenis: string;
    label: string;
    dokumen?: DokumenMitra;
    onUpload: (jenis: string, file: File) => void;
    onDelete: (dokumen: DokumenMitra) => void;
    uploading: boolean;
}) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [drag, setDrag] = useState(false);

    const handleFile = (file: File) => onUpload(jenis, file);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDrag(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const statusCfg = dokumen ? DOK_STATUS_CONFIG[dokumen.status] : null;

    return (
        <div
            className={`rounded-lg border-2 border-dashed p-4 transition-colors ${drag ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}`}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={handleDrop}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{label}</p>
                        {dokumen ? (
                            <div className="flex items-center gap-2 flex-wrap mt-1">
                                <span className="text-xs text-muted-foreground truncate max-w-[180px]">{dokumen.nama_file}</span>
                                <span className="text-xs text-muted-foreground">({dokumen.file_size_formatted})</span>
                                {statusCfg && (
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusCfg.className}`}>
                                        {statusCfg.label}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground mt-0.5">Belum diupload · PDF/JPG/PNG max 10MB</p>
                        )}
                        {dokumen?.catatan && dokumen.status === 'ditolak' && (
                            <p className="text-xs text-destructive mt-1">Catatan: {dokumen.catatan}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    {dokumen && dokumen.status !== 'diterima' && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => onDelete(dokumen)}
                            disabled={uploading}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading || dokumen?.status === 'diterima'}
                    >
                        {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                        <span className="ml-1">{dokumen ? 'Ganti' : 'Upload'}</span>
                    </Button>
                </div>
            </div>

            <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                    e.target.value = '';
                }}
            />
        </div>
    );
}

export default function MitraProfilEdit({ mitra, dokumen_wajib }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        nama_lembaga:  mitra.nama_lembaga ?? '',
        jenis_lembaga: mitra.jenis_lembaga ?? '',
        bidang_kerja:  mitra.bidang_kerja ?? '',
        deskripsi:     mitra.deskripsi ?? '',
        alamat:        mitra.alamat ?? '',
        kota:          mitra.kota ?? '',
        provinsi:      mitra.provinsi ?? '',
        kode_pos:      mitra.kode_pos ?? '',
        website:       mitra.website ?? '',
        telepon:       mitra.telepon ?? '',
        email_lembaga: mitra.email_lembaga ?? '',
        pic_nama:      mitra.pic_nama ?? '',
        pic_jabatan:   mitra.pic_jabatan ?? '',
        pic_telepon:   mitra.pic_telepon ?? '',
        pic_email:     mitra.pic_email ?? '',
        nomor_akta:    mitra.nomor_akta ?? '',
        nomor_nib:     mitra.nomor_nib ?? '',
        nomor_npwp:    mitra.nomor_npwp ?? '',
    });

    const [uploadingJenis, setUploadingJenis] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<DokumenMitra | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const dokumenMap = Object.fromEntries(
        (mitra.dokumens ?? []).map((d) => [d.jenis_dokumen, d])
    );

    const missingItems: string[] = [];
    if (!mitra.is_profile_complete) missingItems.push('Lengkapi data profil (field wajib belum semua terisi)');
    if (!mitra.is_documents_complete) {
        for (const j of dokumen_wajib) {
            const dok = dokumenMap[j];
            if (!dok || dok.status === 'ditolak') {
                missingItems.push(`Upload dokumen: ${DOKUMEN_LABELS[j]}`);
            }
        }
    }

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        put('/mitra/profil');
    };

    const handleUpload = (jenis: string, file: File) => {
        setUploadingJenis(jenis);
        const form = new FormData();
        form.append('jenis_dokumen', jenis);
        form.append('file', file);
        router.post('/mitra/profil/dokumen', form, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => setUploadingJenis(null),
        });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        router.delete(`/mitra/profil/dokumen/${deleteTarget.id}`, {
            preserveScroll: true,
            onFinish: () => setDeleteTarget(null),
        });
    };

    const handleSubmit = () => {
        setSubmitting(true);
        router.post('/mitra/profil/submit', {}, {
            preserveScroll: true,
            onFinish: () => setSubmitting(false),
        });
    };

    const statusCfg = STATUS_CONFIG[mitra.status] ?? STATUS_CONFIG.draft;
    const canEdit   = !['menunggu_verifikasi', 'diverifikasi', 'aktif'].includes(mitra.status);
    const canSubmit = mitra.can_submit && mitra.status === 'draft';

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-4xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-bold">Profil Mitra</h1>
                        <p className="text-muted-foreground text-sm mt-1">Lengkapi data lembaga untuk proses kerjasama</p>
                    </div>
                    <Badge variant={statusCfg.variant} className="flex items-center gap-1.5 px-3 py-1.5 text-sm">
                        {statusCfg.icon}
                        {statusCfg.label}
                    </Badge>
                </div>

                {/* Tolak alert */}
                {mitra.status === 'ditolak' && mitra.catatan_admin && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Profil Ditolak</AlertTitle>
                        <AlertDescription>{mitra.catatan_admin}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSave} className="flex flex-col gap-6">
                    {/* Section 1: Data Lembaga */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Data Lembaga</CardTitle>
                            <CardDescription>Informasi dasar tentang lembaga Anda</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div className="md:col-span-2 grid gap-1.5">
                                <Label htmlFor="nama_lembaga">Nama Lembaga <span className="text-destructive">*</span></Label>
                                <Input
                                    id="nama_lembaga"
                                    value={data.nama_lembaga}
                                    onChange={(e) => setData('nama_lembaga', e.target.value)}
                                    disabled={!canEdit}
                                />
                                {errors.nama_lembaga && <p className="text-xs text-destructive">{errors.nama_lembaga}</p>}
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="jenis_lembaga">Jenis Lembaga <span className="text-destructive">*</span></Label>
                                <Select
                                    value={data.jenis_lembaga}
                                    onValueChange={(v) => setData('jenis_lembaga', v)}
                                    disabled={!canEdit}
                                >
                                    <SelectTrigger id="jenis_lembaga">
                                        <SelectValue placeholder="Pilih jenis lembaga" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {JENIS_LEMBAGA_OPTIONS.map((o) => (
                                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.jenis_lembaga && <p className="text-xs text-destructive">{errors.jenis_lembaga}</p>}
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="bidang_kerja">Bidang Kerja <span className="text-destructive">*</span></Label>
                                <Input
                                    id="bidang_kerja"
                                    value={data.bidang_kerja}
                                    onChange={(e) => setData('bidang_kerja', e.target.value)}
                                    disabled={!canEdit}
                                />
                                {errors.bidang_kerja && <p className="text-xs text-destructive">{errors.bidang_kerja}</p>}
                            </div>

                            <div className="md:col-span-2 grid gap-1.5">
                                <Label htmlFor="deskripsi">Deskripsi</Label>
                                <Textarea
                                    id="deskripsi"
                                    rows={3}
                                    value={data.deskripsi}
                                    onChange={(e) => setData('deskripsi', e.target.value)}
                                    disabled={!canEdit}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 2: Alamat & Kontak */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Alamat &amp; Kontak</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div className="md:col-span-2 grid gap-1.5">
                                <Label htmlFor="alamat">Alamat</Label>
                                <Textarea
                                    id="alamat"
                                    rows={2}
                                    value={data.alamat}
                                    onChange={(e) => setData('alamat', e.target.value)}
                                    disabled={!canEdit}
                                />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="kota">Kota</Label>
                                <Input id="kota" value={data.kota} onChange={(e) => setData('kota', e.target.value)} disabled={!canEdit} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="provinsi">Provinsi</Label>
                                <Input id="provinsi" value={data.provinsi} onChange={(e) => setData('provinsi', e.target.value)} disabled={!canEdit} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="kode_pos">Kode Pos</Label>
                                <Input id="kode_pos" value={data.kode_pos} onChange={(e) => setData('kode_pos', e.target.value)} disabled={!canEdit} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="website">Website</Label>
                                <Input id="website" type="url" placeholder="https://" value={data.website} onChange={(e) => setData('website', e.target.value)} disabled={!canEdit} />
                                {errors.website && <p className="text-xs text-destructive">{errors.website}</p>}
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="telepon">Telepon <span className="text-destructive">*</span></Label>
                                <Input id="telepon" value={data.telepon} onChange={(e) => setData('telepon', e.target.value)} disabled={!canEdit} />
                                {errors.telepon && <p className="text-xs text-destructive">{errors.telepon}</p>}
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="email_lembaga">Email Lembaga <span className="text-destructive">*</span></Label>
                                <Input id="email_lembaga" type="email" value={data.email_lembaga} onChange={(e) => setData('email_lembaga', e.target.value)} disabled={!canEdit} />
                                {errors.email_lembaga && <p className="text-xs text-destructive">{errors.email_lembaga}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 3: PIC */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Person in Charge (PIC)</CardTitle>
                            <CardDescription>Penanggung jawab yang bisa dihubungi</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-1.5">
                                <Label htmlFor="pic_nama">Nama PIC <span className="text-destructive">*</span></Label>
                                <Input id="pic_nama" value={data.pic_nama} onChange={(e) => setData('pic_nama', e.target.value)} disabled={!canEdit} />
                                {errors.pic_nama && <p className="text-xs text-destructive">{errors.pic_nama}</p>}
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="pic_jabatan">Jabatan <span className="text-destructive">*</span></Label>
                                <Input id="pic_jabatan" value={data.pic_jabatan} onChange={(e) => setData('pic_jabatan', e.target.value)} disabled={!canEdit} />
                                {errors.pic_jabatan && <p className="text-xs text-destructive">{errors.pic_jabatan}</p>}
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="pic_telepon">Telepon PIC <span className="text-destructive">*</span></Label>
                                <Input id="pic_telepon" value={data.pic_telepon} onChange={(e) => setData('pic_telepon', e.target.value)} disabled={!canEdit} />
                                {errors.pic_telepon && <p className="text-xs text-destructive">{errors.pic_telepon}</p>}
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="pic_email">Email PIC <span className="text-destructive">*</span></Label>
                                <Input id="pic_email" type="email" value={data.pic_email} onChange={(e) => setData('pic_email', e.target.value)} disabled={!canEdit} />
                                {errors.pic_email && <p className="text-xs text-destructive">{errors.pic_email}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 4: Legalitas */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Legalitas</CardTitle>
                            <CardDescription>Nomor dokumen legalitas (opsional, bisa diisi nanti)</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-3">
                            <div className="grid gap-1.5">
                                <Label htmlFor="nomor_akta">Nomor Akta Pendirian / SK</Label>
                                <Input id="nomor_akta" value={data.nomor_akta} onChange={(e) => setData('nomor_akta', e.target.value)} disabled={!canEdit} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="nomor_nib">Nomor NIB</Label>
                                <Input id="nomor_nib" value={data.nomor_nib} onChange={(e) => setData('nomor_nib', e.target.value)} disabled={!canEdit} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="nomor_npwp">Nomor NPWP</Label>
                                <Input id="nomor_npwp" value={data.nomor_npwp} onChange={(e) => setData('nomor_npwp', e.target.value)} disabled={!canEdit} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tombol Simpan */}
                    {canEdit && (
                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing}>
                                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Simpan
                            </Button>
                        </div>
                    )}
                </form>

                {/* Section 5: Dokumen Wajib */}
                <Card>
                    <CardHeader>
                        <CardTitle>Dokumen Wajib</CardTitle>
                        <CardDescription>Dokumen berikut harus diupload sebelum bisa submit</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        {dokumen_wajib.map((jenis) => (
                            <DokumenUploadCard
                                key={jenis}
                                jenis={jenis}
                                label={DOKUMEN_LABELS[jenis] ?? jenis}
                                dokumen={dokumenMap[jenis]}
                                onUpload={handleUpload}
                                onDelete={setDeleteTarget}
                                uploading={uploadingJenis === jenis}
                            />
                        ))}
                    </CardContent>
                </Card>

                {/* Section 6: Dokumen Opsional */}
                <Card>
                    <CardHeader>
                        <CardTitle>Dokumen Opsional</CardTitle>
                        <CardDescription>Dokumen pendukung tambahan (tidak wajib)</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        {DOKUMEN_OPSIONAL.map((jenis) => (
                            <DokumenUploadCard
                                key={jenis}
                                jenis={jenis}
                                label={DOKUMEN_LABELS[jenis] ?? jenis}
                                dokumen={dokumenMap[jenis]}
                                onUpload={handleUpload}
                                onDelete={setDeleteTarget}
                                uploading={uploadingJenis === jenis}
                            />
                        ))}
                    </CardContent>
                </Card>

                {/* Submit section */}
                {mitra.status === 'draft' && (
                    <Card className={canSubmit ? 'border-primary' : ''}>
                        <CardHeader>
                            <CardTitle>Submit untuk Verifikasi</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            {missingItems.length > 0 && (
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Belum bisa disubmit</AlertTitle>
                                    <AlertDescription>
                                        <ul className="list-disc list-inside mt-1 space-y-0.5">
                                            {missingItems.map((item, i) => (
                                                <li key={i} className="text-sm">{item}</li>
                                            ))}
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            )}
                            <div className="flex justify-end">
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!canSubmit || submitting}
                                    className="min-w-[180px]"
                                >
                                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Submit untuk Verifikasi
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Delete dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Dokumen</DialogTitle>
                        <DialogDescription>
                            Hapus <strong>{deleteTarget ? DOKUMEN_LABELS[deleteTarget.jenis_dokumen] : ''}</strong>? Kamu perlu upload ulang jika ingin menyertakannya.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Batal</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
