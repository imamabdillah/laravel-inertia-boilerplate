import { router } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Settings', href: '/admin/settings' },
];

type SettingItem = { key: string; value: string | null; group: string };
type GroupItem = { group: string; settings: SettingItem[] };

type Props = { groups: GroupItem[] };

const SETTING_LABELS: Record<string, { label: string; description?: string; type?: string }> = {
    app_name:   { label: 'Application Name', description: 'Nama aplikasi yang ditampilkan', type: 'text' },
    app_logo:   { label: 'Logo URL', description: 'URL gambar logo (opsional)', type: 'url' },
    app_email:  { label: 'Application Email', description: 'Email kontak aplikasi', type: 'email' },
    app_footer: { label: 'Footer Text', description: 'Teks yang muncul di footer', type: 'text' },
};

export default function SettingsIndex({ groups }: Props) {
    const [values, setValues] = useState<Record<string, string>>(() => {
        const map: Record<string, string> = {};
        groups.forEach((g) => g.settings.forEach((s) => { map[s.key] = s.value ?? ''; }));
        return map;
    });
    const [saving, setSaving] = useState(false);

    const handleSaveGroup = (group: GroupItem) => {
        setSaving(true);
        const settings = group.settings.map((s) => ({ key: s.key, value: values[s.key] ?? null }));
        router.patch('/admin/settings', { settings }, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
        });
    };

    const handleSaveAll = () => {
        setSaving(true);
        const settings = groups.flatMap((g) =>
            g.settings.map((s) => ({ key: s.key, value: values[s.key] ?? null }))
        );
        router.patch('/admin/settings', { settings }, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
        });
    };

    if (groups.length === 0) {
        return (
            <AdminLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-1 items-center justify-center p-6">
                    <p className="text-muted-foreground">No settings found.</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
                        <p className="text-muted-foreground text-sm">Kelola konfigurasi aplikasi</p>
                    </div>
                    <Button onClick={handleSaveAll} disabled={saving}>
                        <Save className="mr-2 h-4 w-4" />
                        Save All
                    </Button>
                </div>

                {groups.length === 1 ? (
                    <GroupForm group={groups[0]} values={values} setValues={setValues} onSave={handleSaveGroup} saving={saving} />
                ) : (
                    <Tabs defaultValue={groups[0]?.group}>
                        <TabsList>
                            {groups.map((g) => (
                                <TabsTrigger key={g.group} value={g.group} className="capitalize">{g.group}</TabsTrigger>
                            ))}
                        </TabsList>
                        {groups.map((g) => (
                            <TabsContent key={g.group} value={g.group}>
                                <GroupForm group={g} values={values} setValues={setValues} onSave={handleSaveGroup} saving={saving} />
                            </TabsContent>
                        ))}
                    </Tabs>
                )}
            </div>
        </AdminLayout>
    );
}

function GroupForm({
    group, values, setValues, onSave, saving,
}: {
    group: GroupItem;
    values: Record<string, string>;
    setValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    onSave: (g: GroupItem) => void;
    saving: boolean;
}) {
    return (
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle className="capitalize">{group.group}</CardTitle>
                <CardDescription>Pengaturan group {group.group}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
                {group.settings.map((setting) => {
                    const meta = SETTING_LABELS[setting.key];
                    return (
                        <div key={setting.key} className="flex flex-col gap-1.5">
                            <Label htmlFor={setting.key}>{meta?.label ?? setting.key}</Label>
                            <Input
                                id={setting.key}
                                type={meta?.type ?? 'text'}
                                value={values[setting.key] ?? ''}
                                onChange={(e) => setValues((prev) => ({ ...prev, [setting.key]: e.target.value }))}
                                placeholder={meta?.description}
                            />
                            {meta?.description && (
                                <p className="text-muted-foreground text-xs">{meta.description}</p>
                            )}
                        </div>
                    );
                })}
                <div className="flex justify-end">
                    <Button onClick={() => onSave(group)} disabled={saving}>
                        <Save className="mr-2 h-4 w-4" />
                        Save {group.group}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
