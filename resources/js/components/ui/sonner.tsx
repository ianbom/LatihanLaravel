import { useFlashToast } from '@/hooks/use-flash-toast';
import { useAppearance } from '@/hooks/use-appearance';
import { useEffect } from 'react';
import { toast, Toaster as Sonner, type ToasterProps } from 'sonner';

function Toaster({ ...props }: ToasterProps) {
    const { appearance } = useAppearance();

    useFlashToast();

    useEffect(() => {
        const notice = window.sessionStorage.getItem(
            'telkomsel-analytics-notice',
        );

        if (notice) {
            window.sessionStorage.removeItem('telkomsel-analytics-notice');
            toast.error(notice);
        }
    }, []);

    return (
        <Sonner
            theme={appearance}
            className="toaster group"
            position="bottom-right"
            richColors
            closeButton
            toastOptions={{
                className:
                    'rounded-2xl border border-slate-200! bg-white! shadow-[0_18px_45px_rgba(0,26,65,.16)]! font-sans',
            }}
            style={
                {
                    '--normal-bg': 'var(--popover)',
                    '--normal-text': 'var(--popover-foreground)',
                    '--normal-border': 'var(--border)',
                } as React.CSSProperties
            }
            {...props}
        />
    );
}

export { Toaster };
