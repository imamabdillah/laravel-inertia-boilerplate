import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function AdminIcon({ name, className }: { name: string | null; className?: string }) {
    if (!name) return null;
    // lucide icons are forwardRef objects (not plain functions) with displayName set.
    // Using displayName to distinguish real icon exports from utility functions.
    const Icon = (LucideIcons as Record<string, LucideIcon & { displayName?: string }>)[name];
    if (!Icon?.displayName) return null;
    return <Icon className={className} />;
}
