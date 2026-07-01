import type { ReactNode } from 'react';
import { AdminHeader } from '@/components/admin/admin-header';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { MitraSidebar } from '@/components/mitra/mitra-sidebar';
import type { BreadcrumbItem } from '@/types';

type Props = {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
};

export default function MitraLayout({ children, breadcrumbs = [] }: Props) {
    return (
        <AppShell variant="sidebar">
            <MitraSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AdminHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
