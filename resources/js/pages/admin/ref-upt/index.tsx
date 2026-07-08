import { router, useForm } from '@inertiajs/react';
import { Building2, Edit2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import refUpt from '@/routes/admin/ref-upt';
import type { BreadcrumbItem, PaginatedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Ref UPT', href: refUpt.index().url },
];

type RefUptItem = {
    id: number;
    code: string;
    name: string;
    order: number;
    is_active: boolean;
    created_at: string | null;
};

type Props = {
    upts: PaginatedData<RefUptItem>;
    filters: { search?: string; status?: string };
};

export default function RefUptIndex({ upts, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? 'all');
    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<RefUptItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<RefUptItem | null>(null);

    const createForm = useForm({ name: '', order: '' });
    const editForm = useForm({ name: '', order: '' });

    const debounce = useRef<ReturnType<typeof setTimeout>>(null);
    const firstRender = useRef(true);

    const applyFilters = (overrides: Record<string, string> = {}) => {
        const params: Record<string, string> = {
            search,
            status: status === 'all' ? '' : status,
            ...overrides,
        };
        Object.keys(params).forEach(
            (k) => params[k] === '' && delete params[k],
        );
        router.get(refUpt.index().url, params, {
            preserveState: true,
            replace: true,
        });
    };

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;

            return;
        }

        if (debounce.current) {
            clearTimeout(debounce.current);
        }

        debounce.current = setTimeout(() => applyFilters(), 400);

        return () => {
            if (debounce.current) {
                clearTimeout(debounce.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(refUpt.store().url, {
            preserveScroll: true,
            onSuccess: () => {
                setCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editTarget) {
            return;
        }

        editForm.patch(refUpt.update(editTarget.id).url, {
            preserveScroll: true,
            onSuccess: () => setEditTarget(null),
        });
    };

    const handleDelete = () => {
        if (!deleteTarget) {
            return;
        }

        router.delete(refUpt.destroy(deleteTarget.id).url, {
            preserveScroll: true,
            onFinish: () => setDeleteTarget(null),
        });
    };

    const handleToggle = (item: RefUptItem) => {
        router.patch(
            refUpt.toggleActive(item.id).url,
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    const openEdit = (item: RefUptItem) => {
        editForm.setData({ name: item.name, order: String(item.order) });
        setEditTarget(item);
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Referensi UPT
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {upts.meta.total} UPT terdaftar — dipakai sebagai
                            pilihan tag UPT di profil mitra
                        </p>
                    </div>
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah UPT
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3">
                    <Input
                        placeholder="Cari nama UPT..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-9 w-64"
                    />
                    <Select
                        value={status}
                        onValueChange={(v) => {
                            setStatus(v);
                            applyFilters({ status: v === 'all' ? '' : v });
                        }}
                    >
                        <SelectTrigger className="h-9 w-36">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="1">Aktif</SelectItem>
                            <SelectItem value="0">Nonaktif</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16 text-center">
                                    No
                                </TableHead>
                                <TableHead>Nama UPT</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead className="w-24 text-center">
                                    Status
                                </TableHead>
                                <TableHead className="w-24" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {upts.data.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="text-center text-muted-foreground">
                                        {item.order}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            {item.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className="font-mono text-xs"
                                        >
                                            {item.code}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Switch
                                            checked={item.is_active}
                                            onCheckedChange={() =>
                                                handleToggle(item)
                                            }
                                            aria-label="Toggle aktif"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                onClick={() => openEdit(item)}
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() =>
                                                    setDeleteTarget(item)
                                                }
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {upts.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        Tidak ada UPT ditemukan.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {upts.meta.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Menampilkan {upts.meta.from}–{upts.meta.to} dari{' '}
                            {upts.meta.total}
                        </p>
                        <div className="flex gap-1">
                            {upts.meta.links.map((link, i) => (
                                <Button
                                    key={i}
                                    variant={
                                        link.active ? 'default' : 'outline'
                                    }
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() =>
                                        link.url &&
                                        router.get(
                                            link.url,
                                            {},
                                            { preserveState: true },
                                        )
                                    }
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Create dialog */}
            <Dialog
                open={createOpen}
                onOpenChange={(o) => {
                    if (!o) {
                        setCreateOpen(false);
                        createForm.reset();
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tambah UPT</DialogTitle>
                        <DialogDescription>
                            Code dibuat otomatis dari nama UPT.
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={handleCreate}
                        className="flex flex-col gap-4"
                    >
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="create-name">Nama UPT</Label>
                            <Input
                                id="create-name"
                                value={createForm.data.name}
                                onChange={(e) =>
                                    createForm.setData('name', e.target.value)
                                }
                                placeholder="contoh: BGTK Provinsi Aceh"
                                aria-invalid={!!createForm.errors.name}
                            />
                            {createForm.errors.name && (
                                <p className="text-xs text-destructive">
                                    {createForm.errors.name}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="create-order">
                                Urutan (opsional)
                            </Label>
                            <Input
                                id="create-order"
                                type="number"
                                min={0}
                                value={createForm.data.order}
                                onChange={(e) =>
                                    createForm.setData('order', e.target.value)
                                }
                                placeholder="Kosongkan untuk taruh di akhir"
                                aria-invalid={!!createForm.errors.order}
                            />
                            {createForm.errors.order && (
                                <p className="text-xs text-destructive">
                                    {createForm.errors.order}
                                </p>
                            )}
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" type="button">
                                    Batal
                                </Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                disabled={createForm.processing}
                            >
                                Simpan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit dialog */}
            <Dialog
                open={!!editTarget}
                onOpenChange={(o) => !o && setEditTarget(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Ubah UPT</DialogTitle>
                        <DialogDescription>
                            Code{' '}
                            <span className="font-mono">
                                {editTarget?.code}
                            </span>{' '}
                            tidak berubah karena sudah dipakai sebagai value tag
                            di data mitra.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="edit-name">Nama UPT</Label>
                            <Input
                                id="edit-name"
                                value={editForm.data.name}
                                onChange={(e) =>
                                    editForm.setData('name', e.target.value)
                                }
                                aria-invalid={!!editForm.errors.name}
                            />
                            {editForm.errors.name && (
                                <p className="text-xs text-destructive">
                                    {editForm.errors.name}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="edit-order">Urutan</Label>
                            <Input
                                id="edit-order"
                                type="number"
                                min={0}
                                value={editForm.data.order}
                                onChange={(e) =>
                                    editForm.setData('order', e.target.value)
                                }
                                aria-invalid={!!editForm.errors.order}
                            />
                            {editForm.errors.order && (
                                <p className="text-xs text-destructive">
                                    {editForm.errors.order}
                                </p>
                            )}
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" type="button">
                                    Batal
                                </Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                            >
                                Simpan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete dialog */}
            <Dialog
                open={!!deleteTarget}
                onOpenChange={(o) => !o && setDeleteTarget(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Hapus UPT</DialogTitle>
                        <DialogDescription>
                            Hapus <strong>{deleteTarget?.name}</strong>? UPT
                            yang masih dipakai di profil mitra tidak bisa
                            dihapus — nonaktifkan saja.
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
