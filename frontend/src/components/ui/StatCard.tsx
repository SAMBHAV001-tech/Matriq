import { ReactNode } from 'react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: ReactNode;
    sub?: string;
    accent?: 'default' | 'emerald' | 'amber' | 'orange' | 'red' | 'sky' | 'teal';
    trend?: 'up' | 'down' | 'neutral';
}

const ACCENT_MAP = {
    default: { icon: 'text-slate-400', bg: 'bg-slate-700/30', border: 'border-slate-700/40', val: 'text-slate-100' },
    emerald: { icon: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', val: 'text-emerald-300' },
    amber: { icon: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', val: 'text-amber-300' },
    orange: { icon: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', val: 'text-orange-300' },
    red: { icon: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', val: 'text-red-300' },
    sky: { icon: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20', val: 'text-sky-300' },
    teal: { icon: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20', val: 'text-teal-300' },
};

export function StatCard({ label, value, icon, sub, accent = 'default' }: StatCardProps) {
    const a = ACCENT_MAP[accent];

    return (
        <div
            className={`relative flex flex-col justify-between p-5 rounded-xl border bg-slate-900/60 backdrop-blur-sm ${a.border} hover:bg-slate-900/80 transition-all duration-200 group overflow-hidden`}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 to-transparent pointer-events-none rounded-xl" />
            <div className="relative flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-3">
                        {label}
                    </div>
                    <div className={`text-2xl font-bold tracking-tight ${a.val}`}>{value}</div>
                    {sub && <div className="text-xs text-slate-600 mt-1">{sub}</div>}
                </div>
                <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${a.bg} border ${a.border}`}>
                    <span className={`w-4 h-4 ${a.icon}`}>{icon}</span>
                </div>
            </div>
        </div>
    );
}
