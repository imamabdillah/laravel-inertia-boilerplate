import { router, useForm } from '@inertiajs/react';
import * as LucideIcons from 'lucide-react';
import { ChevronDown, ChevronRight, ChevronUp, Edit2, Plus, Search, Trash2, X } from 'lucide-react';
import { useRef, useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
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

// Semua icon dari lucide-react — filter key PascalCase yang merupakan komponen
// 'Icon' adalah base component lucide yang butuh prop iconNode — exclude
const ALL_ICONS = Object.keys(LucideIcons)
    .filter((key) => /^[A-Z]/.test(key) && key !== 'Icon')
    .sort();

type MenuChild = {
    id: number; name: string; group: string | null; icon: string | null; route: string | null;
    permission: string | null; parent_id: number | null;
    order: number; is_active: boolean;
};

type MenuItem = MenuChild & { children: MenuChild[] };
type ParentOption = { id: number; name: string };

type Props = {
    allMenus: MenuItem[];
    parents: ParentOption[];
    menuGroups: string[];
};

type FormData = {
    name: string; group: string; icon: string; route: string; permission: string;
    parent_id: string; order: string; is_active: boolean;
};

const emptyForm: FormData = {
    name: '', group: '', icon: '', route: '', permission: '',
    parent_id: '', order: '0', is_active: true,
};

function LucideIcon({ name, className }: { name: string; className?: string }) {
    const Icon = (LucideIcons as unknown as Record<string, React.FC<{ className?: string }>>)[name];
    if (!Icon) return null;
    return <Icon className={className} />;
}

// Inline icon picker — tidak pakai Popover/Portal agar tidak konflik dengan Dialog focus trap
function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [open, setOpen]     = useState(false);
    const [search, setSearch] = useState('');
    const searchRef           = useRef<HTMLInputElement>(null);

    const filtered = ALL_ICONS.filter((ic: string) =>
        ic.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (ic: string) => {
        onChange(ic);
        setOpen(false);
        setSearch('');
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        setOpen(false);
        setSearch('');
    };

    return (
        <div className="relative">
            {/* Trigger */}
            <button
                type="button"
                onClick={() => {
                    setOpen((o) => !o);
                    setTimeout(() => searchRef.current?.focus(), 50);
                }}
                className="border-input flex h-9 w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-colors hover:bg-accent focus:outline-none"
            >
                <span className="flex items-center gap-2">
                    {value ? (
                        <>
                            <LucideIcon name={value} className="h-4 w-4 shrink-0" />
                            <span>{value}</span>
                        </>
                    ) : (
                        <span className="text-muted-foreground">Pilih icon...</span>
                    )}
                </span>
                <span className="flex items-center gap-1">
                    {value && (
                        <span
                            role="button"
                            tabIndex={0}
                            onClick={handleClear}
                            onKeyDown={(e) => e.key === 'Enter' && handleClear(e as unknown as React.MouseEvent)}
                            className="text-muted-foreground hover:text-foreground rounded p-0.5"
                        >
                            <X className="h-3 w-3" />
                        </span>
                    )}
                    <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-90' : ''}`} />
                </span>
            </button>

            {/* Inline dropdown — render di dalam DOM Dialog, tidak ada Portal */}
            {open && (
                <div className="border-input bg-popover z-10 mt-1 w-full rounded-md border p-2 shadow-md">
                    {/* Search */}
                    <div className="relative mb-2">
                        <Search className="text-muted-foreground absolute top-1/2 left-2 h-3.5 w-3.5 -translate-y-1/2" />
                        <Input
                            ref={searchRef}
                            placeholder="Cari icon..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 pl-7 text-sm"
                        />
                    </div>

                    {/* Grid icon */}
                    <div className="grid max-h-44 grid-cols-8 gap-0.5 overflow-y-auto pr-1">
                        {filtered.map((ic: string) => (
                            <button
                                key={ic}
                                type="button"
                                title={ic}
                                onClick={() => handleSelect(ic)}
                                className={`flex items-center justify-center rounded p-1.5 transition-colors hover:bg-accent ${
                                    value === ic
                                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                        : ''
                                }`}
                            >
                                <LucideIcon name={ic} className="h-4 w-4" />
                            </button>
                        ))}
                        {filtered.length === 0 && (
                            <p className="text-muted-foreground col-span-8 py-3 text-center text-xs">
                                Tidak ditemukan
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Text input + suggestion dropdown dari group yang sudah ada — tetap bisa ketik bebas
// buat bikin group baru. Bukan Select biasa karena harus bisa nerima value baru.
function GroupPicker({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
    const [open, setOpen] = useState(false);
    const suggestions = options.filter((g) => g.toLowerCase().includes(value.toLowerCase()));

    return (
        <div className="relative">
            <Input
                id="m-group"
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
                placeholder="Navigation"
                autoComplete="off"
            />
            {open && suggestions.length > 0 && (
                <div className="border-input bg-popover absolute z-10 mt-1 w-full rounded-md border p-1 shadow-md">
                    {suggestions.map((g) => (
                        <button
                            key={g}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                                onChange(g);
                                setOpen(false);
                            }}
                            className="hover:bg-accent block w-full rounded px-2 py-1.5 text-left text-sm"
                        >
                            {g}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// Di luar MenusIndex agar tidak remount saat state parent berubah
type MenuFormProps = {
    data: FormData;
    errors: Partial<Record<keyof FormData, string>>;
    parents: ParentOption[];
    menuGroups: string[];
    setData: (key: keyof FormData, value: string | boolean) => void;
};

function MenuForm({ data, errors, parents, menuGroups, setData }: MenuFormProps) {
    return (
        <div className="flex flex-col gap-4 py-2">
            {/* Nama */}
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="m-name">Nama Menu <span className="text-destructive">*</span></Label>
                <Input
                    id="m-name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    aria-invalid={!!errors.name}
                    autoComplete="off"
                />
                {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
            </div>

            {/* Group — cuma relevan buat menu top level, jadi sidebar group label */}
            {!data.parent_id && (
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="m-group">Group Label</Label>
                    <GroupPicker value={data.group} onChange={(v) => setData('group', v)} options={menuGroups} />
                    <p className="text-muted-foreground text-xs">Menu dengan Group Label sama dikelompokkan jadi satu section di sidebar. Kosongkan untuk default "Navigation".</p>
                    {errors.group && <p className="text-destructive text-xs">{errors.group}</p>}
                </div>
            )}

            {/* Icon */}
            <div className="flex flex-col gap-1.5">
                <Label>Icon</Label>
                <IconPicker value={data.icon} onChange={(v) => setData('icon', v)} />
            </div>

            {/* Route + Permission */}
            <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="m-route">Route Name</Label>
                    <Input
                        id="m-route"
                        value={data.route}
                        onChange={(e) => setData('route', e.target.value)}
                        placeholder="admin.users.index"
                        autoComplete="off"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="m-permission">Permission</Label>
                    <Input
                        id="m-permission"
                        value={data.permission}
                        onChange={(e) => setData('permission', e.target.value)}
                        placeholder="users.view"
                        autoComplete="off"
                    />
                </div>
            </div>

            {/* Parent + Order */}
            <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 flex flex-col gap-1.5">
                    <Label>Parent Menu</Label>
                    <Select
                        value={data.parent_id || '_none'}
                        onValueChange={(v) => setData('parent_id', v === '_none' ? '' : v)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Top level" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="_none">— Top Level —</SelectItem>
                            {parents.map((p) => (
                                <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="m-order">Order</Label>
                    <Input
                        id="m-order"
                        type="number"
                        min="0"
                        value={data.order}
                        onChange={(e) => setData('order', e.target.value)}
                    />
                </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                    <p className="text-sm font-medium">Aktif</p>
                    <p className="text-muted-foreground text-xs">Tampil di sidebar navigasi</p>
                </div>
                <Switch
                    checked={data.is_active}
                    onCheckedChange={(v) => setData('is_active', v)}
                />
            </div>
        </div>
    );
}

export default function MenusIndex({ allMenus, parents, menuGroups }: Props) {
    const [createOpen, setCreateOpen]     = useState(false);
    const [editTarget, setEditTarget]     = useState<MenuItem | MenuChild | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<MenuItem | MenuChild | null>(null);

    const form = useForm<FormData>(emptyForm);

    const openCreate = () => {
        form.reset();
        form.clearErrors();
        setCreateOpen(true);
    };

    const openEdit = (item: MenuItem | MenuChild) => {
        form.setData({
            name:       item.name,
            group:      item.group ?? '',
            icon:       item.icon ?? '',
            route:      item.route ?? '',
            permission: item.permission ?? '',
            parent_id:  item.parent_id ? String(item.parent_id) : '',
            order:      String(item.order),
            is_active:  item.is_active,
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
            if (i === index)     return { id: m.id, order: items[swapIndex].order };
            if (i === swapIndex) return { id: m.id, order: items[index].order };
            return { id: m.id, order: m.order };
        });
        router.patch('/admin/menus/reorder', { items: updated }, { preserveScroll: true });
    };

    const moveChild = (children: MenuChild[], index: number, dir: 'up' | 'down') => {
        const swapIndex = dir === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= children.length) return;
        const updated = children.map((c, i) => {
            if (i === index)     return { id: c.id, order: children[swapIndex].order };
            if (i === swapIndex) return { id: c.id, order: children[index].order };
            return { id: c.id, order: c.order };
        });
        router.patch('/admin/menus/reorder', { items: updated }, { preserveScroll: true });
    };

    const sharedFormProps: MenuFormProps = {
        data:    form.data,
        errors:  form.errors,
        parents,
        menuGroups,
        setData: (key, value) => form.setData(key, value as never),
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Menu Management</h1>
                        <p className="text-muted-foreground text-sm">{allMenus.length} top-level menus</p>
                    </div>
                    <Button onClick={openCreate}>
                        <Plus className="mr-2 h-4 w-4" />Add Menu
                    </Button>
                </div>

                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-20">Order</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>Group</TableHead>
                                <TableHead className="w-12">Icon</TableHead>
                                <TableHead>Route</TableHead>
                                <TableHead>Permission</TableHead>
                                <TableHead className="w-20">Status</TableHead>
                                <TableHead className="w-20" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allMenus.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-muted-foreground py-12 text-center">
                                        Belum ada menu.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                allMenus.map((menu, idx) => (
                                    <>
                                        <TableRow key={menu.id} className="bg-muted/20">
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === 0} onClick={() => moveItem(allMenus, idx, 'up')}>
                                                        <ChevronUp className="h-3 w-3" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === allMenus.length - 1} onClick={() => moveItem(allMenus, idx, 'down')}>
                                                        <ChevronDown className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{menu.name}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{menu.group ?? 'Navigation'}</TableCell>
                                            <TableCell>
                                                {menu.icon
                                                    ? <span title={menu.icon}><LucideIcon name={menu.icon} className="h-4 w-4" /></span>
                                                    : <span className="text-muted-foreground">—</span>
                                                }
                                            </TableCell>
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
                                                <TableCell className="text-muted-foreground text-sm">—</TableCell>
                                                <TableCell>
                                                    {child.icon
                                                        ? <span title={child.icon}><LucideIcon name={child.icon} className="h-4 w-4" /></span>
                                                        : <span className="text-muted-foreground">—</span>
                                                    }
                                                </TableCell>
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
                <DialogContent className="sm:max-w-md overflow-visible">
                    <DialogHeader>
                        <DialogTitle>Tambah Menu</DialogTitle>
                        <DialogDescription>Isi detail menu baru yang akan tampil di sidebar.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate}>
                        <MenuForm {...sharedFormProps} />
                        <DialogFooter className="mt-4">
                            <DialogClose asChild>
                                <Button variant="outline" type="button">Batal</Button>
                            </DialogClose>
                            <Button type="submit" disabled={form.processing}>Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
                <DialogContent className="sm:max-w-md overflow-visible">
                    <DialogHeader>
                        <DialogTitle>Edit Menu</DialogTitle>
                        <DialogDescription>
                            Update detail menu <strong>{editTarget?.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEdit}>
                        <MenuForm {...sharedFormProps} />
                        <DialogFooter className="mt-4">
                            <DialogClose asChild>
                                <Button variant="outline" type="button">Batal</Button>
                            </DialogClose>
                            <Button type="submit" disabled={form.processing}>Update</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Hapus Menu</DialogTitle>
                        <DialogDescription>
                            Hapus menu <strong>{deleteTarget?.name}</strong>? Aksi ini tidak bisa dibatalkan.
                            {(deleteTarget as MenuItem)?.children?.length > 0 && (
                                <span className="text-destructive ml-1 block mt-1">⚠ Menu ini memiliki submenu yang ikut terhapus.</span>
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
