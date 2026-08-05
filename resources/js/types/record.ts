export type RecordItem = {
    id: number;
    site_name: string;
    revenue: number;
    user: string;
    payload: string;
    created_at: string;
};

export type CreateRecordInput = {
    site_name: string;
    revenue: number;
    user: string;
    payload: string;
};

export type ApiResponse<T> = {
    success: boolean;
    message: string;
    data?: T;
    errors?: Record<string, string[]>;
    code?: string;
    retry_after?: number;
};
