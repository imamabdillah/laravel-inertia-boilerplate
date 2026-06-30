import { Moon, Sun } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAppearance } from '@/hooks/use-appearance';
import type { BreadcrumbItem } from '@/types';

export function AdminHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItem[] }) {
    const { resolvedAppearance, updateAppearance } = useAppearance();

    return (
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1 h-8 w-8" />
            <Separator orientation="vertical" className="mr-1 h-4" />
            <Breadcrumbs breadcrumbs={breadcrumbs} />
            <div className="ml-auto">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark')}
                    className="h-8 w-8"
                >
                    {resolvedAppearance === 'dark'
                        ? <Sun className="h-4 w-4" />
                        : <Moon className="h-4 w-4" />}
                </Button>
            </div>
        </header>
    );
}
