import type { ApiResponse, CreateRecordInput, RecordItem } from '@/types';

export class RecordsApiError extends Error {
    constructor(
        message: string,
        public readonly code?: string,
        public readonly errors?: Record<string, string[]>,
    ) {
        super(message);
    }
}

async function request<T>(
    url: string,
    init?: RequestInit,
): Promise<ApiResponse<T>> {
    const csrfToken = document
        .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
        ?.getAttribute('content');
    let response: Response;

    try {
        response = await fetch(url, {
            ...init,
            credentials: 'same-origin',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                ...init?.headers,
            },
        });
    } catch {
        throw new RecordsApiError(
            'Backend tidak dapat dihubungi.',
            'BACKEND_UNREACHABLE',
        );
    }

    const body = (await response.json()) as ApiResponse<T>;

    if (!response.ok || !body.success) {
        if (body.code === 'SESSION_EXPIRED') {
            window.location.assign('/login');
        }

        throw new RecordsApiError(body.message, body.code, body.errors);
    }

    return body;
}

export async function getRecords(): Promise<RecordItem[]> {
    return (await request<RecordItem[]>('/internal-api/records')).data ?? [];
}

export async function createRecord(input: CreateRecordInput): Promise<void> {
    await request<RecordItem>('/internal-api/records', {
        method: 'POST',
        body: JSON.stringify(input),
    });
}

export async function deleteRecord(id: number): Promise<void> {
    await request<null>(`/internal-api/records/${id}`, { method: 'DELETE' });
}

export async function seedRecords(count: number): Promise<void> {
    await request('/internal-api/seed', {
        method: 'POST',
        body: JSON.stringify({ count }),
    });
}
