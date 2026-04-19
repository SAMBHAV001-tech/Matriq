import { RiskLabel } from '../../api/types';

const CONFIG: Record<RiskLabel, { label: string; classes: string }> = {
    low: { label: 'Low Risk', classes: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
    medium: { label: 'Medium', classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    high: { label: 'High Risk', classes: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    critical: { label: 'Critical', classes: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

interface RiskBadgeProps {
    label: RiskLabel;
    score?: number;
    compact?: boolean;
}

export function RiskBadge({ label, score, compact = false }: RiskBadgeProps) {
    const cfg = CONFIG[label] ?? CONFIG.low;
    return (
        <span
            className={`inline-flex items-center gap-1.5 border rounded-full font-medium ${cfg.classes} ${compact ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
                }`}
        >
            {cfg.label}
            {score !== undefined && (
                <span className="opacity-70 font-mono">{score.toFixed(0)}</span>
            )}
        </span>
    );
}
