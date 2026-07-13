import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import AdminLayout from '@/layouts/admin-layout';
import type { BreadcrumbItem, UnitRef } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Users', href: '/admin/users' },
    { title: 'Create', href: '/admin/users/create' },
];

type Props = { roles: string[]; direktorats: UnitRef[]; upts: UnitRef[] };

export default function UserCreate({ roles, direktorats, upts }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        roles: [] as string[],
        direktorat_id: null as number | null,
        upt_id: null as number | null,
        is_active: true as boolean,
    });

    const toggleRole = (role: string, checked: boolean) => {
        setData('roles', checked ? [...data.roles, role] : data.roles.filter((r) => r !== role));

        if (!checked && role === 'admin_direktorat') {
            setData('direktorat_id', null);
        }

        if (!checked && role === 'admin_upt') {
            setData('upt_id', null);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/users');
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admin/users">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Create User</h1>
                        <p className="text-muted-foreground text-sm">Tambah user baru ke sistem</p>
                    </div>
                </div>

                <form onSubmit={submit} className="max-w-2xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Full name"
                                        aria-invalid={!!errors.name}
                                    />
                                    {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="email@example.com"
                                        aria-invalid={!!errors.email}
                                    />
                                    {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Min. 8 characters"
                                        aria-invalid={!!errors.password}
                                    />
                                    {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="Repeat password"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5 sm:col-span-2">
                                    <Label>Roles</Label>
                                    <div className="grid grid-cols-1 gap-2 rounded-lg border p-3 sm:grid-cols-2">
                                        {roles.map((r) => (
                                            <div key={r} className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`role-${r}`}
                                                    checked={data.roles.includes(r)}
                                                    onCheckedChange={(checked) => toggleRole(r, checked === true)}
                                                />
                                                <Label htmlFor={`role-${r}`} className="font-normal">{r}</Label>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.roles && <p className="text-destructive text-sm">{errors.roles}</p>}
                                </div>

                                {data.roles.includes('admin_direktorat') && (
                                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                                        <Label>Direktorat</Label>
                                        <Select
                                            value={data.direktorat_id ? String(data.direktorat_id) : ''}
                                            onValueChange={(v) => setData('direktorat_id', Number(v))}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Pilih direktorat" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {direktorats.map((d) => (
                                                    <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.direktorat_id && <p className="text-destructive text-sm">{errors.direktorat_id}</p>}
                                    </div>
                                )}

                                {data.roles.includes('admin_upt') && (
                                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                                        <Label>UPT</Label>
                                        <Select
                                            value={data.upt_id ? String(data.upt_id) : ''}
                                            onValueChange={(v) => setData('upt_id', Number(v))}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Pilih UPT" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {upts.map((u) => (
                                                    <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.upt_id && <p className="text-destructive text-sm">{errors.upt_id}</p>}
                                    </div>
                                )}

                                <div className="flex items-center justify-between rounded-lg border p-4 sm:col-span-2">
                                    <div>
                                        <p className="text-sm font-medium">Active</p>
                                        <p className="text-muted-foreground text-sm">User bisa login ke sistem</p>
                                    </div>
                                    <Switch
                                        checked={data.is_active}
                                        onCheckedChange={(v) => setData('is_active', v)}
                                    />
                                </div>

                                <div className="flex gap-3 sm:col-span-2">
                                    <Button type="submit" disabled={processing}>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save User
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <Link href="/admin/users">Cancel</Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AdminLayout>
    );
}
