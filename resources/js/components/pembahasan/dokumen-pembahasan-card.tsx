import { router } from '@inertiajs/react';
import {
    ExternalLink,
    FileText,
    FolderOpen,
    Loader2,
    Trash2,
    Upload,
} from 'lucide-react';
import { useRef, useState } from 'react';
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
import pembahasanRoutes from '@/routes/pembahasan';
import type { Pembahasan, PembahasanDokumen } from '@/types';

type Props = {
    pembahasan: Pembahasan;
    jenisLabels: Record<string, string>;
    tahapLabels: Record<string, string>;
    canUpload: boolean;
    readOnly?: boolean;
};

function JenisSection({
    pembahasan,
    jenis,
    label,
    tahapLabels,
    dokumens,
    canUpload,
    readOnly,
    onDelete,
}: {
    pembahasan: Pembahasan;
    jenis: string;
    label: string;
    tahapLabels: Record<string, string>;
    dokumens: PembahasanDokumen[];
    canUpload: boolean;
    readOnly: boolean;
    onDelete: (dokumen: PembahasanDokumen) => void;
}) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [drag, setDrag] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleFile = (file: File) => {
        setUploading(true);
        router.post(
            pembahasanRoutes.dokumen.store(pembahasan.id).url,
            { jenis, file },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setUploading(false),
            },
        );
    };

    return (
        <div
            className={`rounded-lg border-2 border-dashed p-4 transition-colors ${
                drag && canUpload
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25'
            }`}
            onDragOver={(e) => {
                if (!canUpload) {
                    return;
                }
                e.preventDefault();
                setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
                if (!canUpload) {
                    return;
                }
                e.preventDefault();
                setDrag(false);
                const file = e.dataTransfer.files[0];

                if (file) {
                    handleFile(file);
                }
            }}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{label}</p>
                    {dokumens.length === 0 && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {canUpload
                                ? 'Belum diupload · PDF/JPG/PNG max 10MB'
                                : 'Belum ada dokumen'}
                        </p>
                    )}
                </div>
                {canUpload && !readOnly && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 shrink-0 text-xs"
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                            <Upload className="h-3 w-3" />
                        )}
                        <span className="ml-1">Upload</span>
                    </Button>
                )}
            </div>

            {dokumens.length > 0 && (
                <div className="mt-3 flex flex-col gap-2">
                    {dokumens.map((dok) => (
                        <div
                            key={dok.id}
                            className="flex items-center justify-between gap-3 rounded-md border bg-background p-2.5"
                        >
                            <div className="flex min-w-0 items-center gap-2">
                                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <div className="min-w-0">
                                    <p className="truncate text-sm">
                                        {dok.label || dok.nama_file}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {dok.file_size_formatted}
                                        {dok.tahap &&
                                            ` · Tahap ${tahapLabels[dok.tahap] ?? dok.tahap}`}
                                        {dok.uploaded_by &&
                                            ` · ${dok.uploaded_by}`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    asChild
                                >
                                    <a
                                        href={dok.file_url}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                </Button>
                                {canUpload && !readOnly && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-destructive"
                                        onClick={() => onDelete(dok)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (file) {
                        handleFile(file);
                    }

                    e.target.value = '';
                }}
            />
        </div>
    );
}

export default function DokumenPembahasanCard({
    pembahasan,
    jenisLabels,
    tahapLabels,
    canUpload,
    readOnly = false,
}: Props) {
    const [deleteTarget, setDeleteTarget] = useState<PembahasanDokumen | null>(
        null,
    );

    const dokumen = pembahasan.dokumen ?? [];
    const jenisList = readOnly
        ? Object.keys(jenisLabels).filter((jenis) =>
              dokumen.some((d) => d.collection === jenis),
          )
        : Object.keys(jenisLabels);

    const confirmDelete = () => {
        if (!deleteTarget) {
            return;
        }

        router.delete(
            pembahasanRoutes.dokumen.destroy({
                pembahasan: pembahasan.id,
                media: deleteTarget.id,
            }).url,
            {
                preserveScroll: true,
                onFinish: () => setDeleteTarget(null),
            },
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <FolderOpen className="h-4 w-4" />
                    Dokumen Pembahasan
                </CardTitle>
            </CardHeader>
            <CardContent>
                {jenisList.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Belum ada dokumen.
                    </p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {jenisList.map((jenis) => (
                            <JenisSection
                                key={jenis}
                                pembahasan={pembahasan}
                                jenis={jenis}
                                label={jenisLabels[jenis] ?? jenis}
                                tahapLabels={tahapLabels}
                                dokumens={dokumen.filter(
                                    (d) => d.collection === jenis,
                                )}
                                canUpload={canUpload}
                                readOnly={readOnly}
                                onDelete={setDeleteTarget}
                            />
                        ))}
                    </div>
                )}
            </CardContent>

            <Dialog
                open={deleteTarget !== null}
                onOpenChange={(o) => {
                    if (!o) {
                        setDeleteTarget(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Dokumen</DialogTitle>
                        <DialogDescription>
                            Hapus <strong>{deleteTarget?.nama_file}</strong>?
                            Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Batal</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={confirmDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
