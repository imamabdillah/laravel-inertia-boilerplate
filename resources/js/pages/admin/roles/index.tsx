import { router, useForm } from '@inertiajs/react';
import { Edit2, MoreHorizontal, Plus, Settings2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Roles', href: '/admin/roles' },
];

type PermissionGroup = { group: string; permissions: string[] };

type RoleItem = {
    id: number;
    name: string;
    users_count: number;
    permissions_count: number;
    permissions: string[];
    is_protected: boolean;
};

type Props = {
    roles: RoleItem[];
    permissions: PermissionGroup[];
    filters: { search?: string };
};

export default function RolesIndex({ roles, permissions, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<RoleItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<RoleItem | null>(null);
    const [permTarget, setPermTarget] = useState<RoleItem | null>(null);
    const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

    const createForm = useForm({ name: '' });
    const editForm = useForm({ name: '' });

    useEffect(() => {
        const t = setTimeout(() => {
            router.get('/admin/roles', { search: search || undefined }, { preserveState: true, replace: true });
        }, 400);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        if (editTarget) editForm.setData('name', editTarget.name);
    }, [editTarget]);

    useEffect(() => {
        if (permTarget) setSelectedPerms([...permTarget.permissions]);
    }, [permTarget]);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/roles', { onSuccess: () => { setCreateOpen(false); createForm.reset(); } });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editTarget) return;
        editForm.patch(`/admin/roles/${editTarget.id}`, { onSuccess: () => setEditTarget(null) });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        router.delete(`/admin/roles/${deleteTarget.id}`, { onFinish: () => setDeleteTarget(null) });
    };

    const handleSyncPerms = () => {
        if (!permTarget) return;
        router.patch(
            `/admin/roles/${permTarget.id}/sync-permissions`,
            { permissions: selectedPerms },
            { onSuccess: () => setPermTarget(null) },
        );
    };

    const togglePerm = (name: string) => {
        setSelectedPerms((prev) => prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]);
    };

    const toggleGroup = (group: PermissionGroup) => {
        const all = group.permissions;
        const allSelected = all.every((p) => selectedPerms.includes(p));
        if (allSelected) {
            setSelectedPerms((prev) => prev.filter((p) => !all.includes(p)));
        } else {
            setSelectedPerms((prev) => [...new Set([...prev, ...all])]);
        }
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Roles</h1>
                        <p className="text-muted-foreground text-sm">{roles.length} roles terdaftar</p>
                    </div>
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Role
                    </Button>
                </div>

                <Input
                    placeholder="Search roles..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-64"
                />

                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Role Name</TableHead>
                                <TableHead>Users</TableHead>
                                <TableHead>Permissions</TableHead>
                                <TableHead className="w-12" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-muted-foreground py-12 text-center">No roles found.</TableCell>
                                </TableRow>
                            ) : (
                                roles.map((role) => (
                                    <TableRow key={role.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                {role.name}
                                                {role.is_protected && (
                                                    <Badge variant="secondary" className="text-xs">protected</Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{role.users_count} users</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{role.permissions_count} permissions</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        disabled={role.is_protected}
                                                        onClick={() => setPermTarget(role)}
                                                    >
                                                        <Settings2 className="mr-2 h-4 w-4" />
                                                        Set Permissions
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        disabled={role.is_protected}
                                                        onClick={() => setEditTarget(role)}
                                                    >
                                                        <Edit2 className="mr-2 h-4 w-4" />
                                                        Rename
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        disabled={role.is_protected || role.users_count > 0}
                                                        onClick={() => setDeleteTarget(role)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Create Dialog */}
            <Dialog open={createOpen} onOpenChange={(o) => { if (!o) { setCreateOpen(false); createForm.reset(); } }}>
                <DialogContent>
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
                            {createForm.errors.name && <p className="text-destructive text-sm">{createForm.errors.name}</p>}
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="outline" type="button">Batal</Button></DialogClose>
                            <Button type="submit" disabled={createForm.processing}>Buat Role</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Rename Dialog */}
            <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename Role</DialogTitle>
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
                            {editForm.errors.name && <p className="text-destructive text-sm">{editForm.errors.name}</p>}
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="outline" type="button">Batal</Button></DialogClose>
                            <Button type="submit" disabled={editForm.processing}>Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <DialogContent>
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

            {/* Permissions Dialog */}
            <Dialog open={!!permTarget} onOpenChange={(o) => !o && setPermTarget(null)}>
                <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Set Permissions — {permTarget?.name}</DialogTitle>
                        <DialogDescription>
                            {selectedPerms.length} permission dipilih
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto pr-1">
                        <Accordion type="multiple" defaultValue={permissions.map((g) => g.group)}>
                            {permissions.map((group) => {
                                const allSelected = group.permissions.every((p) => selectedPerms.includes(p));
                                const someSelected = group.permissions.some((p) => selectedPerms.includes(p));
                                return (
                                    <AccordionItem key={group.group} value={group.group}>
                                        <AccordionTrigger className="px-1">
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    checked={allSelected}
                                                    data-state={someSelected && !allSelected ? 'indeterminate' : undefined}
                                                    onCheckedChange={() => toggleGroup(group)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className={someSelected && !allSelected ? 'opacity-60' : ''}
                                                />
                                                <span className="font-medium capitalize">{group.group}</span>
                                                <Badge variant="outline" className="ml-auto mr-2 text-xs">
                                                    {group.permissions.filter((p) => selectedPerms.includes(p)).length}/{group.permissions.length}
                                                </Badge>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="flex flex-col gap-2 pl-7">
                                                {group.permissions.map((perm) => (
                                                    <label key={perm} className="flex cursor-pointer items-center gap-2 text-sm">
                                                        <Checkbox
                                                            checked={selectedPerms.includes(perm)}
                                                            onCheckedChange={() => togglePerm(perm)}
                                                        />
                                                        <span>{perm.split('.')[1]}</span>
                                                        <span className="text-muted-foreground text-xs">({perm})</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                    </div>
                    <DialogFooter className="pt-4 border-t">
                        <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                        <Button onClick={handleSyncPerms}>Simpan Permissions</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
