import { Link, router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { BreadcrumbItem, Mitra, PaginatedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Mitra', href: '/admin/mitras' },
];

type Props = {
    mitras: PaginatedData<Mitra>;
    filters: { search?: string; status?: string };
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
    draft:               { label: 'Draft',                className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
    menunggu_verifikasi: { label: 'Menunggu Verifikasi',  className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
    diverifikasi:        { label: 'Diverifikasi',         className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
    ditolak:             { label: 'Ditolak',              className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
    aktif:               { label: 'Aktif',                className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
    nonaktif:            { label: 'Nonaktif',             className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
};

const JENIS_LABELS: Record<string, string> = {
    perguruan_tinggi:   'Perguruan Tinggi',
    lembaga_pelatihan:  'Lembaga Pelatihan',
    perusahaan:         'Perusahaan',
    lsm:                'LSM',
    instansi_pemerintah: 'Instansi Pemerintah',
    lainnya:            'Lainnya',
};

const STATUS_OPTIONS = [
    { value: 'draft',               label: 'Draft' },
    { value: 'menunggu_verifikasi', label: 'Menunggu Verifikasi' },
    { value: 'diverifikasi',        label: 'Diverifikasi' },
    { value: 'ditolak',             label: 'Ditolak' },
    { value: 'aktif',               label: 'Aktif' },
    { value: 'nonaktif',            label: 'Nonaktif' },
];

export default function AdminMitrasIndex({ mitras, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const applyFilters = useCallback(
        (overrides: Record<string, string | undefined>) => {
            router.get(
                '/admin/mitras',
                { search: filters.search, status: filters.status, ...overrides },
                { preserveState: true, replace: true },
            );
        },
        [filters],
    );

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            if (search !== (filters.search ?? '')) {
                applyFilters({ search: search || undefined, page: undefined });
            }
        }, 400);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [search]);

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Mitra</h1>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Input
                        placeholder="Cari nama lembaga, PIC, email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="sm:max-w-xs"
                    />
                    <Select
                        value={filters.status ?? 'all'}
                        onValueChange={(v) => applyFilters({ status: v === 'all' ? undefined : v, page: undefined })}
                    >
                        <SelectTrigger className="sm:w-48">
                            <SelectValue placeholder="Semua Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            {STATUS_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama Lembaga</TableHead>
                                <TableHead>Jenis</TableHead>
                                <TableHead>PIC</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Tanggal Daftar</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mitras.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                        Tidak ada data mitra.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                mitras.data.map((mitra) => {
                                    const badge = STATUS_BADGE[mitra.status] ?? STATUS_BADGE.draft;
                                    return (
                                        <TableRow
                                            key={mitra.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => router.get(`/admin/mitras/${mitra.id}`)}
                                        >
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{mitra.nama_lembaga}</p>
                                                    <p className="text-xs text-muted-foreground">{mitra.email_lembaga}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                <div>
                                                    <p>{JENIS_LABELS[mitra.jenis_lembaga] ?? mitra.jenis_lembaga}</p>
                                                    {mitra.jenis_lembaga === 'lainnya' && mitra.jenis_lembaga_lainnya && (
                                                        <p className="text-xs text-muted-foreground">{mitra.jenis_lembaga_lainnya}</p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="text-sm">{mitra.pic_nama}</p>
                                                    <p className="text-xs text-muted-foreground">{mitra.pic_jabatan}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
                                                    {badge.label}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {new Date(mitra.created_at).toLocaleDateString('id-ID')}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {mitras.meta.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-muted-foreground text-sm">
                            Menampilkan {mitras.meta.from}–{mitras.meta.to} dari {mitras.meta.total}
                        </p>
                        <div className="flex gap-1">
                            {mitras.meta.links.map((link, i) => (
                                <Button
                                    key={i}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
