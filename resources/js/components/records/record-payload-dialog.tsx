import { Check, Copy, TriangleAlert } from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatDate, formatRevenue } from '@/lib/record-formatters';
import type { RecordItem } from '@/types';

export function RecordPayloadDialog({
    record,
    onOpenChange,
}: {
    record: RecordItem | null;
    onOpenChange: (open: boolean) => void;
}) {
    const payload = useMemo(() => {
        if (!record) {
            return { text: '', valid: true };
        }

        try {
            return {
                text: JSON.stringify(JSON.parse(record.payload), null, 2),
                valid: true,
            };
        } catch {
            return { text: record.payload, valid: false };
        }
    }, [record]);

    async function copy() {
        try {
            await navigator.clipboard.writeText(payload.text);
            toast.success('Payload berhasil disalin.');
        } catch {
            toast.error('Payload gagal disalin.');
        }
    }

    return (
        <Dialog open={Boolean(record)} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Detail Record #{record?.id}</DialogTitle>
                    <DialogDescription>
                        {record?.site_name} · {record?.user} ·{' '}
                        {record ? formatRevenue(record.revenue) : ''} ·{' '}
                        {record ? formatDate(record.created_at) : ''}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-between gap-3">
                    <Badge
                        variant={payload.valid ? 'secondary' : 'destructive'}
                    >
                        {payload.valid ? <Check /> : <TriangleAlert />}
                        {payload.valid ? 'Valid JSON' : 'Invalid JSON from API'}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={copy}>
                        <Copy /> Salin
                    </Button>
                </div>
                <pre className="max-h-[55vh] overflow-auto rounded-lg bg-muted p-4 text-xs break-words whitespace-pre-wrap">
                    {payload.text}
                </pre>
            </DialogContent>
        </Dialog>
    );
}
