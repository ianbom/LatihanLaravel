import { Link } from '@inertiajs/react';
import { Bell, RefreshCw } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="sticky top-0 z-20 flex h-[72px] shrink-0 items-center gap-2 border-b bg-white px-4 transition-[width,height] ease-linear md:px-6">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="ml-auto flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild aria-label="Buka halaman records">
                    <Link href="/records"><RefreshCw className="size-4" /></Link>
                </Button>
                <Button variant="ghost" size="icon" aria-label="Notifikasi">
                    <Bell className="size-4" />
                </Button>
            </div>
        </header>
    );
}
