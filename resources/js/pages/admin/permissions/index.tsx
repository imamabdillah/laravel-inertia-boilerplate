import { router, useForm } from '@inertiajs/react';
import { Lock, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Permissions', href: '/admin/permissions' },
];

type PermItem = { id: number; name: string; roles_count: number; assigned: boolean };
type GroupItem = { group: string; permissions: PermItem[] };
type RoleOption = { id: number; name: string };

type Props = {
    groups: GroupItem[];
    roles: RoleOption[];
    selectedRoleId: number | null;
    filters: { search?: string; role_id?: string };
};

const ACTION_ORDER = ['view', 'create', 'update', 'delete'];

function sortActions(actions: string[]): string[] {
    const known = ACTION_ORDER.filter((a) => actions.includes(a));
    const rest = actions.filter((a) => !ACTION_ORDER.includes(a)).sort();
    return [...known, ...rest];
}

export default function PermissionsIndex({ groups, roles, selectedRoleId, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [createOpen, setCreateOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<PermItem | null>(null);

    const createForm = useForm({ name: '' });

    const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? null;
    const isSuperAdmin = selectedRole?.name === 'super_admin';

    // Local optimistic state for checkbox assignments
    const [assignedNames, setAssignedNames] = useState<Set<string>>(
        () => new Set(groups.flatMap((g) => g.permissions.filter((p) => p.assigned).map((p) => p.name)))
    );

    // Reset when role changes
    useEffect(() => {
        setAssignedNames(
            new Set(groups.flatMap((g) => g.permissions.filter((p) => p.assigned).map((p) => p.name)))
        );
    }, [selectedRoleId]);

    useEffect(() => {
        const t = setTimeout(() => {
            router.get(
                '/admin/permissions',
                { search: search || undefined, role_id: selectedRoleId ?? undefined },
                { preserveState: true, replace: true }
            );
        }, 400);
        return () => clearTimeout(t);
    }, [search]);

    const allActions = sortActions([
        ...new Set(
            groups.flatMap((g) => g.permissions.map((p) => p.name.split('.')[1]).filter(Boolean))
        ),
    ]);

    const handleRoleSelect = (roleId: number) => {
        router.get(
            '/admin/permissions',
            { role_id: roleId, search: search || undefined },
            { preserveState: false }
        );
    };

    const handlePermToggle = (permName: string) => {
        if (!selectedRoleId || isSuperAdmin) return;
        const next = new Set(assignedNames);
        next.has(permName) ? next.delete(permName) : next.add(permName);
        setAssignedNames(next);
        router.patch(
            `/admin/roles/${selectedRoleId}/sync-permissions`,
            { permissions: [...next] },
            { preserveScroll: true, preserveState: true }
        );
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/permissions', {
            onSuccess: () => { setCreateOpen(false); createForm.reset(); },
        });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        router.delete(`/admin/permissions/${deleteTarget.id}`, {
            onFinish: () => setDeleteTarget(null),
        });
    };

    const totalPerms = groups.reduce((s, g) => s + g.permissions.length, 0);

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Permissions</h1>
                        <p className="text-muted-foreground text-sm">
                            {totalPerms} permissions — pilih role untuk atur assignment
                        </p>
                    </div>
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Permission
                    </Button>
                </div>

                {/* Role Selector */}
                <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium">Role</p>
                    <div className="flex flex-wrap gap-2">
                        {roles.map((role) => {
                            const active = role.id === selectedRoleId;
                            return (
                                <button
                                    key={role.id}
                                    onClick={() => handleRoleSelect(role.id)}
                                    className={[
                                        'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                                        active
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'border-border text-muted-foreground hover:bg-muted',
                                    ].join(' ')}
                                >
                                    {role.name}
                                </button>
                            );
                        })}
                    </div>
                    {isSuperAdmin && (
                        <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                            <Lock className="h-3 w-3" />
                            super_admin memiliki semua permission secara otomatis — tidak bisa diubah manual
                        </p>
                    )}
                </div>

                {/* Search */}
                <Input
                    placeholder="Cari resource..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-64"
                />

                {/* Matrix */}
                {groups.length === 0 ? (
                    <div className="text-muted-foreground rounded-lg border py-12 text-center text-sm">
                        Belum ada permission.{' '}
                        <button className="underline" onClick={() => setCreateOpen(true)}>
                            Buat sekarang
                        </button>
                    </div>
                ) : (
                    <div className="rounded-lg border">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-muted/50 border-b">
                                        <th className="px-4 py-3 text-left font-semibold">Resource</th>
                                        {allActions.map((action) => (
                                            <th key={action} className="px-4 py-3 text-center font-medium capitalize">
                                                {action}
                                            </th>
                                        ))}
                                        <th className="px-4 py-3 text-center font-medium">Assigned</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groups.map((group, idx) => {
                                        const permMap = new Map(
                                            group.permissions.map((p) => [p.name.split('.')[1], p])
                                        );
                                        const assignedCount = group.permissions.filter((p) =>
                                            isSuperAdmin ? true : assignedNames.has(p.name)
                                        ).length;

                                        return (
                                            <tr
                                                key={group.group}
                                                className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${idx % 2 !== 0 ? 'bg-muted/10' : ''}`}
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium capitalize">{group.group}</span>
                                                        {/* show trash for unused perms in this group */}
                                                        {group.permissions.every((p) => p.roles_count === 0) && !isSuperAdmin && (
                                                            <button
                                                                className="text-muted-foreground hover:text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                                                                title={`Hapus semua permission ${group.group}`}
                                                            />
                                                        )}
                                                    </div>
                                                </td>
                                                {allActions.map((action) => {
                                                    const perm = permMap.get(action);
                                                    const exists = !!perm;

                                                    if (!exists) {
                                                        return (
                                                            <td key={action} className="px-4 py-3 text-center">
                                                                <div className="flex items-center justify-center">
                                                                    <div className="h-4 w-4 rounded border border-dashed opacity-30" />
                                                                </div>
                                                            </td>
                                                        );
                                                    }

                                                    const checked = isSuperAdmin || assignedNames.has(perm.name);
                                                    const isUnused = perm.roles_count === 0;

                                                    return (
                                                        <td key={action} className="px-4 py-3 text-center">
                                                            <div className="flex flex-col items-center gap-1">
                                                                <Checkbox
                                                                    checked={checked}
                                                                    disabled={isSuperAdmin}
                                                                    onCheckedChange={() => handlePermToggle(perm.name)}
                                                                    title={
                                                                        isSuperAdmin
                                                                            ? 'super_admin selalu punya permission ini'
                                                                            : checked
                                                                              ? `Cabut ${perm.name} dari ${selectedRole?.name}`
                                                                              : `Berikan ${perm.name} ke ${selectedRole?.name}`
                                                                    }
                                                                />
                                                                {/* Delete button for globally unused permissions */}
                                                                {isUnused && !isSuperAdmin && (
                                                                    <button
                                                                        onClick={() => setDeleteTarget(perm)}
                                                                        className="text-muted-foreground hover:text-destructive transition-colors"
                                                                        title={`Hapus permission ${perm.name}`}
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                                <td className="px-4 py-3 text-center">
                                                    <Badge
                                                        variant={assignedCount === group.permissions.length ? 'default' : 'secondary'}
                                                    >
                                                        {assignedCount}/{group.permissions.length}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Legend */}
                        <div className="border-t px-4 py-3">
                            <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <Checkbox checked disabled className="pointer-events-none h-3.5 w-3.5" />
                                    Permission diberikan ke role ini
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Checkbox disabled className="pointer-events-none h-3.5 w-3.5" />
                                    Belum diberikan
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <div className="h-3.5 w-3.5 rounded border border-dashed opacity-30" />
                                    Permission belum dibuat
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Trash2 className="h-3 w-3" />
                                    Permission tidak dipakai role manapun — bisa dihapus
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Permission Dialog */}
            <Dialog open={createOpen} onOpenChange={(o) => { if (!o) { setCreateOpen(false); createForm.reset(); } }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Buat Permission Baru</DialogTitle>
                        <DialogDescription>
                            Format: <code className="font-mono">resource.action</code> — contoh: posts.view, reports.export
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="perm-name">Permission Name</Label>
                            <Input
                                id="perm-name"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value.toLowerCase())}
                                placeholder="resource.action"
                                aria-invalid={!!createForm.errors.name}
                            />
                            {createForm.errors.name && (
                                <p className="text-destructive text-sm">{createForm.errors.name}</p>
                            )}
                            {createForm.data.name && !createForm.errors.name && (
                                <p className="text-muted-foreground text-xs">
                                    Akan disimpan sebagai:{' '}
                                    <code className="font-mono">{createForm.data.name}</code>
                                </p>
                            )}
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" type="button">Batal</Button>
                            </DialogClose>
                            <Button type="submit" disabled={createForm.processing}>
                                Buat Permission
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Permission Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Permission</DialogTitle>
                        <DialogDescription>
                            Hapus <code className="font-mono text-sm">{deleteTarget?.name}</code>?
                            Permission ini belum dipakai role manapun.
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
