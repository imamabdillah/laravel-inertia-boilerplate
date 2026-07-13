import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { AdminIcon } from '@/components/admin/admin-icon';
import AppLogoIcon from '@/components/app-logo-icon';
import { NavUser } from '@/components/nav-user';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { Auth, MenuItem } from '@/types';

function routeNameToUrl(routeName: string | null): string {
    if (!routeName) {
        return '#';
    }

    // Path langsung (sudah diawali /) — pakai apa adanya
    if (routeName.startsWith('/')) {
        return routeName;
    }

    // Route name admin.* → /admin/...
    if (routeName.startsWith('admin.')) {
        const path = routeName
            .replace(/^admin\./, '')
            .replace(/\.index$/, '')
            .replace(/\./g, '/');

        return '/admin/' + path;
    }

    // Route name lain (misal mitra.*) → /segment/...
    const path = routeName.replace(/\.index$/, '').replace(/\./g, '/');

    return '/' + path;
}

const DEFAULT_GROUP_LABEL = 'Navigation';

function groupMenus(items: MenuItem[]): { label: string; items: MenuItem[] }[] {
    const order: string[] = [];
    const buckets = new Map<string, MenuItem[]>();

    for (const item of items) {
        const label = item.group?.trim() || DEFAULT_GROUP_LABEL;

        if (!buckets.has(label)) {
            buckets.set(label, []);
            order.push(label);
        }

        buckets.get(label)!.push(item);
    }

    return order.map((label) => ({ label, items: buckets.get(label)! }));
}

function NavMenuItems({ items }: { items: MenuItem[] }) {
    const { url } = usePage();

    return (
        <SidebarMenu>
            {items.map((item) => {
                const href = routeNameToUrl(item.route);
                const isActive = href !== '#' && url.startsWith(href);

                if (item.children.length > 0) {
                    const childActive = item.children.some((c) => {
                        const ch = routeNameToUrl(c.route);

                        return ch !== '#' && url.startsWith(ch);
                    });

                    return (
                        <Collapsible
                            key={item.id}
                            defaultOpen={childActive}
                            asChild
                            className="group/collapsible"
                        >
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton
                                        tooltip={item.name}
                                        isActive={childActive}
                                    >
                                        <AdminIcon name={item.icon} />
                                        <span>{item.name}</span>
                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {item.children.map((child) => {
                                            const childHref = routeNameToUrl(
                                                child.route,
                                            );

                                            return (
                                                <SidebarMenuSubItem
                                                    key={child.id}
                                                >
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={
                                                            childHref !== '#' &&
                                                            url.startsWith(
                                                                childHref,
                                                            )
                                                        }
                                                    >
                                                        <Link
                                                            href={childHref}
                                                            prefetch
                                                        >
                                                            <AdminIcon
                                                                name={
                                                                    child.icon
                                                                }
                                                            />
                                                            <span>
                                                                {child.name}
                                                            </span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            );
                                        })}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    );
                }

                return (
                    <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={item.name}
                        >
                            <Link href={href} prefetch>
                                <AdminIcon name={item.icon} />
                                <span>{item.name}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                );
            })}
        </SidebarMenu>
    );
}

type PageProps = {
    menus: MenuItem[];
    auth: Auth;
};

// "super_admin" -> "Super Admin", dst.
function formatRoleLabel(roles: string[]): string {
    return roles
        .map((role) =>
            role
                .split('_')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' '),
        )
        .join(', ');
}

// Satu sidebar untuk semua role — isi menu dari shared prop `menus`
// (dibangun role-aware di HandleInertiaRequests), header pakai identitas user
// (nama + role) biar sama persis di semua role, gak perlu title per-role.
export function AdminSidebar() {
    const { menus, auth } = usePage<PageProps>().props;
    const groups = groupMenus(menus ?? []);
    const userName = auth?.user?.name ?? 'User';
    const unitName = auth?.user?.direktorat?.name ?? auth?.user?.upt?.name;
    const userRole = unitName ?? formatRoleLabel(auth?.user?.roles ?? []);

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard().url} prefetch>
                                {/* Icon — always visible */}
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <AppLogoIcon className="size-4" />
                                </div>
                                {/* Text — hidden when collapsed */}
                                <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                                    <span className="truncate text-sm font-semibold">
                                        {userRole || 'User'}
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        {userName}
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {groups.map((group) => (
                    <SidebarGroup key={group.label}>
                        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <NavMenuItems items={group.items} />
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
