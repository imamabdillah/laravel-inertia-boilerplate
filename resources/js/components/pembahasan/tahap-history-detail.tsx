import { ClipboardList, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PembahasanHistory } from '@/types';

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
            value: new Date(h.tanggal_tandatangan).toLocaleDateString('id-ID', {
                dateStyle: 'medium',
            }),
        };
    }

    return null;
}

export function DetailRow({
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

type Props = {
    tahap: string;
    histories: PembahasanHistory[];
    tahapLabels: Record<string, string>;
    onClose: () => void;
};

export default function TahapHistoryDetail({
    tahap,
    histories,
    tahapLabels,
    onClose,
}: Props) {
    const selectedHistories = histories.filter((h) => h.tahap === tahap);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2 text-base">
                    <ClipboardList className="h-4 w-4" />
                    Detail Historis — {tahapLabels[tahap] ?? tahap}
                </CardTitle>
                <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={onClose}
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
                            <div key={h.id} className="rounded-md border p-3">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm font-medium">
                                        {EVENT_LABELS[h.event] ?? h.event}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(h.created_at).toLocaleString(
                                            'id-ID',
                                            {
                                                dateStyle: 'medium',
                                                timeStyle: 'short',
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
                                    <DetailRow label="Oleh" value={h.completed_by} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
