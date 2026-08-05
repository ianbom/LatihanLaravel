import { Sprout } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { seedRecords } from '@/lib/records-api';

export function SeedRecordsDialog({
    open,
    onOpenChange,
    onSeeded,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSeeded: () => Promise<void>;
}) {
    const [count, setCount] = useState('5');
    const [submitting, setSubmitting] = useState(false);
    const parsedCount = Number(count);
    const error =
        Number.isInteger(parsedCount) && parsedCount >= 1
            ? null
            : 'Count harus berupa integer positif.';

    async function seed() {
        if (error) {
            return;
        }

        setSubmitting(true);

        try {
            await seedRecords(parsedCount);
            await onSeeded();
            onOpenChange(false);
            toast.success(`${parsedCount} seed record berhasil dibuat.`);
        } catch (requestError) {
            toast.error(
                requestError instanceof Error
                    ? requestError.message
                    : 'Seed data gagal dibuat.',
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(value) => !submitting && onOpenChange(value)}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Generate Seed Data</DialogTitle>
                    <DialogDescription>
                        Record dummy baru akan ditambahkan ke data saat ini.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                    <Label htmlFor="seed-count">Jumlah record</Label>
                    <Input
                        id="seed-count"
                        type="number"
                        min="1"
                        value={count}
                        onChange={(event) => setCount(event.target.value)}
                        aria-invalid={Boolean(error)}
                    />
                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        disabled={submitting}
                        onClick={() => onOpenChange(false)}
                    >
                        Batal
                    </Button>
                    <Button
                        disabled={submitting || Boolean(error)}
                        onClick={seed}
                    >
                        <Sprout /> {submitting ? 'Membuat...' : 'Generate'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
