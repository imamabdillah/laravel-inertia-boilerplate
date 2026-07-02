export type TagOption = { value: string; label: string };

export const JENJANG_LABELS: Record<string, string> = {
    paud_tk: 'PAUD/TK',
    sd: 'SD',
    smp: 'SMP',
    sma: 'SMA',
    smk: 'SMK',
};

export const WILAYAH_LABELS: Record<string, string> = {
    jawa_barat: 'Jawa Barat',
};

export const UPT_LABELS: Record<string, string> = {
    bgtk_jawa_barat: 'BGTK Jawa Barat',
};

export function toTagOptions(labels: Record<string, string>, values: string[]): TagOption[] {
    return values.map((value) => ({ value, label: labels[value] ?? value }));
}
