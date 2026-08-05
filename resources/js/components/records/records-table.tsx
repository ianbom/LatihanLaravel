import { ArrowDown, ArrowUp, ArrowUpDown, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate, formatRevenue } from '@/lib/record-formatters';
import type { SortKey } from '@/lib/record-formatters';
import type { RecordItem } from '@/types';

const columns: Array<{ sortKey: SortKey; label: string }> = [
    { sortKey: 'id', label: 'ID' },
    { sortKey: 'site_name', label: 'Site Name' },
    { sortKey: 'revenue', label: 'Revenue' },
    { sortKey: 'user', label: 'User' },
    { sortKey: 'created_at', label: 'Created At' },
];

export function RecordsTable({
    records,
    sortKey,
    direction,
    onSort,
    onPayload,
    onDelete,
}: {
    records: RecordItem[];
    sortKey: SortKey;
    direction: 'asc' | 'desc';
    onSort: (key: SortKey) => void;
    onPayload: (record: RecordItem) => void;
    onDelete: (record: RecordItem) => void;
}) {
    return (
        <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[960px] text-sm">
                <thead className="sticky top-0 z-10 bg-muted/95 text-left">
                    <tr>
                        {columns.slice(0, 4).map((column) => (
                            <SortableHeader
                                key={column.sortKey}
                                {...column}
                                active={sortKey === column.sortKey}
                                direction={direction}
                                onSort={onSort}
                            />
                        ))}
                        <th className="px-4 py-3 font-medium">
                            Detail Payload
                        </th>
                        <SortableHeader
                            {...columns[4]}
                            active={sortKey === 'created_at'}
                            direction={direction}
                            onSort={onSort}
                        />
                        <th className="px-4 py-3 text-right font-medium">
                            Aksi
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {records.map((record) => (
                        <tr key={record.id} className="hover:bg-muted/40">
                            <td className="px-4 py-3 font-mono text-xs">
                                #{record.id}
                            </td>
                            <td className="max-w-48 px-4 py-3 font-medium break-words">
                                {record.site_name}
                            </td>
                            <td className="px-4 py-3 tabular-nums">
                                {formatRevenue(record.revenue)}
                            </td>
                            <td className="max-w-40 px-4 py-3 break-words">
                                {record.user}
                            </td>
                            <td className="max-w-64 px-4 py-3">
                                <button
                                    type="button"
                                    className="flex max-w-full items-center gap-2 text-left font-mono text-xs text-muted-foreground hover:text-foreground"
                                    onClick={() => onPayload(record)}
                                >
                                    <Eye className="size-4 shrink-0" />
                                    <span className="truncate">
                                        {record.payload}
                                    </span>
                                </button>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                                {formatDate(record.created_at)}
                            </td>
                            <td className="px-4 py-3 text-right">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => onDelete(record)}
                                >
                                    <Trash2 /> Hapus
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function SortableHeader({
    sortKey: columnKey,
    label,
    active,
    direction,
    onSort,
}: {
    sortKey: SortKey;
    label: string;
    active: boolean;
    direction: 'asc' | 'desc';
    onSort: (key: SortKey) => void;
}) {
    const Icon = !active
        ? ArrowUpDown
        : direction === 'asc'
          ? ArrowUp
          : ArrowDown;

    return (
        <th className="px-4 py-3 font-medium">
            <button
                type="button"
                className="flex items-center gap-1.5 whitespace-nowrap hover:text-foreground"
                onClick={() => onSort(columnKey)}
            >
                {label}
                <Icon className="size-3.5" />
            </button>
        </th>
    );
}
