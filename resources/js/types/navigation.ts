import type { InertiaLinkProps } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';

export type BreadcrumbItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
};

export type NavItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
};

export type MenuItem = {
    id: number;
    name: string;
    group: string | null;
    icon: string | null;
    route: string | null;
    permission: string | null;
    order: number;
    children: MenuItem[];
};
