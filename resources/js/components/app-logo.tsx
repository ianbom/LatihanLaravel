import { usePage } from '@inertiajs/react';


export default function AppLogo() {
    const { name } = usePage().props;

    return (
        <>
            <div className="flex h-9 w-12 items-center justify-center overflow-hidden rounded-lg bg-white p-1">
                <img
                    src="/telkomsel-logo.png"
                    alt="Telkomsel"
                    className="h-full w-full object-contain"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold text-white">
                    {name || 'Telkomsel'}
                </span>
                <span className="truncate text-[10px] tracking-wider text-white/60 uppercase">Data workspace</span>
            </div>
        </>
    );
}
