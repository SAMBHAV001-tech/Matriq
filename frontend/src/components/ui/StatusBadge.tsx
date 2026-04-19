import { StockStatus } from '../../api/types';

const CONFIG: Record<StockStatus, { label: string; classes: string; dot: string }> = {
    healthy: {
        label: 'Healthy',
        classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        dot: 'bg-emerald-400',
    },
    low: {
        label: 'Low Stock',
        classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        dot: 'bg-amber-400',
    },
    critical: {
        label: 'Critical',
        classes: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        dot: 'bg-orange-400',
    },
    out_of_stock: {
        label: 'Out of Stock',
        classes: 'bg-red-500/10 text-red-400 border-red-500/20',
        dot: 'bg-red-400',
    },
};

interface StatusBadgeProps {
    status: StockStatus;
    compact?: boolean;
}

export function StatusBadge({ status, compact = false }: StatusBadgeProps) {
    const cfg = CONFIG[status] ?? CONFIG.healthy;
    return (
        <span
            className={`inline-flex items-center gap-1.5 border rounded-full font-medium ${cfg.classes} ${compact ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
                }`}
        >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}
