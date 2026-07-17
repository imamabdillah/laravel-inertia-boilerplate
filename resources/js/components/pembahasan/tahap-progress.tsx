import { Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Pembahasan, PembahasanHistory } from '@/types';

type Props = {
    tahap: Pembahasan['tahap'];
    status: Pembahasan['status'];
    tahapLabels: Record<string, string>;
    histories?: PembahasanHistory[];
    selectedTahap?: string | null;
    onSelectTahap?: (tahap: string) => void;
};

/**
 * Chips progres 6 tahap pembahasan. Interaktif (klik tahap tercapai untuk
 * lihat histori) kalau onSelectTahap diberikan; tanpa itu render statis.
 */
export default function TahapProgress({
    tahap,
    status,
    tahapLabels,
    histories = [],
    selectedTahap = null,
    onSelectTahap,
}: Props) {
    const tahapOrder = Object.keys(tahapLabels);
    const currentIndex = tahapOrder.indexOf(tahap);
    const interactive = onSelectTahap !== undefined;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Progres Tahap</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {tahapOrder.map((t, i) => {
                        const isDone = status === 'selesai' || i < currentIndex;
                        const isCurrent =
                            i === currentIndex && status !== 'selesai';
                        const hasHistory = histories.some(
                            (h) => h.tahap === t,
                        );
                        const isSelected = selectedTahap === t;
                        const clickable = interactive && hasHistory;

                        return (
                            <button
                                key={t}
                                type="button"
                                disabled={!clickable}
                                onClick={() => onSelectTahap?.(t)}
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-opacity ${
                                    clickable
                                        ? 'cursor-pointer hover:opacity-80'
                                        : interactive
                                          ? 'cursor-not-allowed'
                                          : 'cursor-default'
                                } ${
                                    isSelected ? 'ring-2 ring-offset-1' : ''
                                } ${
                                    isDone
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                        : isCurrent
                                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                          : 'bg-muted text-muted-foreground'
                                }`}
                            >
                                {isDone && <Check className="h-3 w-3" />}
                                {tahapLabels[t]}
                            </button>
                        );
                    })}
                </div>
                {interactive && (
                    <p className="mt-2 text-xs text-muted-foreground">
                        Klik tahap yang sudah tercapai untuk melihat detail
                        historisnya.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
