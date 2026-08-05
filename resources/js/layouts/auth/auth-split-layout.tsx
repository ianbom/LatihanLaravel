import { Link, usePage } from '@inertiajs/react';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <div className="grid min-h-svh bg-slate-50 lg:grid-cols-2">
            <div className="relative hidden overflow-hidden bg-[linear-gradient(135deg,#b70024_0%,#ff0025_58%,#fda22b_100%)] p-12 text-white lg:flex lg:flex-col">
                <div className="absolute -right-20 -bottom-24 size-96 rounded-full border-[42px] border-white/15" />
                <div className="absolute top-20 right-16 size-24 rounded-[32px_32px_72px_32px] bg-[#fda22b]" />
                <Link
                    href={home()}
                    className="relative z-20 flex items-center gap-3 text-lg font-semibold"
                >
                    <span className="flex h-10 w-14 items-center justify-center rounded-xl bg-white p-1.5">
                        <img src="/telkomsel-logo.png" alt="Telkomsel" className="h-full w-full object-contain" />
                    </span>
                    {name || 'Telkomsel'}
                </Link>
                <div className="relative z-10 my-auto max-w-lg">
                    <p className="mb-5 flex items-center gap-2 text-sm font-semibold tracking-wide text-white/85">
                        <Sparkles className="size-4" /> ANALYTICS PLATFORM
                    </p>
                    <h2 className="text-5xl leading-[1.08] font-bold tracking-tight">
                        Data yang jelas untuk keputusan yang lebih cepat.
                    </h2>
                    <p className="mt-6 max-w-md text-lg leading-8 text-white/90">
                        Pantau performa records, revenue, dan kesehatan layanan dalam satu dashboard.
                    </p>
                    <div className="mt-10 flex items-center gap-3 text-sm font-medium text-white/90">
                        <ShieldCheck className="size-5 text-[#fda22b]" />
                        Akses data terlindungi dengan autentikasi JWT
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-center px-6 py-12 sm:px-10 lg:p-12">
                <div className="w-full max-w-[420px]">
                    <Link
                        href={home()}
                        className="mb-10 flex items-center gap-3 text-[#001a41] lg:hidden"
                    >
                        <span className="flex h-10 w-14 items-center justify-center rounded-xl bg-white p-1.5 shadow-sm">
                            <img src="/telkomsel-logo.png" alt="Telkomsel" className="h-full w-full object-contain" />
                        </span>
                        <span className="font-semibold">{name || 'Telkomsel'}</span>
                    </Link>
                    <div className="mb-8 flex flex-col gap-2 text-left">
                        <h1 className="text-3xl font-bold tracking-tight text-[#001a41]">{title}</h1>
                        <p className="text-sm leading-6 text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
