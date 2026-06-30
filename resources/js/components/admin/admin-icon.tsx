import {
    Activity, AlertCircle, Archive, BarChart, Bell, BookOpen,
    Calendar, ChartBar, ClipboardList, Clock, Cog, Database,
    FileText, Folder, Globe, Grid, Home, Image, Inbox,
    KeyRound, LayoutDashboard, List, Lock, LogOut, Mail,
    Map, Menu, MessageSquare, Package, Percent, Phone,
    PieChart, Settings, ShieldCheck, ShoppingCart, Star,
    Tag, Truck, User, UserCheck, Users, Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
    Activity, AlertCircle, Archive, BarChart, Bell, BookOpen,
    Calendar, ChartBar, ClipboardList, Clock, Cog, Database,
    FileText, Folder, Globe, Grid, Home, Image, Inbox,
    KeyRound, LayoutDashboard, List, Lock, LogOut, Mail,
    Map, Menu, MessageSquare, Package, Percent, Phone,
    PieChart, Settings, ShieldCheck, ShoppingCart, Star,
    Tag, Truck, User, UserCheck, Users, Wallet,
};

export function AdminIcon({ name, className }: { name: string | null; className?: string }) {
    if (!name) return null;
    const Icon = iconMap[name];
    if (!Icon) return null;
    return <Icon className={className} />;
}
