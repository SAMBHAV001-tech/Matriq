import { useEffect, useState, useCallback } from 'react';
import { Wifi, WifiOff, Database, RefreshCw, Loader2 } from 'lucide-react';
import { healthApi, seedApi } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';
import { useNavigation, ViewId } from '../../context/NavigationContext';

const VIEW_META: Record<ViewId, { title: string; subtitle: string }> = {
    overview: { title: 'Overview', subtitle: 'Real-time inventory health summary' },
    'alv-report': { title: 'ALV Report', subtitle: 'Advanced List Viewer — ABAP report integration' },
    alerts: { title: 'Alerts', subtitle: 'Active stock warnings and critical events' },
    'reorder-insights': { title: 'Reorder Insights', subtitle: 'Procurement recommendations and queue' },
    'material-risk': { title: 'Material Risk Analysis', subtitle: 'Risk scoring and contributing factor breakdown' },
};

interface TopbarProps {
    onRefresh?: () => void;
}

export function Topbar({ onRefresh }: TopbarProps) {
    const { activeView } = useNavigation();
    const { addToast } = useToast();
    const [health, setHealth] = useState<'checking' | 'online' | 'offline'>('checking');
    const [seeding, setSeeding] = useState(false);
    const meta = VIEW_META[activeView];

    const checkHealth = useCallback(async () => {
        try {
            await healthApi.check();
            setHealth('online');
        } catch {
            setHealth('offline');
        }
    }, []);

    useEffect(() => {
        checkHealth();
        const interval = setInterval(checkHealth, 30000);
        return () => clearInterval(interval);
    }, [checkHealth]);

    const handleSeed = async () => {
        setSeeding(true);
        try {
            await seedApi.seed();
            addToast('Database seeded successfully. Dashboard refreshed.', 'success');
            onRefresh?.();
        } catch {
            addToast('Seed operation failed. Check backend connectivity.', 'error');
        } finally {
            setSeeding(false);
        }
    };

    return (
        <header className="h-14 shrink-0 flex items-center px-6 border-b border-slate-800/60 bg-[#0b1120]/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                    <h1 className="text-sm font-semibold text-slate-100 leading-tight">{meta.title}</h1>
                    <span className="hidden sm:block text-xs text-slate-600">·</span>
                    <span className="hidden sm:block text-xs text-slate-500 truncate">{meta.subtitle}</span>
                </div>
            </div>

            <div className="flex items-center gap-3 ml-4">
                <button
                    onClick={handleSeed}
                    disabled={seeding}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {seeding ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                        <Database className="w-3 h-3" />
                    )}
                    Seed Data
                </button>

                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"
                        title="Refresh data"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                )}

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
                    {health === 'checking' && (
                        <>
                            <Loader2 className="w-3 h-3 text-slate-500 animate-spin" />
                            <span className="text-[11px] text-slate-500">Checking</span>
                        </>
                    )}
                    {health === 'online' && (
                        <>
                            <Wifi className="w-3 h-3 text-emerald-400" />
                            <span className="text-[11px] text-emerald-400">Backend Online</span>
                        </>
                    )}
                    {health === 'offline' && (
                        <>
                            <WifiOff className="w-3 h-3 text-red-400" />
                            <span className="text-[11px] text-red-400">Offline</span>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
