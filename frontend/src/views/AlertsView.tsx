import { useEffect, useState, useCallback } from 'react';
import {
    AlertTriangle,
    XCircle,
    TrendingDown,
    Info,
    Building2,
    Truck,
} from 'lucide-react';
import { reportsApi } from '../api/endpoints';
import type { Alert } from '../api/types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { CardSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { SectionHeader } from '../components/ui/SectionHeader';

interface AlertsViewProps {
    refreshKey: number;
}

const SEVERITY_CONFIG = {
    critical: {
        icon: XCircle,
        label: 'Critical',
        classes: 'border-red-500/30 bg-red-500/5',
        iconColor: 'text-red-400',
        badgeClasses: 'bg-red-500/10 text-red-400 border-red-500/20',
        bar: 'bg-red-500',
    },
    high: {
        icon: AlertTriangle,
        label: 'High',
        classes: 'border-orange-500/30 bg-orange-500/5',
        iconColor: 'text-orange-400',
        badgeClasses: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        bar: 'bg-orange-500',
    },
    medium: {
        icon: TrendingDown,
        label: 'Medium',
        classes: 'border-amber-500/30 bg-amber-500/5',
        iconColor: 'text-amber-400',
        badgeClasses: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        bar: 'bg-amber-500',
    },
    low: {
        icon: Info,
        label: 'Low',
        classes: 'border-sky-500/30 bg-sky-500/5',
        iconColor: 'text-sky-400',
        badgeClasses: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
        bar: 'bg-sky-500',
    },
};

type SeverityFilter = 'all' | 'critical' | 'high' | 'medium' | 'low';

function AlertCard({ alert }: { alert: Alert }) {
    const cfg = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.low;
    const Icon = cfg.icon;

    return (
        <div
            className={`relative flex gap-4 p-4 rounded-xl border ${cfg.classes} hover:brightness-110 transition-all duration-200`}
        >
            <div className={`absolute left-0 top-4 bottom-4 w-0.5 rounded-full ${cfg.bar} opacity-60`} style={{ left: '-1px' }} />
            <div className="shrink-0 mt-0.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-slate-900/60 border border-slate-800/60`}>
                    <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-100">{alert.material_name}</span>
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                            {alert.material_code}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wide ${cfg.badgeClasses}`}>
                            {cfg.label}
                        </span>
                        {alert.stock_status && (
                            <StatusBadge status={alert.stock_status} compact />
                        )}
                    </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-2">{alert.message}</p>
                <div className="flex flex-wrap gap-3">
                    {alert.plant_name && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Building2 className="w-3 h-3" />
                            <span>{alert.plant_code} – {alert.plant_name}</span>
                        </div>
                    )}
                    {alert.vendor_name && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Truck className="w-3 h-3" />
                            <span>{alert.vendor_code} – {alert.vendor_name}</span>
                        </div>
                    )}
                    {alert.current_stock !== undefined && (
                        <div className="text-[11px] text-slate-500">
                            Stock: <span className="text-slate-300 font-mono">{alert.current_stock}</span>
                            {alert.reorder_level !== undefined && (
                                <span> / Reorder: <span className="text-slate-300 font-mono">{alert.reorder_level}</span></span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export function AlertsView({ refreshKey }: AlertsViewProps) {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await reportsApi.getAlerts();
            setAlerts(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load alerts');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load, refreshKey]);

    const filtered = severityFilter === 'all'
        ? alerts
        : alerts.filter((a) => a.severity === severityFilter);

    const counts = {
        critical: alerts.filter((a) => a.severity === 'critical').length,
        high: alerts.filter((a) => a.severity === 'high').length,
        medium: alerts.filter((a) => a.severity === 'medium').length,
        low: alerts.filter((a) => a.severity === 'low').length,
    };

    if (error) return <ErrorState message={error} onRetry={load} />;

    return (
        <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(['critical', 'high', 'medium', 'low'] as const).map((sev) => {
                    const cfg = SEVERITY_CONFIG[sev];
                    const Icon = cfg.icon;
                    return (
                        <button
                            key={sev}
                            onClick={() => setSeverityFilter(severityFilter === sev ? 'all' : sev)}
                            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${severityFilter === sev
                                    ? `${cfg.classes} ring-1 ring-offset-0`
                                    : 'bg-slate-900/60 border-slate-800/60 hover:bg-slate-800/40'
                                }`}
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg.badgeClasses} border`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-lg font-bold text-slate-100">{loading ? '–' : counts[sev]}</div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-wide">{cfg.label}</div>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div>
                <SectionHeader
                    title={`${severityFilter === 'all' ? 'All Alerts' : `${SEVERITY_CONFIG[severityFilter]?.label} Alerts`}`}
                    subtitle={`${filtered.length} active notification${filtered.length !== 1 ? 's' : ''}`}
                    actions={
                        severityFilter !== 'all' && (
                            <button
                                onClick={() => setSeverityFilter('all')}
                                className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
                            >
                                Show all
                            </button>
                        )
                    }
                />
                {loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <EmptyState
                        title="No alerts"
                        description="No active alerts for the selected severity level."
                    />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {filtered.map((alert, i) => (
                            <AlertCard key={alert.id ?? i} alert={alert} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
