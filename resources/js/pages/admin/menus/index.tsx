import { router, useForm } from '@inertiajs/react';
import { ChevronDown, ChevronUp, Edit2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Menus', href: '/admin/menus' },
];

const AVAILABLE_ICONS = [
    'Activity', 'AlertCircle', 'Archive', 'BarChart', 'Bell', 'BookOpen',
    'Calendar', 'ChartBar', 'ClipboardList', 'Clock', 'Cog', 'Database',
    'FileText', 'Folder', 'Globe', 'Grid', 'Home', 'Image', 'Inbox',
    'KeyRound', 'LayoutDashboard', 'List', 'Lock', 'LogOut', 'Mail',
    'Map', 'Menu', 'MessageSquare', 'Package', 'Percent', 'Phone',
    'PieChart', 'Settings', 'ShieldCheck', 'ShoppingCart', 'Star',
    'Tag', 'Truck', 'User', 'UserCheck', 'Users', 'Wallet',
];

type MenuChild = {
    id: number; name: string; icon: string | null; route: string | null;
    permission: string | null; parent_id: number | null;
    order: number; is_active: boolean;
};

type MenuItem = MenuChild & { children: MenuChild[] };

type ParentOption = { id: number; name: string };

type Props = {
    menus: MenuItem[];
    parents: ParentOption[];
};

type FormData = {
    name: string; icon: string; route: string; permission: string;
    parent_id: string; order: string; is_active: boolean;
};

const emptyForm: FormData = {
    name: '', icon: '', route: '', permission: '',
    parent_id: '', order: '0', is_active: true,
};

export default function MenusIndex({ menus, parents }: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<MenuItem | MenuChild | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<MenuItem | MenuChild | null>(null);

    const form = useForm<FormData>(emptyForm);

    const openCreate = () => {
        form.setData(emptyForm);
        form.clearErrors();
        setCreateOpen(true);
    };

    const openEdit = (item: MenuItem | MenuChild) => {
        form.setData({
            name: item.name,
            icon: item.icon ?? '',
            route: item.route ?? '',
            permission: item.permission ?? '',
            parent_id: item.parent_id ? String(item.parent_id) : '',
            order: String(item.order),
            is_active: item.is_active,
        });
        form.clearErrors();
        setEditTarget(item);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/menus', {
            onSuccess: () => { setCreateOpen(false); form.reset(); },
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editTarget) return;
        form.patch(`/admin/menus/${editTarget.id}`, {
            onSuccess: () => setEditTarget(null),
        });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        router.delete(`/admin/menus/${deleteTarget.id}`, {
            onFinish: () => setDeleteTarget(null),
        });
    };

    const handleToggle = (item: MenuItem | MenuChild) => {
        router.patch(`/admin/menus/${item.id}/toggle-active`, {}, { preserveScroll: true });
    };

    const moveItem = (items: MenuItem[], index: number, dir: 'up' | 'down') => {
        const swapIndex = dir === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= items.length) return;

        const updated = items.map((m, i) => {
            if (i === index) return { id: m.id, order: items[swapIndex].order };
            if (i === swapIndex) return { id: m.id, order: items[index].order };
            return { id: m.id, order: m.order };
        });

        router.patch('/admin/menus/reorder', { items: updated }, { preserveScroll: true });
    };

    const moveChild = (children: MenuChild[], index: number, dir: 'up' | 'down') => {
        const swapIndex = dir === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= children.length) return;

        const updated = children.map((c, i) => {
            if (i === index) return { id: c.id, order: children[swapIndex].order };
            if (i === swapIndex) return { id: c.id, order: children[index].order };
            return { id: c.id, order: c.order };
        });

        router.patch('/admin/menus/reorder', { items: updated }, { preserveScroll: true });
    };

    const MenuForm = () => (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="m-name">Name *</Label>
                    <Input id="m-name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} aria-invalid={!!form.errors.name} />
                    {form.errors.name && <p className="text-destructive text-xs">{form.errors.name}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="m-icon">Icon</Label>
                    <Select value={form.data.icon || '_none'} onValueChange={(v) => form.setData('icon', v === '_none' ? '' : v)}>
                        <SelectTrigger id="m-icon" className="w-full"><SelectValue placeholder="Pilih icon" /></SelectTrigger>
                        <SelectContent className="max-h-48">
                            <SelectItem value="_none">— Tidak ada —</SelectItem>
                            {AVAILABLE_ICONS.map((ic) => <SelectItem key={ic} value={ic}>{ic}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="m-route">Route Name</Label>
                    <Input id="m-route" value={form.data.route} onChange={(e) => form.setData('route', e.target.value)} placeholder="admin.users.index" />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="m-permission">Permission</Label>
                    <Input id="m-permission" value={form.data.permission} onChange={(e) => form.setData('permission', e.target.value)} placeholder="users.view" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="m-parent">Parent Menu</Label>
                    <Select value={form.data.parent_id || '_none'} onValueChange={(v) => form.setData('parent_id', v === '_none' ? '' : v)}>
                        <SelectTrigger id="m-parent" className="w-full"><SelectValue placeholder="Top level" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="_none">— Top Level —</SelectItem>
                            {parents.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="m-order">Order</Label>
                    <Input id="m-order" type="number" min="0" value={form.data.order} onChange={(e) => form.setData('order', e.target.value)} />
                </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                    <p className="text-sm font-medium">Active</p>
                    <p className="text-muted-foreground text-xs">Tampil di sidebar</p>
                </div>
                <Switch checked={form.data.is_active} onCheckedChange={(v) => form.setData('is_active', v)} />
            </div>
        </div>
    );

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Menu Management</h1>
                        <p className="text-muted-foreground text-sm">{menus.length} top-level menus</p>
                    </div>
                    <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add Menu</Button>
                </div>

                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-24">Order</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Icon</TableHead>
                                <TableHead>Route</TableHead>
                                <TableHead>Permission</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-20" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {menus.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-muted-foreground py-12 text-center">No menus found.</TableCell>
                                </TableRow>
                            ) : (
                                menus.map((menu, idx) => (
                                    <>
                                        <TableRow key={menu.id} className="bg-muted/20">
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === 0} onClick={() => moveItem(menus, idx, 'up')}>
                                                        <ChevronUp className="h-3 w-3" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === menus.length - 1} onClick={() => moveItem(menus, idx, 'down')}>
                                                        <ChevronDown className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{menu.name}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{menu.icon ?? '—'}</TableCell>
                                            <TableCell className="font-mono text-xs">{menu.route ?? '—'}</TableCell>
                                            <TableCell className="text-xs">{menu.permission ?? '—'}</TableCell>
                                            <TableCell>
                                                <Switch checked={menu.is_active} onCheckedChange={() => handleToggle(menu)} />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(menu)}>
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-7 w-7" onClick={() => setDeleteTarget(menu)}>
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                        {menu.children.map((child, cidx) => (
                                            <TableRow key={child.id}>
                                                <TableCell>
                                                    <div className="flex gap-1 pl-4">
                                                        <Button variant="ghost" size="icon" className="h-6 w-6" disabled={cidx === 0} onClick={() => moveChild(menu.children, cidx, 'up')}>
                                                            <ChevronUp className="h-3 w-3" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6" disabled={cidx === menu.children.length - 1} onClick={() => moveChild(menu.children, cidx, 'down')}>
                                                            <ChevronDown className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="pl-8 text-sm">↳ {child.name}</TableCell>
                                                <TableCell className="text-muted-foreground text-sm">{child.icon ?? '—'}</TableCell>
                                                <TableCell className="font-mono text-xs">{child.route ?? '—'}</TableCell>
                                                <TableCell className="text-xs">{child.permission ?? '—'}</TableCell>
                                                <TableCell>
                                                    <Switch checked={child.is_active} onCheckedChange={() => handleToggle(child)} />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(child)}>
                                                            <Edit2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-7 w-7" onClick={() => setDeleteTarget(child)}>
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Create Dialog */}
            <Dialog open={createOpen} onOpenChange={(o) => { if (!o) { setCreateOpen(false); form.reset(); } }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Tambah Menu</DialogTitle>
                        <DialogDescription>Isi detail menu baru.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate}><MenuForm />
                        <DialogFooter className="mt-4">
                            <DialogClose asChild><Button variant="outline" type="button">Batal</Button></DialogClose>
                            <Button type="submit" disabled={form.processing}>Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Menu</DialogTitle>
                        <DialogDescription>Update detail menu <strong>{editTarget?.name}</strong>.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEdit}><MenuForm />
                        <DialogFooter className="mt-4">
                            <DialogClose asChild><Button variant="outline" type="button">Batal</Button></DialogClose>
                            <Button type="submit" disabled={form.processing}>Update</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Menu</DialogTitle>
                        <DialogDescription>
                            Hapus menu <strong>{deleteTarget?.name}</strong>?
                            {(deleteTarget as MenuItem)?.children?.length > 0 && (
                                <span className="text-destructive ml-1">Menu ini memiliki submenu!</span>
                            )}
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
