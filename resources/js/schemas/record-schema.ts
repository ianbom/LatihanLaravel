import { z } from 'zod';

export const createRecordSchema = z.object({
    site_name: z
        .string()
        .trim()
        .min(1, 'Site name wajib diisi.')
        .max(100, 'Site name maksimal 100 karakter.'),
    revenue: z.preprocess(
        (value) => (value === '' ? undefined : value),
        z.coerce
            .number({ error: 'Revenue wajib diisi dan harus berupa angka.' })
            .finite('Revenue harus berupa angka valid.')
            .min(0, 'Revenue minimal 0.')
            .max(1_000_000_000, 'Revenue maksimal 1.000.000.000.'),
    ),
    user: z
        .string()
        .trim()
        .min(1, 'User wajib diisi.')
        .max(50, 'User maksimal 50 karakter.'),
    payload: z
        .string()
        .min(1, 'Payload wajib diisi.')
        .refine(
            (value) => new Blob([value]).size <= 50 * 1024,
            'Payload maksimal 50 KB.',
        )
        .refine((value) => {
            try {
                const parsed: unknown = JSON.parse(value);

                return (
                    typeof parsed === 'object' &&
                    parsed !== null &&
                    !Array.isArray(parsed)
                );
            } catch {
                return false;
            }
        }, 'Payload harus berupa objek JSON yang valid.'),
});
