import { router } from '@inertiajs/react';
import { Info, Trash2 } from 'lucide-react';
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
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Permission Management', href: '/admin/permissions' },
];

type PermItem   = { id: number; name: string; roles_count: number; assigned: boolean };
type GroupItem  = { group: string; permissions: PermItem[] };
type RoleOption = { id: number; name: string };

type Props = {
    groups: GroupItem[];
    roles: RoleOption[];
    selectedRoleId: number | null;
    filters: { search?: string; role_id?: string };
};

const ACTION_ORDER = ['view', 'create', 'edit', 'update', 'delete'];

function sortActions(actions: string[]): string[] {
    const known = ACTION_ORDER.filter((a) => actions.includes(a));
    const rest  = actions.filter((a) => !ACTION_ORDER.includes(a)).sort();
    return [...known, ...rest];
}

export default function PermissionsIndex({ groups, roles, selectedRoleId, filters }: Props) {
    const [search, setSearch]           = useState(filters.search ?? '');
    const [deleteTarget, setDeleteTarget] = useState<PermItem | null>(null);

    const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? null;

    const [assignedNames, setAssignedNames] = useState<Set<string>>(
        () => new Set(groups.flatMap((g) => g.permissions.filter((p) => p.assigned).map((p) => p.name)))
    );

    useEffect(() => {
        setAssignedNames(
            new Set(groups.flatMap((g) => g.permissions.filter((p) => p.assigned).map((p) => p.name)))
        );
    }, [selectedRoleId, groups]);

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
        ...new Set(groups.flatMap((g) => g.permissions.map((p) => p.name.split('.')[1]).filter(Boolean))),
    ]);

    const handleRoleSelect = (roleId: number) => {
        router.get('/admin/permissions', { role_id: roleId, search: search || undefined }, { preserveState: false });
    };

    const handlePermToggle = (permName: string) => {
        if (!selectedRoleId) return;
        const next = new Set(assignedNames);
        next.has(permName) ? next.delete(permName) : next.add(permName);
        setAssignedNames(next);
        router.patch(
            `/admin/roles/${selectedRoleId}/sync-permissions`,
            { permissions: [...next] },
            { preserveScroll: true, preserveState: true }
        );
    };

    const handleToggleGroup = (group: GroupItem) => {
        if (!selectedRoleId) return;
        const groupPerms = group.permissions.map((p) => p.name);
        const allChecked = groupPerms.every((p) => assignedNames.has(p));
        const next = new Set(assignedNames);
        if (allChecked) {
            groupPerms.forEach((p) => next.delete(p));
        } else {
            groupPerms.forEach((p) => next.add(p));
        }
        setAssignedNames(next);
        router.patch(
            `/admin/roles/${selectedRoleId}/sync-permissions`,
            { permissions: [...next] },
            { preserveScroll: true, preserveState: true }
        );
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
                        <h1 className="text-2xl font-semibold tracking-tight">Permission Management</h1>
                        <p className="text-muted-foreground text-sm">
                            {totalPerms} permission — resource mengikuti menu yang sudah dibuat
                        </p>
                    </div>
                </div>

                {/* Info */}
                <div className="bg-muted/50 flex items-start gap-2 rounded-lg border p-3 text-sm">
                    <Info className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                    <span className="text-muted-foreground">
                        Permission dibuat otomatis saat menu ditambahkan. Kelola menu di{' '}
                        <a href="/admin/menus" className="text-foreground underline underline-offset-2">
                            Menu Management
                        </a>{' '}
                        untuk menambah resource baru.
                    </span>
                </div>

                {/* Role Selector */}
                <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium">Pilih Role</p>
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
                                            ? 'bg-foreground text-background border-foreground'
                                            : 'border-border text-muted-foreground hover:bg-muted',
                                    ].join(' ')}
                                >
                                    {role.name}
                                </button>
                            );
                        })}
                    </div>

                </div>

                {/* Search */}
                <Input
                    placeholder="Cari resource..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-64 h-9"
                />

                {/* Matrix */}
                {groups.length === 0 ? (
                    <div className="text-muted-foreground rounded-lg border py-12 text-center text-sm">
                        Belum ada resource. Tambahkan menu dengan field permission di{' '}
                        <a href="/admin/menus" className="text-foreground underline">Menu Management</a>.
                    </div>
                ) : (
                    <div className="rounded-lg border overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-muted/50 border-b">
                                    <th className="px-4 py-3 text-left font-semibold">Resource</th>
                                    {allActions.map((action) => (
                                        <th key={action} className="px-4 py-3 text-center font-medium capitalize min-w-16">
                                            {action}
                                        </th>
                                    ))}
                                    <th className="px-4 py-3 text-center font-medium w-20">Assigned</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groups.map((group) => {
                                    const permMap = new Map(
                                        group.permissions.map((p) => [p.name.split('.')[1], p])
                                    );
                                    const assignedCount = group.permissions.filter((p) => assignedNames.has(p.name)).length;
                                    const allChecked = group.permissions.length > 0 &&
                                        group.permissions.every((p) => assignedNames.has(p.name));

                                    return (
                                        <tr key={group.group} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                                            <td className="px-4 py-3">
                                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                                    <Checkbox
                                                        checked={allChecked}
                                                        onCheckedChange={() => handleToggleGroup(group)}
                                                        className={assignedCount > 0 && !allChecked ? 'opacity-50' : ''}
                                                    />
                                                    <span className="font-medium capitalize">{group.group}</span>
                                                </label>
                                            </td>
                                            {allActions.map((action) => {
                                                const perm   = permMap.get(action);
                                                const exists = !!perm;

                                                if (!exists) {
                                                    return (
                                                        <td key={action} className="px-4 py-3 text-center">
                                                            <span className="text-muted-foreground/30">—</span>
                                                        </td>
                                                    );
                                                }

                                                const checked  = assignedNames.has(perm.name);
                                                const isUnused = perm.roles_count === 0;

                                                return (
                                                    <td key={action} className="px-4 py-3 text-center">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <Checkbox
                                                                checked={checked}
                                                                onCheckedChange={() => handlePermToggle(perm.name)}
                                                            />
                                                            {isUnused && (
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
                                                    variant={assignedCount === group.permissions.length ? 'default' : 'outline'}
                                                    className="text-xs tabular-nums"
                                                >
                                                    {assignedCount}/{group.permissions.length}
                                                </Badge>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

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
                                    <span className="text-muted-foreground/30 font-medium">—</span>
                                    Permission belum dibuat
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Trash2 className="h-3 w-3" />
                                    Tidak dipakai role manapun — bisa dihapus
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Permission Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Hapus Permission</DialogTitle>
                        <DialogDescription>
                            Hapus <code className="font-mono text-sm">{deleteTarget?.name}</code>?
                            Permission ini belum dipakai role manapun.
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
