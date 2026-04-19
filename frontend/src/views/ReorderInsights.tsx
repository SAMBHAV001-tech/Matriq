import { useEffect, useState, useCallback, useMemo } from 'react';
import {
    ShoppingCart,
    TrendingDown,
    Package,
    Building2,
    Truck,
    Search,
} from 'lucide-react';
import { analyticsApi } from '../api/endpoints';
import type { ReorderRecommendation } from '../api/types';
import { RiskBadge } from '../components/ui/RiskBadge';
import { CardSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { SectionHeader } from '../components/ui/SectionHeader';

interface ReorderInsightsProps {
    refreshKey: number;
}

function StockBar({ current, reorder }: { current: number; reorder: number }) {
    const max = Math.max(reorder * 1.5, current, 1);
    const pct = Math.min((current / max) * 100, 100);
    const reorderPct = Math.min((reorder / max) * 100, 100);

    let barColor = 'bg-emerald-500';
    if (current === 0) barColor = 'bg-red-500';
    else if (current <= reorder * 0.5) barColor = 'bg-orange-500';
    else if (current <= reorder) barColor = 'bg-amber-500';

    return (
        <div className="relative h-1.5 bg-slate-800 rounded-full overflow-visible">
            <div
                className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                style={{ width: `${pct}%` }}
            />
            <div
                className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-sky-400/60 rounded-full"
                style={{ left: `${reorderPct}%` }}
                title={`Reorder level: ${reorder}`}
            />
        </div>
    );
}

function ReorderCard({ rec }: { rec: ReorderRecommendation }) {
    const daysStock = rec.monthly_consumption > 0
        ? Math.floor((rec.current_stock / rec.monthly_consumption) * 30)
        : null;

    return (
        <div className="p-4 rounded-xl border border-slate-800/60 bg-slate-900/60 hover:bg-slate-900/80 hover:border-slate-700/60 transition-all duration-200">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-sky-400" />
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-100 truncate">{rec.material_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{rec.material_code}</div>
                    </div>
                </div>
                {rec.risk_label && (
                    <RiskBadge label={rec.risk_label} score={rec.risk_score} compact />
                )}
            </div>

            <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-slate-500">Stock level</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                        {rec.current_stock} / {rec.reorder_level}
                    </span>
                </div>
                <StockBar current={rec.current_stock} reorder={rec.reorder_level} />
                <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-slate-600">Current</span>
                    <span className="text-[10px] text-sky-600">▲ Reorder trigger</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="p-2 rounded-lg bg-slate-800/50 text-center">
                    <div className="text-xs font-bold text-teal-400 font-mono">{rec.recommended_reorder_qty}</div>
                    <div className="text-[10px] text-slate-600 mt-0.5">Rec. Qty</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/50 text-center">
                    <div className="text-xs font-bold text-slate-300 font-mono">{rec.monthly_consumption}</div>
                    <div className="text-[10px] text-slate-600 mt-0.5">Mo. Usage</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/50 text-center">
                    <div className={`text-xs font-bold font-mono ${daysStock !== null && daysStock <= 7 ? 'text-red-400' : daysStock !== null && daysStock <= 14 ? 'text-amber-400' : 'text-slate-300'}`}>
                        {daysStock !== null ? `${daysStock}d` : '—'}
                    </div>
                    <div className="text-[10px] text-slate-600 mt-0.5">Days Left</div>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {rec.plant_name && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <Building2 className="w-2.5 h-2.5" />
                        {rec.plant_name}
                    </div>
                )}
                {rec.vendor_name && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <Truck className="w-2.5 h-2.5" />
                        {rec.vendor_name}
                    </div>
                )}
            </div>

            {rec.reason && (
                <div className="mt-3 pt-3 border-t border-slate-800/60 text-[11px] text-slate-500 leading-relaxed">
                    {rec.reason}
                </div>
            )}
        </div>
    );
}

export function ReorderInsights({ refreshKey }: ReorderInsightsProps) {
    const [recs, setRecs] = useState<ReorderRecommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [riskFilter, setRiskFilter] = useState<string>('all');

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await analyticsApi.getReorderRecommendations();
            setRecs(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load reorder recommendations');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load, refreshKey]);

    const filtered = useMemo(() => {
        let rows = [...recs];
        if (search) {
            const q = search.toLowerCase();
            rows = rows.filter(
                (r) =>
                    r.material_name?.toLowerCase().includes(q) ||
                    r.material_code?.toLowerCase().includes(q)
            );
        }
        if (riskFilter !== 'all') {
            rows = rows.filter((r) => r.risk_label === riskFilter);
        }
        rows.sort((a, b) => (b.risk_score ?? 0) - (a.risk_score ?? 0));
        return rows;
    }, [recs, search, riskFilter]);

    const stats = {
        total: recs.length,
        critical: recs.filter((r) => r.risk_label === 'critical').length,
        high: recs.filter((r) => r.risk_label === 'high').length,
        outOfStock: recs.filter((r) => r.current_stock === 0).length,
    };

    if (error) return <ErrorState message={error} onRetry={load} />;

    return (
        <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-800/60 bg-slate-900/60">
                    <div className="flex items-center gap-2 mb-1">
                        <ShoppingCart className="w-3.5 h-3.5 text-sky-400" />
                        <span className="text-[10px] text-slate-500 uppercase tracking-wide">Total Queue</span>
                    </div>
                    <div className="text-xl font-bold text-sky-300">{loading ? '–' : stats.total}</div>
                </div>
                <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/5">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                        <span className="text-[10px] text-slate-500 uppercase tracking-wide">Critical Risk</span>
                    </div>
                    <div className="text-xl font-bold text-red-300">{loading ? '–' : stats.critical}</div>
                </div>
                <div className="p-3.5 rounded-xl border border-orange-500/20 bg-orange-500/5">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingDown className="w-3.5 h-3.5 text-orange-400" />
                        <span className="text-[10px] text-slate-500 uppercase tracking-wide">High Risk</span>
                    </div>
                    <div className="text-xl font-bold text-orange-300">{loading ? '–' : stats.high}</div>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-800/60 bg-slate-900/60">
                    <div className="flex items-center gap-2 mb-1">
                        <Package className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[10px] text-slate-500 uppercase tracking-wide">Zero Stock</span>
                    </div>
                    <div className="text-xl font-bold text-slate-300">{loading ? '–' : stats.outOfStock}</div>
                </div>
            </div>

            <div className="flex flex-wrap gap-3 items-center p-3.5 rounded-xl border border-slate-800/60 bg-slate-900/60">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search materials…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700/60 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
                    />
                </div>
                <select
                    value={riskFilter}
                    onChange={(e) => setRiskFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-slate-800 border border-slate-700/60 rounded-lg text-slate-300 focus:outline-none"
                >
                    <option value="all">All Risk Levels</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
                <span className="text-xs text-slate-500 ml-auto">{filtered.length} items</span>
            </div>

            <SectionHeader
                title="Procurement Recommendations"
                subtitle="Sorted by risk priority · Reorder trigger line shown on stock bars"
            />

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
                </div>
            ) : filtered.length === 0 ? (
                <EmptyState
                    title="No recommendations"
                    description="All materials meet their reorder thresholds."
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((rec, i) => (
                        <ReorderCard key={rec.material_id ?? i} rec={rec} />
                    ))}
                </div>
            )}
        </div>
    );
}
