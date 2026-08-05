import { Head } from '@inertiajs/react';
import {
    Database,
    Plus,
    RefreshCw,
    Search,
    Sprout,
    TriangleAlert,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CreateRecordDialog } from '@/components/records/create-record-dialog';
import { DeleteRecordDialog } from '@/components/records/delete-record-dialog';
import { RecordPayloadDialog } from '@/components/records/record-payload-dialog';
import { RecordsTable } from '@/components/records/records-table';
import { SeedRecordsDialog } from '@/components/records/seed-records-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { filterAndSortRecords } from '@/lib/record-formatters';
import type { SortKey } from '@/lib/record-formatters';
import { getRecords, RecordsApiError } from '@/lib/records-api';
import type { RecordItem } from '@/types';

export default function RecordsPage() {
    const [records, setRecords] = useState<RecordItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastSynced, setLastSynced] = useState<Date | null>(null);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('id');
    const [direction, setDirection] = useState<'asc' | 'desc'>('desc');
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);
    const [createOpen, setCreateOpen] = useState(false);
    const [seedOpen, setSeedOpen] = useState(false);
    const [payloadRecord, setPayloadRecord] = useState<RecordItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<RecordItem | null>(null);

    const loadRecords = useCallback(async (background = false) => {
        if (background) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        setError(null);

        try {
            setRecords(await getRecords());
            setLastSynced(new Date());
        } catch (requestError) {
            if (
                requestError instanceof RecordsApiError &&
                requestError.code === 'SESSION_EXPIRED'
            ) {
                window.location.assign('/login');

                return;
            }

            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'Records gagal dimuat.',
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        let active = true;

        getRecords()
            .then((data) => {
                if (active) {
                    setRecords(data);
                    setLastSynced(new Date());
                }
            })
            .catch((requestError: unknown) => {
                if (!active) {
                    return;
                }

                if (
                    requestError instanceof RecordsApiError &&
                    requestError.code === 'SESSION_EXPIRED'
                ) {
                    window.location.assign('/login');

                    return;
                }

                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : 'Records gagal dimuat.',
                );
            })
            .finally(() => active && setLoading(false));

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        const timeout = window.setTimeout(
            () => setDebouncedSearch(search),
            300,
        );

        return () => window.clearTimeout(timeout);
    }, [search]);

    const filteredRecords = useMemo(
        () =>
            filterAndSortRecords(records, debouncedSearch, sortKey, direction),
        [records, debouncedSearch, sortKey, direction],
    );
    const pageCount = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
    const safePage = Math.min(page, pageCount);
    const visibleRecords = filteredRecords.slice(
        (safePage - 1) * pageSize,
        safePage * pageSize,
    );

    function sort(key: SortKey) {
        if (sortKey === key) {
            setDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setDirection('asc');
        }
    }

    return (
        <>
            <Head title="Records" />
            <div className="flex h-full flex-1 flex-col gap-5 p-4 md:p-6">
                <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Data Management
                        </p>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Records
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Kelola data Go API tanpa mengekspos token ke
                            browser.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            onClick={() => void loadRecords(true)}
                            disabled={refreshing}
                        >
                            <RefreshCw
                                className={refreshing ? 'animate-spin' : ''}
                            />{' '}
                            Refresh
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setSeedOpen(true)}
                        >
                            <Sprout /> Generate Seed Data
                        </Button>
                        <Button onClick={() => setCreateOpen(true)}>
                            <Plus /> Tambah Record
                        </Button>
                    </div>
                </header>

                {error && (
                    <Alert variant="destructive">
                        <TriangleAlert />
                        <AlertTitle>Data gagal dimuat</AlertTitle>
                        <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
                            <span>{error}</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => void loadRecords()}
                            >
                                Coba Lagi
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                <Card className="gap-4 py-5">
                    <CardHeader className="gap-4 px-5 md:flex-row md:items-end md:justify-between">
                        <div>
                            <CardTitle>
                                {filteredRecords.length} Record
                            </CardTitle>
                            <CardDescription>
                                {lastSynced
                                    ? `Terakhir sinkron ${lastSynced.toLocaleTimeString('id-ID')}`
                                    : 'Menunggu sinkronisasi'}
                            </CardDescription>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <div className="relative min-w-64">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="search"
                                    aria-label="Cari record berdasarkan site atau user"
                                    value={search}
                                    onChange={(event) => {
                                        setSearch(event.target.value);
                                        setPage(1);
                                    }}
                                    placeholder="Cari site atau user..."
                                    className="pl-9"
                                />
                            </div>
                            <Select
                                value={String(pageSize)}
                                onValueChange={(value) => {
                                    setPageSize(Number(value));
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="w-full sm:w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[10, 25, 50, 100].map((size) => (
                                        <SelectItem
                                            key={size}
                                            value={String(size)}
                                        >
                                            {size} / halaman
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent className="px-5">
                        {loading ? (
                            <TableSkeleton />
                        ) : records.length === 0 && !error ? (
                            <EmptyState
                                onCreate={() => setCreateOpen(true)}
                                onSeed={() => setSeedOpen(true)}
                            />
                        ) : filteredRecords.length === 0 ? (
                            <div className="rounded-lg border border-dashed py-14 text-center">
                                <p className="font-medium">
                                    Record tidak ditemukan.
                                </p>
                                <Button
                                    variant="link"
                                    onClick={() => setSearch('')}
                                >
                                    Reset pencarian
                                </Button>
                            </div>
                        ) : (
                            <RecordsTable
                                records={visibleRecords}
                                sortKey={sortKey}
                                direction={direction}
                                onSort={sort}
                                onPayload={setPayloadRecord}
                                onDelete={setDeleteTarget}
                            />
                        )}

                        {!loading && filteredRecords.length > 0 && (
                            <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
                                <p className="text-sm text-muted-foreground">
                                    Halaman {safePage} dari {pageCount}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={safePage <= 1}
                                        onClick={() => setPage(safePage - 1)}
                                    >
                                        Sebelumnya
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={safePage >= pageCount}
                                        onClick={() => setPage(safePage + 1)}
                                    >
                                        Berikutnya
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <CreateRecordDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                onCreated={() => loadRecords(true)}
            />
            <SeedRecordsDialog
                open={seedOpen}
                onOpenChange={setSeedOpen}
                onSeeded={() => loadRecords(true)}
            />
            <RecordPayloadDialog
                record={payloadRecord}
                onOpenChange={(open) => !open && setPayloadRecord(null)}
            />
            <DeleteRecordDialog
                record={deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                onDeleted={() => loadRecords(true)}
            />
        </>
    );
}

function TableSkeleton() {
    return (
        <div className="space-y-3" aria-busy="true" aria-label="Memuat records">
            {Array.from({ length: 7 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
            ))}
        </div>
    );
}

function EmptyState({
    onCreate,
    onSeed,
}: {
    onCreate: () => void;
    onSeed: () => void;
}) {
    return (
        <div className="rounded-lg border border-dashed px-4 py-16 text-center">
            <Database className="mx-auto size-10 text-muted-foreground" />
            <h2 className="mt-4 font-semibold">Belum ada record</h2>
            <p className="mt-1 text-sm text-muted-foreground">
                Tambah record manual atau buat data contoh.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Button onClick={onCreate}>
                    <Plus /> Tambah Record
                </Button>
                <Button variant="outline" onClick={onSeed}>
                    <Sprout /> Generate Seed
                </Button>
            </div>
        </div>
    );
}

RecordsPage.layout = { breadcrumbs: [{ title: 'Records', href: '/records' }] };
