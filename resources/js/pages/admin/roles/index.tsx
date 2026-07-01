import { router, useForm } from '@inertiajs/react';
import { Edit2, Plus, Shield, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Role Management', href: '/admin/roles' },
];

type RoleItem = {
    id: number;
    name: string;
    users_count: number;
    permissions_count: number;
};

type Props = {
    roles: RoleItem[];
    filters: { search?: string };
};

export default function RolesIndex({ roles, filters }: Props) {
    const [search, setSearch]           = useState(filters.search ?? '');
    const [createOpen, setCreateOpen]   = useState(false);
    const [editTarget, setEditTarget]   = useState<RoleItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<RoleItem | null>(null);

    const createForm = useForm({ name: '' });
    const editForm   = useForm({ name: '' });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/roles', {
            onSuccess: () => { setCreateOpen(false); createForm.reset(); },
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editTarget) return;
        editForm.patch(`/admin/roles/${editTarget.id}`, {
            onSuccess: () => setEditTarget(null),
        });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        router.delete(`/admin/roles/${deleteTarget.id}`, {
            onFinish: () => setDeleteTarget(null),
        });
    };

    const openEdit = (role: RoleItem) => {
        editForm.setData('name', role.name);
        setEditTarget(role);
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Role Management</h1>
                        <p className="text-muted-foreground text-sm">{roles.length} role terdaftar</p>
                    </div>
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />Buat Role
                    </Button>
                </div>

                {/* Search */}
                <div className="flex items-center gap-3">
                    <Input
                        placeholder="Cari role..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-64 h-9"
                    />
                </div>

                {/* Table */}
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-center">
                                    <span className="flex items-center justify-center gap-1">
                                        <Users className="h-3.5 w-3.5" />Users
                                    </span>
                                </TableHead>
                                <TableHead className="text-center">
                                    <span className="flex items-center justify-center gap-1">
                                        <Shield className="h-3.5 w-3.5" />Permissions
                                    </span>
                                </TableHead>
                                <TableHead className="w-24" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles
                                .filter((r) => !search || r.name.toLowerCase().includes(search.toLowerCase()))
                                .map((role) => (
                                <TableRow key={role.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {role.name}
                                            {role.name === 'super_admin' && (
                                                <Badge variant="secondary" className="text-xs">protected</Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline">{role.users_count}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline">{role.permissions_count}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {role.name !== 'super_admin' && (
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost" size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                    onClick={() => openEdit(role)}
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost" size="icon"
                                                    className="text-destructive hover:text-destructive h-8 w-8"
                                                    disabled={role.users_count > 0}
                                                    title={role.users_count > 0 ? 'Role masih dipakai user' : 'Hapus role'}
                                                    onClick={() => setDeleteTarget(role)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}

                            {roles.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-muted-foreground py-10 text-center">
                                        Belum ada role.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Create dialog */}
            <Dialog open={createOpen} onOpenChange={(o) => { if (!o) { setCreateOpen(false); createForm.reset(); } }}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Buat Role Baru</DialogTitle>
                        <DialogDescription>Gunakan huruf kecil, angka, dan underscore.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="create-name">Role Name</Label>
                            <Input
                                id="create-name"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                placeholder="contoh: editor"
                                aria-invalid={!!createForm.errors.name}
                            />
                            {createForm.errors.name && <p className="text-destructive text-xs">{createForm.errors.name}</p>}
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="outline" type="button">Batal</Button></DialogClose>
                            <Button type="submit" disabled={createForm.processing}>Buat</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit dialog */}
            <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Ubah Role</DialogTitle>
                        <DialogDescription>Ubah nama role <strong>{editTarget?.name}</strong>.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="edit-name">Role Name</Label>
                            <Input
                                id="edit-name"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                aria-invalid={!!editForm.errors.name}
                            />
                            {editForm.errors.name && <p className="text-destructive text-xs">{editForm.errors.name}</p>}
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="outline" type="button">Batal</Button></DialogClose>
                            <Button type="submit" disabled={editForm.processing}>Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Hapus Role</DialogTitle>
                        <DialogDescription>
                            Hapus role <strong>{deleteTarget?.name}</strong>? Aksi ini tidak bisa dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
