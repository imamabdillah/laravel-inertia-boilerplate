import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { AdminIcon } from '@/components/admin/admin-icon';
import AppLogoIcon from '@/components/app-logo-icon';
import { NavUser } from '@/components/nav-user';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
import { dashboard } from '@/routes/admin';
import type { MenuItem } from '@/types';

function routeNameToUrl(routeName: string | null): string {
    if (!routeName) return '#';
    const path = routeName
        .replace(/^admin\./, '')
        .replace(/\.index$/, '')
        .replace(/\./g, '/');
    return '/admin/' + path;
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
                        <Collapsible key={item.id} defaultOpen={childActive} asChild className="group/collapsible">
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton tooltip={item.name} isActive={childActive}>
                                        <AdminIcon name={item.icon} />
                                        <span>{item.name}</span>
                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {item.children.map((child) => {
                                            const childHref = routeNameToUrl(child.route);
                                            return (
                                                <SidebarMenuSubItem key={child.id}>
                                                    <SidebarMenuSubButton asChild isActive={childHref !== '#' && url.startsWith(childHref)}>
                                                        <Link href={childHref} prefetch>
                                                            <AdminIcon name={child.icon} />
                                                            <span>{child.name}</span>
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
                        <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
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

export function AdminSidebar() {
    const { menus } = usePage().props;

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard().url} prefetch>
                                {/* Icon — always visible */}
                                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
                                    <AppLogoIcon className="size-4 fill-current" />
                                </div>
                                {/* Text — hidden when collapsed */}
                                <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                                    <span className="truncate text-sm font-semibold">Admin Panel</span>
                                    <span className="text-muted-foreground truncate text-xs">Boilerplate</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <NavMenuItems items={menus ?? []} />
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
