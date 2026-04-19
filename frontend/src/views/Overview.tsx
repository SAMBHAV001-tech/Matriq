import { useEffect, useState, useCallback } from 'react';
import {
    Package,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    TrendingDown,
    DollarSign,
    ArrowRight,
} from 'lucide-react';
import { reportsApi, analyticsApi } from '../api/endpoints';
import type { ALVSummary, Alert, ReorderRecommendation } from '../api/types';
import { StatCard } from '../components/ui/StatCard';
import { StatCardSkeleton } from '../components/ui/LoadingSkeleton';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { RiskBadge } from '../components/ui/RiskBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { DonutChartWithCenter } from '../components/charts/DonutChart';
import { HorizontalBarChart } from '../components/charts/BarChart';
import { useNavigation } from '../context/NavigationContext';

interface OverviewProps {
    refreshKey: number;
}

function formatCurrency(v: number) {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
    return `$${v.toFixed(2)}`;
}

export function Overview({ refreshKey }: OverviewProps) {
    const { setActiveView } = useNavigation();
    const [summary, setSummary] = useState<ALVSummary | null>(null);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [reorders, setReorders] = useState<ReorderRecommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [s, a, r] = await Promise.all([
                reportsApi.getSummary(),
                reportsApi.getAlerts(),
                analyticsApi.getReorderRecommendations(),
            ]);
            setSummary(s);
            setAlerts(Array.isArray(a) ? a.slice(0, 5) : []);
            setReorders(Array.isArray(r) ? r.slice(0, 5) : []);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load overview data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load, refreshKey]);

    const SEVERITY_COLORS: Record<string, string> = {
        critical: 'border-l-red-500',
        high: 'border-l-orange-500',
        medium: 'border-l-amber-500',
        low: 'border-l-sky-500',
    };

    const materialGroupItems = summary?.material_groups
        ? Object.entries(summary.material_groups)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 6)
            .map(([label, value]) => ({ label, value, color: '#0ea5e9' }))
        : [];

    if (error) return <ErrorState message={error} onRetry={load} />;

    return (
        <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
                ) : summary ? (
                    <>
                        <StatCard
                            label="Total Materials"
                            value={summary.total_materials}
                            icon={<Package />}
                            sub="Active SKUs"
                            accent="sky"
                        />
                        <StatCard
                            label="Healthy Stock"
                            value={summary.healthy_count}
                            icon={<CheckCircle2 />}
                            sub="Within reorder level"
                            accent="emerald"
                        />
                        <StatCard
                            label="Low Stock"
                            value={summary.low_count}
                            icon={<TrendingDown />}
                            sub="Approaching reorder"
                            accent="amber"
                        />
                        <StatCard
                            label="Critical"
                            value={summary.critical_count}
                            icon={<AlertTriangle />}
                            sub="Immediate action required"
                            accent="orange"
                        />
                        <StatCard
                            label="Out of Stock"
                            value={summary.out_of_stock_count}
                            icon={<XCircle />}
                            sub="Zero inventory"
                            accent="red"
                        />
                        <StatCard
                            label="Portfolio Value"
                            value={formatCurrency(summary.total_inventory_value)}
                            icon={<DollarSign />}
                            sub="Total inventory value"
                            accent="teal"
                        />
                    </>
                ) : null}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-1 bg-slate-900/60 backdrop-blur-sm rounded-xl border border-slate-800/60 p-5">
                    <SectionHeader
                        title="Stock Distribution"
                        subtitle="Current inventory health breakdown"
                    />
                    {loading ? (
                        <div className="h-32 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full border-2 border-sky-500/30 border-t-sky-500 animate-spin" />
                        </div>
                    ) : summary ? (
                        <DonutChartWithCenter
                            segments={[
                                { label: 'Healthy', value: summary.healthy_count, color: '#10b981' },
                                { label: 'Low', value: summary.low_count, color: '#f59e0b' },
                                { label: 'Critical', value: summary.critical_count, color: '#f97316' },
                                { label: 'Out of Stock', value: summary.out_of_stock_count, color: '#ef4444' },
                            ]}
                            size={130}
                            thickness={20}
                            centerValue={summary.total_materials.toString()}
                            centerLabel="Total"
                        />
                    ) : null}
                </div>

                <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-sm rounded-xl border border-slate-800/60 p-5">
                    <SectionHeader
                        title="Material Groups"
                        subtitle="Distribution by category"
                    />
                    {loading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="flex justify-between mb-1">
                                        <div className="h-3 bg-slate-800 rounded w-28" />
                                        <div className="h-3 bg-slate-800 rounded w-12" />
                                    </div>
                                    <div className="h-1.5 bg-slate-800 rounded-full" />
                                </div>
                            ))}
                        </div>
                    ) : materialGroupItems.length > 0 ? (
                        <HorizontalBarChart items={materialGroupItems} />
                    ) : (
                        <EmptyState
                            title="No group data"
                            description="Material group breakdown is not available."
                        />
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl border border-slate-800/60 p-5">
                    <SectionHeader
                        title="Active Alerts"
                        subtitle="Recent stock warnings"
                        actions={
                            <button
                                onClick={() => setActiveView('alerts')}
                                className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 transition-colors"
                            >
                                View all <ArrowRight className="w-3 h-3" />
                            </button>
                        }
                    />
                    {loading ? (
                        <div className="space-y-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-14 animate-pulse bg-slate-800/50 rounded-lg" />
                            ))}
                        </div>
                    ) : alerts.length === 0 ? (
                        <EmptyState
                            title="No active alerts"
                            description="All inventory levels are within normal parameters."
                        />
                    ) : (
                        <div className="space-y-2">
                            {alerts.map((alert, i) => (
                                <div
                                    key={i}
                                    className={`flex items-start gap-3 p-3 rounded-lg bg-slate-800/40 border-l-2 border border-slate-700/40 ${SEVERITY_COLORS[alert.severity] ?? 'border-l-slate-600'
                                        }`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-xs font-semibold text-slate-200 truncate">
                                                {alert.material_name}
                                            </span>
                                            <span className="font-mono text-[10px] text-slate-500 shrink-0">
                                                {alert.material_code}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 leading-snug">{alert.message}</p>
                                    </div>
                                    {alert.stock_status && (
                                        <StatusBadge status={alert.stock_status} compact />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl border border-slate-800/60 p-5">
                    <SectionHeader
                        title="Reorder Queue"
                        subtitle="Top procurement recommendations"
                        actions={
                            <button
                                onClick={() => setActiveView('reorder-insights')}
                                className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 transition-colors"
                            >
                                View all <ArrowRight className="w-3 h-3" />
                            </button>
                        }
                    />
                    {loading ? (
                        <div className="space-y-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-14 animate-pulse bg-slate-800/50 rounded-lg" />
                            ))}
                        </div>
                    ) : reorders.length === 0 ? (
                        <EmptyState
                            title="No reorder recommendations"
                            description="All materials meet minimum stock requirements."
                        />
                    ) : (
                        <div className="space-y-2">
                            {reorders.map((r, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/40 hover:bg-slate-800/60 transition-colors"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                                        <span className="text-[10px] font-bold text-sky-400">{i + 1}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-slate-200 truncate">
                                                {r.material_name}
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-slate-500 mt-0.5">
                                            Stock: {r.current_stock} · Reorder: {r.recommended_reorder_qty} units
                                        </div>
                                    </div>
                                    {r.risk_label && <RiskBadge label={r.risk_label} compact />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
