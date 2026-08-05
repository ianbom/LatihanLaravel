import { Head } from '@inertiajs/react';
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Tooltip,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import {
    Activity,
    Clock3,
    Database,
    HardDrive,
    MemoryStick,
    RefreshCw,
    TrendingUp,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { dashboard } from '@/routes';

ChartJS.register(
    ArcElement,
    BarElement,
    CategoryScale,
    Legend,
    LinearScale,
    Tooltip,
);

type RecordItem = {
    id: number;
    site_name: string;
    revenue: number;
    user: string;
    payload: string;
    created_at: string;
};

type DashboardStats = {
    total_records: number;
    total_revenue: number;
    alloc_memory_mb: number;
    sys_memory_mb: number;
    num_goroutines: number;
    uptime: string;
};

type ApiResponse<T> = {
    success: boolean;
    data?: T;
    message?: string;
    code?: string;
};

type DashboardErrors = {
    records?: string;
    stats?: string;
};

const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('id-ID');

const compactCurrencyFormatter = new Intl.NumberFormat('id-ID', {
    notation: 'compact',
    maximumFractionDigits: 1,
});

const timeFormatter = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
});

const userColors = [
    '#2563eb',
    '#7c3aed',
    '#0891b2',
    '#059669',
    '#ca8a04',
    '#ea580c',
    '#dc2626',
    '#db2777',
    '#4f46e5',
    '#64748b',
];

class DashboardApiError extends Error {
    constructor(
        message: string,
        public readonly code?: string,
    ) {
        super(message);
    }
}

async function fetchDashboardData<T>(url: string): Promise<T> {
    const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
    });
    const payload = (await response.json().catch(() => ({}))) as ApiResponse<T>;

    if (!response.ok || !payload.success || payload.data === undefined) {
        if (payload.code === 'SESSION_EXPIRED') {
            window.location.assign('/login');
        }

        throw new DashboardApiError(
            payload.message ?? 'Data dashboard gagal dimuat.',
            payload.code,
        );
    }

    return payload.data;
}

function errorMessage(reason: unknown): string {
    return reason instanceof Error
        ? reason.message
        : 'Data dashboard gagal dimuat.';
}

function revenueBySite(records: RecordItem[]) {
    const totals = new Map<string, number>();

    for (const record of records) {
        const siteName = record.site_name.trim() || 'Tanpa nama';
        totals.set(siteName, (totals.get(siteName) ?? 0) + record.revenue);
    }

    const sorted = [...totals.entries()].sort(
        (left, right) => right[1] - left[1],
    );
    const visible = sorted.slice(0, 10);

    if (sorted.length > 10) {
        visible.push([
            'Lainnya',
            sorted.slice(10).reduce((total, [, revenue]) => total + revenue, 0),
        ]);
    }

    return visible;
}

function recordsByUser(records: RecordItem[]) {
    const totals = new Map<string, number>();

    for (const record of records) {
        const user = record.user.trim() || 'Unknown';
        totals.set(user, (totals.get(user) ?? 0) + 1);
    }

    return [...totals.entries()].sort((left, right) => right[1] - left[1]);
}

export default function Dashboard() {
    const [records, setRecords] = useState<RecordItem[] | null>(null);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [errors, setErrors] = useState<DashboardErrors>({});
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const requestInFlight = useRef(false);

    const refresh = useCallback(async () => {
        if (requestInFlight.current) {
            return;
        }

        requestInFlight.current = true;
        setIsRefreshing(true);

        const [recordsResult, statsResult] = await Promise.allSettled([
            fetchDashboardData<RecordItem[]>('/internal-api/records'),
            fetchDashboardData<DashboardStats>('/internal-api/stats'),
        ]);
        const nextErrors: DashboardErrors = {};
        let updated = false;

        if (recordsResult.status === 'fulfilled') {
            setRecords(recordsResult.value);
            updated = true;
        } else {
            nextErrors.records = errorMessage(recordsResult.reason);
        }

        if (statsResult.status === 'fulfilled') {
            setStats(statsResult.value);
            updated = true;
        } else {
            nextErrors.stats = errorMessage(statsResult.reason);
        }

        setErrors(nextErrors);

        if (updated) {
            setLastUpdated(new Date());
        }

        requestInFlight.current = false;
        setIsRefreshing(false);
    }, []);

    useEffect(() => {
        const initialRefresh = window.setTimeout(() => {
            void refresh();
        }, 0);

        const interval = window.setInterval(() => {
            if (!document.hidden) {
                void refresh();
            }
        }, 60_000);
        const handleVisibility = () => {
            if (!document.hidden) {
                void refresh();
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            window.clearTimeout(initialRefresh);
            window.clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [refresh]);

    const siteRevenue = useMemo(() => revenueBySite(records ?? []), [records]);
    const userRecords = useMemo(() => recordsByUser(records ?? []), [records]);

    const revenueData = useMemo(
        () => ({
            labels: siteRevenue.map(([site]) => site),
            datasets: [
                {
                    label: 'Pendapatan',
                    data: siteRevenue.map(([, revenue]) => revenue),
                    backgroundColor: 'rgba(37, 99, 235, 0.72)',
                    borderColor: '#2563eb',
                    borderWidth: 1,
                    borderRadius: 6,
                },
            ],
        }),
        [siteRevenue],
    );

    const userData = useMemo(
        () => ({
            labels: userRecords.map(([user]) => user),
            datasets: [
                {
                    label: 'Jumlah record',
                    data: userRecords.map(([, total]) => total),
                    backgroundColor: userRecords.map(
                        (_, index) => userColors[index % userColors.length],
                    ),
                    borderColor: '#ffffff',
                    borderWidth: 2,
                    hoverOffset: 6,
                },
            ],
        }),
        [userRecords],
    );

    const revenueOptions: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) =>
                        currencyFormatter.format(Number(context.parsed.x)),
                },
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                grid: { color: 'rgba(148, 163, 184, 0.18)' },
                ticks: {
                    color: '#71717a',
                    callback: (value) =>
                        compactCurrencyFormatter.format(Number(value)),
                },
            },
            y: {
                grid: { display: false },
                ticks: { color: '#71717a' },
            },
        },
    };

    const userOptions: ChartOptions<'doughnut'> = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '64%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 10,
                    color: '#71717a',
                    padding: 16,
                    usePointStyle: true,
                },
            },
            tooltip: {
                callbacks: {
                    label: (context) =>
                        `${context.label}: ${numberFormatter.format(context.parsed)} record`,
                },
            },
        },
    };

    return (
        <>
            <Head title="Dashboard" />
            <main className="flex flex-1 flex-col gap-6 overflow-x-hidden p-4 md:p-6">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Ringkasan performa sistem
                        </p>
                        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                            Dashboard Analitik
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {lastUpdated
                                ? `Terakhir diperbarui ${timeFormatter.format(lastUpdated)}`
                                : 'Menyiapkan data terbaru...'}
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isRefreshing}
                        onClick={() => void refresh()}
                    >
                        <RefreshCw
                            className={
                                isRefreshing ? 'animate-spin' : undefined
                            }
                        />
                        {isRefreshing ? 'Memperbarui...' : 'Perbarui data'}
                    </Button>
                </header>

                {errors.stats && stats && (
                    <InlineError
                        message={`${errors.stats} Menampilkan statistik terakhir.`}
                    />
                )}

                <section
                    aria-label="Metrik utama"
                    className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                >
                    <MetricCard
                        title="Total Records"
                        value={
                            stats
                                ? numberFormatter.format(stats.total_records)
                                : null
                        }
                        description="Jumlah seluruh record"
                        icon={Database}
                        error={!stats ? errors.stats : undefined}
                    />
                    <MetricCard
                        title="Total Pendapatan"
                        value={
                            stats
                                ? currencyFormatter.format(stats.total_revenue)
                                : null
                        }
                        description="Format tampilan IDR"
                        icon={TrendingUp}
                        error={!stats ? errors.stats : undefined}
                    />
                    <MetricCard
                        title="Allocated Memory"
                        value={
                            stats
                                ? `${stats.alloc_memory_mb.toFixed(2)} MB`
                                : null
                        }
                        description="Memori aktif backend"
                        icon={MemoryStick}
                        error={!stats ? errors.stats : undefined}
                    />
                    <MetricCard
                        title="System Memory"
                        value={
                            stats
                                ? `${stats.sys_memory_mb.toFixed(2)} MB`
                                : null
                        }
                        description="Memori sistem backend"
                        icon={HardDrive}
                        error={!stats ? errors.stats : undefined}
                    />
                    <MetricCard
                        title="Goroutines"
                        value={
                            stats
                                ? numberFormatter.format(stats.num_goroutines)
                                : null
                        }
                        description="Proses konkuren aktif"
                        icon={Activity}
                        error={!stats ? errors.stats : undefined}
                    />
                    <MetricCard
                        title="Uptime"
                        value={stats?.uptime ?? null}
                        description="Durasi backend berjalan"
                        icon={Clock3}
                        error={!stats ? errors.stats : undefined}
                    />
                </section>

                {errors.records && records && (
                    <InlineError
                        message={`${errors.records} Menampilkan grafik terakhir.`}
                    />
                )}

                <section
                    aria-label="Grafik analitik"
                    className="grid gap-4 xl:grid-cols-5"
                >
                    <ChartCard
                        className="xl:col-span-3"
                        title="Pendapatan per Situs"
                        description="Sepuluh situs dengan pendapatan tertinggi"
                        loading={records === null && !errors.records}
                        error={records === null ? errors.records : undefined}
                        empty={records?.length === 0}
                    >
                        <div className="h-[360px]">
                            <Bar data={revenueData} options={revenueOptions} />
                        </div>
                    </ChartCard>

                    <ChartCard
                        className="xl:col-span-2"
                        title="Records per Pengguna"
                        description="Distribusi record berdasarkan pengguna"
                        loading={records === null && !errors.records}
                        error={records === null ? errors.records : undefined}
                        empty={records?.length === 0}
                    >
                        <div className="h-[360px]">
                            <Doughnut data={userData} options={userOptions} />
                        </div>
                    </ChartCard>
                </section>
            </main>
        </>
    );
}

function MetricCard({
    title,
    value,
    description,
    icon: Icon,
    error,
}: {
    title: string;
    value: string | null;
    description: string;
    icon: LucideIcon;
    error?: string;
}) {
    return (
        <Card className="gap-4 overflow-hidden py-5">
            <CardHeader className="flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                    <CardDescription>{title}</CardDescription>
                    {value ? (
                        <CardTitle className="text-2xl tabular-nums">
                            {value}
                        </CardTitle>
                    ) : error ? (
                        <p className="text-sm text-destructive">
                            Tidak tersedia
                        </p>
                    ) : (
                        <Skeleton className="h-8 w-32" />
                    )}
                </div>
                <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground">
                    {error ?? description}
                </p>
            </CardContent>
        </Card>
    );
}

function ChartCard({
    title,
    description,
    loading,
    error,
    empty,
    className,
    children,
}: {
    title: string;
    description: string;
    loading: boolean;
    error?: string;
    empty?: boolean;
    className?: string;
    children: ReactNode;
}) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-[360px] w-full" />
                ) : error ? (
                    <ChartState
                        icon={RefreshCw}
                        title="Grafik gagal dimuat"
                        description={error}
                    />
                ) : empty ? (
                    <ChartState
                        icon={Users}
                        title="Belum ada data"
                        description="Belum ada data untuk divisualisasikan."
                    />
                ) : (
                    children
                )}
            </CardContent>
        </Card>
    );
}

function ChartState({
    icon: Icon,
    title,
    description,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
}) {
    return (
        <div className="flex h-[360px] flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
            <div className="rounded-full bg-muted p-3">
                <Icon
                    className="size-5 text-muted-foreground"
                    aria-hidden="true"
                />
            </div>
            <p className="mt-4 font-medium">{title}</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {description}
            </p>
        </div>
    );
}

function InlineError({ message }: { message: string }) {
    return (
        <div
            role="status"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
            {message}
        </div>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
