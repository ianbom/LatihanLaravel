import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { deleteRecord } from '@/lib/records-api';
import type { RecordItem } from '@/types';

export function DeleteRecordDialog({
    record,
    onOpenChange,
    onDeleted,
}: {
    record: RecordItem | null;
    onOpenChange: (open: boolean) => void;
    onDeleted: () => Promise<void>;
}) {
    const [submitting, setSubmitting] = useState(false);

    async function remove() {
        if (!record) {
            return;
        }

        setSubmitting(true);

        try {
            await deleteRecord(record.id);
            await onDeleted();
            onOpenChange(false);
            toast.success('Record berhasil dihapus.');
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Record gagal dihapus.',
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Dialog
            open={Boolean(record)}
            onOpenChange={(open) => !submitting && onOpenChange(open)}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Hapus record?</DialogTitle>
                    <DialogDescription>
                        Record #{record?.id} — {record?.site_name} akan dihapus
                        permanen.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        disabled={submitting}
                        onClick={() => onOpenChange(false)}
                    >
                        Batal
                    </Button>
                    <Button
                        variant="destructive"
                        disabled={submitting}
                        onClick={remove}
                    >
                        <Trash2 /> {submitting ? 'Menghapus...' : 'Hapus'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
