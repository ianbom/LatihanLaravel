import { Braces, Plus } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
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
import { createRecord, RecordsApiError } from '@/lib/records-api';
import { createRecordSchema } from '@/schemas/record-schema';

type FieldErrors = Partial<
    Record<'site_name' | 'revenue' | 'user' | 'payload', string>
>;

const initialForm = {
    site_name: '',
    revenue: '',
    user: '',
    payload: '{\n  "status": "active"\n}',
};

export function CreateRecordDialog({
    open,
    onOpenChange,
    onCreated,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated: () => Promise<void>;
}) {
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [submitting, setSubmitting] = useState(false);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const result = createRecordSchema.safeParse(form);

        if (!result.success) {
            const nextErrors: FieldErrors = {};

            for (const issue of result.error.issues) {
                const field = issue.path[0] as keyof FieldErrors;
                nextErrors[field] ??= issue.message;
            }

            setErrors(nextErrors);

            return;
        }

        setSubmitting(true);
        setErrors({});

        try {
            await createRecord(result.data);
            await onCreated();
            setForm(initialForm);
            onOpenChange(false);
            toast.success('Record berhasil ditambahkan.');
        } catch (error) {
            if (error instanceof RecordsApiError && error.errors) {
                setErrors(
                    Object.fromEntries(
                        Object.entries(error.errors).map(
                            ([field, messages]) => [field, messages[0]],
                        ),
                    ),
                );
            }

            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Record gagal ditambahkan.',
            );
        } finally {
            setSubmitting(false);
        }
    }

    function formatPayload() {
        try {
            setForm({
                ...form,
                payload: JSON.stringify(JSON.parse(form.payload), null, 2),
            });
            setErrors({ ...errors, payload: undefined });
        } catch {
            setErrors({
                ...errors,
                payload: 'Payload harus berupa JSON yang valid.',
            });
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(value) => !submitting && onOpenChange(value)}
        >
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <form onSubmit={submit} className="space-y-5">
                    <DialogHeader>
                        <DialogTitle>Tambah Record</DialogTitle>
                        <DialogDescription>
                            Data diteruskan dengan aman melalui Laravel ke Go
                            API.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                            htmlFor="record-site-name"
                            label="Site Name"
                            error={errors.site_name}
                            count={`${form.site_name.length}/100`}
                        >
                            <Input
                                id="record-site-name"
                                value={form.site_name}
                                maxLength={100}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        site_name: event.target.value,
                                    })
                                }
                                aria-invalid={Boolean(errors.site_name)}
                            />
                        </Field>
                        <Field
                            htmlFor="record-revenue"
                            label="Revenue"
                            error={errors.revenue}
                        >
                            <Input
                                id="record-revenue"
                                type="number"
                                min="0"
                                max="1000000000"
                                step="any"
                                value={form.revenue}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        revenue: event.target.value,
                                    })
                                }
                                aria-invalid={Boolean(errors.revenue)}
                            />
                        </Field>
                        <Field
                            htmlFor="record-user"
                            label="User"
                            error={errors.user}
                            count={`${form.user.length}/50`}
                        >
                            <Input
                                id="record-user"
                                value={form.user}
                                maxLength={50}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        user: event.target.value,
                                    })
                                }
                                aria-invalid={Boolean(errors.user)}
                            />
                        </Field>
                    </div>

                    <Field
                        htmlFor="record-payload"
                        label="Payload JSON"
                        error={errors.payload}
                        count={`${new Blob([form.payload]).size}/51200 bytes`}
                    >
                        <textarea
                            id="record-payload"
                            value={form.payload}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    payload: event.target.value,
                                })
                            }
                            aria-invalid={Boolean(errors.payload)}
                            className="min-h-40 w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={formatPayload}
                        >
                            <Braces /> Format JSON
                        </Button>
                    </Field>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={submitting}
                            onClick={() => onOpenChange(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            <Plus />{' '}
                            {submitting ? 'Menyimpan...' : 'Tambah Record'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function Field({
    htmlFor,
    label,
    error,
    count,
    children,
}: {
    htmlFor?: string;
    label: string;
    error?: string;
    count?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
                <Label htmlFor={htmlFor}>{label}</Label>
                {count && (
                    <span className="text-xs text-muted-foreground">
                        {count}
                    </span>
                )}
            </div>
            {children}
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
}
