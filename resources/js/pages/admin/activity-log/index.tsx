import { router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { BreadcrumbItem, PaginatedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Activity Log', href: '/admin/activity-log' },
];

type LogEntry = {
    id: number;
    description: string;
    event: string;
    subject_type: string | null;
    subject_id: number | null;
    causer_name: string;
    causer_email: string | null;
    created_at: string;
};

type SimpleUser = { id: number; name: string };

type Filters = {
    search?: string;
    event?: string;
    user_id?: string;
    date_from?: string;
    date_to?: string;
};

type Props = {
    logs: PaginatedData<LogEntry>;
    users: SimpleUser[];
    filters: Filters;
};

const eventBadge: Record<string, { label: string; className: string }> = {
    created:        { label: 'Created',   className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
    updated:        { label: 'Updated',   className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
    deleted:        { label: 'Deleted',   className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
    activated:      { label: 'Activated', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
    deactivated:    { label: 'Deactivated', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
    password_reset: { label: 'Pwd Reset', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
};

const EVENT_OPTIONS = ['created', 'updated', 'deleted', 'activated', 'deactivated', 'password_reset'];

function EventBadge({ event }: { event: string }) {
    const cfg = eventBadge[event];
    if (!cfg) {
        return (
            <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                {event}
            </span>
        );
    }
    return (
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${cfg.className}`}>
            {cfg.label}
        </span>
    );
}

export default function ActivityLogIndex({ logs, users, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const applyFilters = useCallback(
        (overrides: Record<string, string | undefined>) => {
            router.get(
                '/admin/activity-log',
                { ...filters, ...overrides },
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

    const resetFilters = () => {
        setSearch('');
        router.get('/admin/activity-log', {}, { replace: true });
    };

    const hasFilters = !!(filters.search || filters.event || filters.user_id || filters.date_from || filters.date_to);

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Activity Log</h1>
                    <p className="text-muted-foreground text-sm">{logs.meta.total} total entries</p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-end gap-3">
                    <div className="flex flex-col gap-1">
                        <Label className="text-xs">Search</Label>
                        <Input
                            placeholder="Search description..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-56"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label className="text-xs">Event</Label>
                        <Select
                            value={filters.event ?? 'all'}
                            onValueChange={(v) => applyFilters({ event: v === 'all' ? undefined : v, page: undefined })}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="All Events" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Events</SelectItem>
                                {EVENT_OPTIONS.map((e) => (
                                    <SelectItem key={e} value={e}>
                                        {eventBadge[e]?.label ?? e}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label className="text-xs">User</Label>
                        <Select
                            value={filters.user_id ?? 'all'}
                            onValueChange={(v) => applyFilters({ user_id: v === 'all' ? undefined : v, page: undefined })}
                        >
                            <SelectTrigger className="w-44">
                                <SelectValue placeholder="All Users" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Users</SelectItem>
                                {users.map((u) => (
                                    <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label className="text-xs">From</Label>
                        <Input
                            type="date"
                            value={filters.date_from ?? ''}
                            onChange={(e) => applyFilters({ date_from: e.target.value || undefined, page: undefined })}
                            className="w-40"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label className="text-xs">To</Label>
                        <Input
                            type="date"
                            value={filters.date_to ?? ''}
                            onChange={(e) => applyFilters({ date_to: e.target.value || undefined, page: undefined })}
                            className="w-40"
                        />
                    </div>

                    {hasFilters && (
                        <Button variant="ghost" size="sm" onClick={resetFilters}>
                            Reset
                        </Button>
                    )}
                </div>

                {/* Table */}
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Time</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Event</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Description</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-muted-foreground py-12 text-center">
                                        No activity found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.data.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                                            {new Date(log.created_at).toLocaleString('id-ID', {
                                                day: '2-digit', month: 'short', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit',
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm font-medium">{log.causer_name}</div>
                                            {log.causer_email && (
                                                <div className="text-muted-foreground text-xs">{log.causer_email}</div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <EventBadge event={log.event} />
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {log.subject_type ? (
                                                <span>
                                                    {log.subject_type}
                                                    {log.subject_id && <span className="ml-1 opacity-60">#{log.subject_id}</span>}
                                                </span>
                                            ) : (
                                                <span className="opacity-40">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm">{log.description}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {logs.meta.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-muted-foreground text-sm">
                            Showing {logs.meta.from}–{logs.meta.to} of {logs.meta.total}
                        </p>
                        <div className="flex gap-1">
                            {logs.meta.links.map((link, i) => (
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
