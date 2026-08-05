import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    BarChart3,
    Check,
    Database,
    ShieldCheck,
    Sparkles,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { dashboard, login } from '@/routes';

const features: { icon: LucideIcon; title: string; description: string }[] = [
    {
        icon: BarChart3,
        title: 'Analitik yang bermakna',
        description: 'Ubah data operasional menjadi insight yang siap ditindaklanjuti.',
    },
    {
        icon: Database,
        title: 'Data dalam kendali',
        description: 'Kelola record dan data terbaru tanpa berpindah aplikasi.',
    },
    {
        icon: ShieldCheck,
        title: 'Akses yang terlindungi',
        description: 'Autentikasi JWT menjaga setiap sesi dan aktivitas tetap aman.',
    },
];

export default function Welcome() {
    const { auth } = usePage().props;
    const destination = auth.user ? dashboard() : login();
    const actionLabel = auth.user ? 'Buka Dashboard' : 'Mulai sekarang';

    return (
        <>
            <Head title="Telkomsel Analytics" />
            <div className="min-h-svh overflow-hidden bg-[#f7f9fc] text-[#001a41]">
                <div className="relative isolate overflow-hidden bg-[#001a41]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_16%,rgba(255,0,37,.92),transparent_29%),radial-gradient(circle_at_91%_76%,rgba(253,162,43,.75),transparent_18%)]" />
                    <div className="absolute inset-0 opacity-[.14] [background-image:linear-gradient(rgba(255,255,255,.38)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.38)_1px,transparent_1px)] [background-size:44px_44px]" />
                    <div className="absolute -top-40 -right-28 size-[34rem] rounded-full border-[52px] border-white/10" />

                    <header className="relative z-10 mx-auto flex h-[84px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
                        <Link href="/" className="flex items-center gap-3" aria-label="Telkomsel Analytics">
                            <span className="flex h-10 w-14 items-center justify-center rounded-xl bg-white p-1.5 shadow-lg shadow-black/10">
                                <img src="/telkomsel-logo.png" alt="Telkomsel" className="h-full w-full object-contain" />
                            </span>
                            <span className="text-sm font-semibold tracking-tight text-white sm:text-base">Telkomsel <span className="font-normal text-white/55">Analytics</span></span>
                        </Link>
                        <Link href={destination} className="rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white hover:text-[#001a41]">
                            {auth.user ? 'Dashboard' : 'Masuk'}
                        </Link>
                    </header>

                    <section className="relative z-10 mx-auto grid max-w-7xl gap-12 px-5 pt-10 pb-24 sm:px-8 lg:grid-cols-[.94fr_1.06fr] lg:items-center lg:px-10 lg:pt-16 lg:pb-32">
                        <div className="max-w-2xl">
                            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold tracking-[.16em] text-white/85 uppercase backdrop-blur-sm">
                                <Sparkles className="size-3.5 text-[#fda22b]" /> Intelligence platform
                            </p>
                            <h1 className="text-4xl leading-[1.03] font-bold tracking-[-.045em] text-white sm:text-5xl lg:text-[4.25rem]">
                                Lihat lebih jauh.<br /><span className="text-[#fda22b]">Bergerak lebih cepat.</span>
                            </h1>
                            <p className="mt-7 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
                                Satu ruang kerja untuk memahami revenue, aktivitas pengguna, dan kondisi layanan Anda secara real-time.
                            </p>
                            <div className="mt-9 flex flex-wrap gap-3">
                                <Link href={destination} className="inline-flex items-center gap-2 rounded-full bg-[#ff0025] px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-[#b70024]">
                                    {actionLabel}<ArrowRight className="size-4" />
                                </Link>
                                <a href="#platform" className="inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold text-white/85 transition hover:text-white">
                                    Jelajahi platform <span aria-hidden="true">↓</span>
                                </a>
                            </div>
                            <div className="mt-12 flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/65">
                                <span className="inline-flex items-center gap-2"><span className="flex size-5 items-center justify-center rounded-full bg-white/10"><Check className="size-3 text-[#fda22b]" /></span> Terhubung ke Go API</span>
                                <span className="inline-flex items-center gap-2"><span className="flex size-5 items-center justify-center rounded-full bg-white/10"><Check className="size-3 text-[#fda22b]" /></span> Aman dengan JWT</span>
                            </div>
                        </div>

                        <DashboardPreview />
                    </section>
                </div>

                <section id="platform" className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
                    <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-start">
                        <div>
                            <p className="text-xs font-bold tracking-[.16em] text-[#ff0025] uppercase">Designed for clarity</p>
                            <h2 className="mt-4 text-3xl leading-tight font-bold tracking-[-.035em] sm:text-4xl">Yang penting, langsung terlihat.</h2>
                            <p className="mt-5 max-w-sm leading-7 text-slate-600">Didesain agar tim dapat menemukan sinyal penting, memahami konteks, lalu mengambil tindakan dengan percaya diri.</p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                            {features.map(({ icon: Icon, title, description }, index) => (
                                <article key={title} className="group rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(0,26,65,.055)] transition duration-300 hover:-translate-y-1 hover:border-[#ff0025]/25 hover:shadow-[0_18px_45px_rgba(0,26,65,.11)]">
                                    <span className={`inline-flex rounded-2xl p-3 ${index === 1 ? 'bg-[#fff7e8] text-[#b66d00]' : 'bg-[#fff1f2] text-[#ff0025]'}`}><Icon className="size-5" /></span>
                                    <h3 className="mt-6 text-base font-bold tracking-tight">{title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
                                    <span className="mt-6 inline-flex text-sm font-semibold text-[#ff0025] opacity-0 transition group-hover:opacity-100">Selengkapnya <ArrowRight className="ml-1 size-4" /></span>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mx-5 mb-16 overflow-hidden rounded-[32px_32px_96px_32px] bg-[#ff0025] sm:mx-8 lg:mx-auto lg:max-w-7xl">
                    <div className="relative px-7 py-12 text-white sm:px-12 sm:py-14">
                        <div className="absolute -right-10 -bottom-20 size-72 rounded-full border-[38px] border-[#fda22b]/60" />
                        <div className="relative flex max-w-3xl flex-col justify-between gap-7 md:flex-row md:items-end">
                            <div><p className="text-sm font-semibold text-white/75">Siap melihat data dengan perspektif baru?</p><h2 className="mt-2 text-3xl font-bold tracking-[-.04em] sm:text-4xl">Masuk dan mulai pantau performa Anda.</h2></div>
                            <Link href={destination} className="shrink-0 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#b70024] transition hover:-translate-y-0.5 hover:bg-[#fda22b] hover:text-[#001a41]">{actionLabel}</Link>
                        </div>
                    </div>
                </section>

                <footer className="border-t border-slate-200 px-5 py-7 text-sm text-slate-500 sm:px-8 lg:px-10"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 sm:flex-row"><span>{'©'} {new Date().getFullYear()} Telkomsel Analytics</span><span>Data, insight, action.</span></div></footer>
            </div>
        </>
    );
}

function DashboardPreview() {
    const bars = [30, 52, 43, 68, 55, 75, 64, 92, 78, 100];

    return (
        <div className="relative mx-auto w-full max-w-2xl lg:translate-x-6">
            <div className="absolute -inset-4 rounded-[40px] bg-white/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[26px] border border-white/30 bg-white/95 p-3 shadow-2xl shadow-black/25 backdrop-blur sm:p-4">
                <div className="flex items-center gap-1.5 border-b border-slate-200 pb-3"><span className="size-2.5 rounded-full bg-[#ff5d6f]" /><span className="size-2.5 rounded-full bg-[#fda22b]" /><span className="size-2.5 rounded-full bg-[#26c281]" /><span className="ml-3 h-5 w-36 rounded-md bg-slate-100" /></div>
                <div className="mt-4 grid grid-cols-[54px_1fr] gap-3">
                    <aside className="hidden rounded-xl bg-[#001a41] p-2 sm:block"><div className="mx-auto size-5 rounded-md bg-[#ff0025]" />{[1, 2, 3, 4].map((item) => <span key={item} className={`mx-auto mt-5 block size-5 rounded-md ${item === 1 ? 'bg-white/25' : 'bg-white/10'}`} />)}</aside>
                    <div className="min-w-0"><div className="flex items-center justify-between"><div><p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Overview</p><p className="text-base font-bold">Good morning, Team</p></div><span className="rounded-lg bg-[#ecfdf3] px-2 py-1 text-[10px] font-bold text-green-700">LIVE</span></div>
                        <div className="mt-4 grid grid-cols-3 gap-2"><PreviewMetric icon={Database} label="Records" value="1.284" /><PreviewMetric icon={TrendingUp} label="Revenue" value="48,2 jt" /><PreviewMetric icon={Activity} label="Health" value="99.9%" /></div>
                        <div className="mt-3 rounded-xl bg-[#f7f9fc] p-3"><div className="flex items-center justify-between"><div><p className="text-xs font-bold">Revenue performance</p><p className="text-[10px] text-slate-400">Last 10 days</p></div><Zap className="size-4 text-[#fda22b]" /></div><div className="mt-3 flex h-24 items-end gap-1.5">{bars.map((height, index) => <span key={index} className="flex-1 rounded-t-sm bg-[#ff0025]" style={{ height: `${height}%`, opacity: index === bars.length - 1 ? 1 : 0.28 + index * 0.055 }} />)}</div></div>
                        <div className="mt-3 grid grid-cols-[1.1fr_.9fr] gap-3"><div className="rounded-xl border border-slate-100 p-3"><p className="text-[10px] font-semibold text-slate-400 uppercase">Recent activity</p>{[1, 2, 3].map((item) => <div key={item} className="mt-2 flex items-center gap-2"><span className="size-5 rounded-full bg-[#fff1f2]" /><span className="h-2 flex-1 rounded bg-slate-100" /><span className="h-2 w-7 rounded bg-slate-100" /></div>)}</div><div className="rounded-xl bg-[#001a41] p-3 text-white"><p className="text-[10px] text-white/60">Active users</p><p className="mt-1 text-xl font-bold">2.481</p><div className="mt-3 flex -space-x-1.5">{[1, 2, 3, 4].map((item) => <span key={item} className="size-5 rounded-full border-2 border-[#001a41] bg-[#fda22b]" />)}</div></div></div>
                    </div>
                </div>
            </div>
            <div className="absolute -right-4 -bottom-5 flex items-center gap-3 rounded-2xl border border-white/30 bg-white/90 p-3 pr-5 shadow-xl backdrop-blur"><span className="rounded-xl bg-[#ecfdf3] p-2 text-green-700"><Users className="size-4" /></span><div><p className="text-xs font-bold text-[#001a41]">Backend tersambung</p><p className="text-[10px] text-slate-500">Semua sistem normal</p></div></div>
        </div>
    );
}

function PreviewMetric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
    return <div className="rounded-xl border border-slate-100 bg-white p-2.5"><Icon className="size-3.5 text-[#ff0025]" /><p className="mt-2 text-[10px] text-slate-400">{label}</p><p className="text-xs font-bold tabular-nums">{value}</p></div>;
}
