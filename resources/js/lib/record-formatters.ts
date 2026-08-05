import type { RecordItem } from '@/types';

export type SortKey = 'id' | 'site_name' | 'revenue' | 'user' | 'created_at';

export function formatRevenue(value: number): string {
    return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(
        value,
    );
}

export function formatDate(value: string): string {
    const normalized = value.includes('T') ? value : value.replace(' ', 'T');
    const date = new Date(normalized);

    return Number.isNaN(date.getTime())
        ? value || 'Tanggal tidak valid'
        : new Intl.DateTimeFormat('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
          }).format(date);
}

export function filterAndSortRecords(
    records: RecordItem[],
    search: string,
    sortKey: SortKey,
    direction: 'asc' | 'desc',
): RecordItem[] {
    const query = search.trim().toLocaleLowerCase('id-ID');
    const filtered = query
        ? records.filter((record) =>
              `${record.site_name} ${record.user}`
                  .toLocaleLowerCase('id-ID')
                  .includes(query),
          )
        : records;

    return [...filtered].sort((left, right) => {
        const leftValue = left[sortKey];
        const rightValue = right[sortKey];
        const comparison =
            typeof leftValue === 'number' && typeof rightValue === 'number'
                ? leftValue - rightValue
                : String(leftValue).localeCompare(String(rightValue), 'id-ID', {
                      numeric: true,
                  });

        return direction === 'asc' ? comparison : -comparison;
    });
}
