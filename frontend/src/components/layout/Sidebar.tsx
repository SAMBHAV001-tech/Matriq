import {
    LayoutDashboard,
    Table2,
    AlertTriangle,
    RefreshCw,
    ShieldAlert,
    Activity,
    ChevronRight,
} from 'lucide-react';
import { useNavigation, ViewId } from '../../context/NavigationContext';

const NAV_ITEMS: { id: ViewId; label: string; icon: React.ElementType; subtitle: string }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, subtitle: 'Executive summary' },
    { id: 'alv-report', label: 'ALV Report', icon: Table2, subtitle: 'Inventory data grid' },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, subtitle: 'Stock warnings' },
    { id: 'reorder-insights', label: 'Reorder Insights', icon: RefreshCw, subtitle: 'Procurement queue' },
    { id: 'material-risk', label: 'Material Risk', icon: ShieldAlert, subtitle: 'Risk analysis' },
];

export function Sidebar() {
    const { activeView, setActiveView } = useNavigation();

    return (
        <aside className="w-60 shrink-0 flex flex-col bg-[#0b1120] border-r border-slate-800/60 h-screen sticky top-0">
            <div className="px-5 py-5 border-b border-slate-800/60">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-sky-400" />
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-slate-100 tracking-wide">Matriq</div>
                        <div className="text-[10px] text-slate-500 leading-tight">Inventory Analytics</div>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                <div className="px-2 pb-2 pt-1">
                    <span className="text-[10px] font-medium text-slate-600 uppercase tracking-widest">
                        Navigation
                    </span>
                </div>
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const active = activeView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveView(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 group ${active
                                    ? 'bg-sky-500/10 border border-sky-500/20 text-sky-300'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                                }`}
                        >
                            <Icon
                                className={`w-4 h-4 shrink-0 transition-colors ${active ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'
                                    }`}
                            />
                            <div className="flex-1 min-w-0">
                                <div className={`text-sm font-medium leading-tight ${active ? 'text-sky-200' : ''}`}>
                                    {item.label}
                                </div>
                                <div className="text-[10px] text-slate-600 leading-tight mt-0.5 truncate">
                                    {item.subtitle}
                                </div>
                            </div>
                            {active && <ChevronRight className="w-3 h-3 text-sky-500 shrink-0" />}
                        </button>
                    );
                })}
            </nav>

            <div className="px-4 py-4 border-t border-slate-800/60">
                <div className="flex items-center gap-2 px-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                    <span className="text-[11px] text-slate-500">SAP ABAP ALV Integration</span>
                </div>
                <div className="text-[10px] text-slate-700 mt-1 px-1">v1.0 · Academic Build</div>
            </div>
        </aside>
    );
}
