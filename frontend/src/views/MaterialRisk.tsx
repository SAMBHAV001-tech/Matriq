import { useEffect, useState, useCallback } from 'react';
import {
    ShieldAlert,
    ChevronRight,
    AlertCircle,
    TrendingUp,
    TrendingDown,
    Minus,
    Search,
    Loader2,
} from 'lucide-react';
import { analyticsApi, materialsApi } from '../api/endpoints';
import type { MaterialRisk as MaterialRiskType, Material, ContributingFactor } from '../api/types';
import { RiskBadge } from '../components/ui/RiskBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Skeleton } from '../components/ui/LoadingSkeleton';

interface MaterialRiskProps {
    refreshKey: number;
}

const RISK_SCORE_CONFIG = {
    low: { color: '#22d3ee', bg: 'from-sky-500/20 to-sky-600/5', label: 'Low Risk', border: 'border-sky-500/30' },
    medium: { color: '#fbbf24', bg: 'from-amber-500/20 to-amber-600/5', label: 'Moderate Risk', border: 'border-amber-500/30' },
    high: { color: '#fb923c', bg: 'from-orange-500/20 to-orange-600/5', label: 'High Risk', border: 'border-orange-500/30' },
    critical: { color: '#f87171', bg: 'from-red-500/20 to-red-600/5', label: 'Critical Risk', border: 'border-red-500/30' },
};

function RiskGauge({ score, max = 100 }: { score: number; max?: number }) {
    const pct = Math.min((score / max) * 100, 100);
    const angle = (pct / 100) * 180 - 90;
    const r = 54;
    const cx = 70;
    const cy = 70;

    const x = cx + r * Math.cos((angle * Math.PI) / 180);
    const y = cy + r * Math.sin((angle * Math.PI) / 180);

    const trackD = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

    let strokeColor = '#22d3ee';
    if (score >= 75) strokeColor = '#f87171';
    else if (score >= 50) strokeColor = '#fb923c';
    else if (score >= 25) strokeColor = '#fbbf24';

    const arcLength = Math.PI * r;
    const filled = (pct / 100) * arcLength;

    return (
        <svg width={140} height={80} viewBox="0 0 140 80">
            <path
                d={trackD}
                fill="none"
                stroke="#1e293b"
                strokeWidth={12}
                strokeLinecap="round"
            />
            <path
                d={trackD}
                fill="none"
                stroke={strokeColor}
                strokeWidth={12}
                strokeLinecap="round"
                strokeDasharray={`${filled} ${arcLength}`}
                style={{ transition: 'stroke-dasharray 0.8s ease, stroke 0.5s ease' }}
            />
            <line
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke={strokeColor}
                strokeWidth={2}
                strokeLinecap="round"
                opacity={0.8}
                style={{ transition: 'x2 0.8s ease, y2 0.8s ease' }}
            />
            <circle cx={cx} cy={cy} r={3} fill={strokeColor} />
            <text x={cx} y={cy - 8} textAnchor="middle" fill="white" fontSize={18} fontWeight="bold">
                {score.toFixed(0)}
            </text>
            <text x={cx} y={cy + 4} textAnchor="middle" fill="#64748b" fontSize={9}>
                / {max}
            </text>
        </svg>
    );
}

function FactorRow({ factor }: { factor: ContributingFactor }) {
    const ImpactIcon =
        factor.impact === 'positive'
            ? TrendingDown
            : factor.impact === 'negative'
                ? TrendingUp
                : Minus;

    const impactColor =
        factor.impact === 'positive'
            ? 'text-emerald-400'
            : factor.impact === 'negative'
                ? 'text-red-400'
                : 'text-slate-500';

    return (
        <div className="flex items-center gap-3 py-2.5 border-b border-slate-800/40 last:border-0">
            <ImpactIcon className={`w-3.5 h-3.5 shrink-0 ${impactColor}`} />
            <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-300 font-medium">{factor.factor}</div>
                {factor.value !== undefined && (
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">{String(factor.value)}</div>
                )}
            </div>
            {factor.weight !== undefined && (
                <div className="shrink-0">
                    <div className="flex items-center gap-1.5">
                        <div className="h-1 rounded-full bg-slate-800 w-16 overflow-hidden">
                            <div
                                className={`h-full rounded-full ${factor.impact === 'positive' ? 'bg-emerald-500' :
                                        factor.impact === 'negative' ? 'bg-red-500' : 'bg-slate-500'
                                    }`}
                                style={{ width: `${Math.min(factor.weight * 100, 100)}%` }}
                            />
                        </div>
                        <span className="text-[10px] text-slate-500 w-8 text-right">
                            {(factor.weight * 100).toFixed(0)}%
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

export function MaterialRisk({ refreshKey }: MaterialRiskProps) {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [riskData, setRiskData] = useState<MaterialRiskType | null>(null);
    const [loadingMaterials, setLoadingMaterials] = useState(true);
    const [loadingRisk, setLoadingRisk] = useState(false);
    const [materialsError, setMaterialsError] = useState<string | null>(null);
    const [riskError, setRiskError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const loadMaterials = useCallback(async () => {
        setLoadingMaterials(true);
        setMaterialsError(null);
        try {
            const data = await materialsApi.getAll();
            setMaterials(Array.isArray(data) ? data : []);
        } catch (e) {
            setMaterialsError(e instanceof Error ? e.message : 'Failed to load materials');
        } finally {
            setLoadingMaterials(false);
        }
    }, []);

    const loadRisk = useCallback(async (id: string) => {
        setLoadingRisk(true);
        setRiskError(null);
        setRiskData(null);
        try {
            const data = await analyticsApi.getMaterialRisk(id);
            setRiskData(data);
        } catch (e) {
            setRiskError(e instanceof Error ? e.message : 'Failed to load risk analysis');
        } finally {
            setLoadingRisk(false);
        }
    }, []);

    useEffect(() => { loadMaterials(); }, [loadMaterials, refreshKey]);

    const handleSelect = (id: string) => {
        setSelectedId(id);
        loadRisk(id);
    };

    const filteredMaterials = search
        ? materials.filter(
            (m) =>
                m.name?.toLowerCase().includes(search.toLowerCase()) ||
                m.code?.toLowerCase().includes(search.toLowerCase()) ||
                m.group?.toLowerCase().includes(search.toLowerCase())
        )
        : materials;

    const selectedMaterial = materials.find((m) => m.id === selectedId);
    const riskCfg = riskData ? RISK_SCORE_CONFIG[riskData.risk_label] ?? RISK_SCORE_CONFIG.low : null;

    return (
        <div className="p-6 flex gap-5 h-[calc(100vh-3.5rem)] overflow-hidden">
            <div className="w-64 shrink-0 flex flex-col bg-slate-900/60 backdrop-blur-sm rounded-xl border border-slate-800/60 overflow-hidden">
                <div className="p-3 border-b border-slate-800/60">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search materials…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-7 pr-2 py-1.5 text-xs bg-slate-800 border border-slate-700/60 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loadingMaterials ? (
                        <div className="p-3 space-y-2">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Skeleton key={i} className="h-10 rounded-lg" />
                            ))}
                        </div>
                    ) : materialsError ? (
                        <ErrorState message={materialsError} onRetry={loadMaterials} />
                    ) : filteredMaterials.length === 0 ? (
                        <EmptyState title="No materials" description="No materials found." />
                    ) : (
                        <div className="p-2">
                            {filteredMaterials.map((mat) => (
                                <button
                                    key={mat.id}
                                    onClick={() => handleSelect(mat.id)}
                                    className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg text-left mb-1 transition-all ${selectedId === mat.id
                                            ? 'bg-sky-500/10 border border-sky-500/20 text-sky-200'
                                            : 'text-slate-400 hover:bg-slate-800/50 border border-transparent'
                                        }`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-medium truncate text-slate-200">{mat.name}</div>
                                        <div className="text-[10px] text-slate-500 font-mono">{mat.code}</div>
                                    </div>
                                    {selectedId === mat.id && <ChevronRight className="w-3 h-3 text-sky-400 shrink-0" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto min-w-0">
                {!selectedId ? (
                    <div className="h-full flex items-center justify-center">
                        <EmptyState
                            icon={<ShieldAlert className="w-5 h-5 text-slate-500" />}
                            title="Select a material"
                            description="Choose a material from the list to view its risk analysis and contributing factors."
                        />
                    </div>
                ) : loadingRisk ? (
                    <div className="space-y-4">
                        <Skeleton className="h-40 rounded-xl" />
                        <div className="grid grid-cols-3 gap-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-20 rounded-xl" />
                            ))}
                        </div>
                        <Skeleton className="h-60 rounded-xl" />
                    </div>
                ) : riskError ? (
                    <ErrorState message={riskError} onRetry={() => selectedId && loadRisk(selectedId)} />
                ) : riskData && riskCfg ? (
                    <div className="space-y-4">
                        <div className={`p-5 rounded-xl border ${riskCfg.border} bg-gradient-to-br ${riskCfg.bg}`}>
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                                        Risk Assessment
                                    </div>
                                    <div className="text-lg font-bold text-slate-100 mb-1">
                                        {selectedMaterial?.name ?? riskData.material_name ?? 'Material'}
                                    </div>
                                    <div className="text-xs font-mono text-slate-500 mb-3">
                                        {selectedMaterial?.code ?? riskData.material_code}
                                    </div>
                                    <RiskBadge label={riskData.risk_label} score={riskData.risk_score} />
                                </div>
                                <div className="shrink-0">
                                    <RiskGauge score={riskData.risk_score} />
                                </div>
                            </div>
                        </div>

                        {riskData.interpretation && (
                            <div className="p-4 rounded-xl border border-slate-800/60 bg-slate-900/60">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                                    <div>
                                        <div className="text-xs font-semibold text-slate-300 mb-1">Interpretation</div>
                                        <p className="text-xs text-slate-400 leading-relaxed">{riskData.interpretation}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {riskData.contributing_factors && riskData.contributing_factors.length > 0 && (
                            <div className="p-4 rounded-xl border border-slate-800/60 bg-slate-900/60">
                                <SectionHeader
                                    title="Contributing Factors"
                                    subtitle="Weighted impact analysis"
                                />
                                <div>
                                    {riskData.contributing_factors.map((f, i) => (
                                        <FactorRow key={i} factor={f} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {riskData.recommendations && riskData.recommendations.length > 0 && (
                            <div className="p-4 rounded-xl border border-slate-800/60 bg-slate-900/60">
                                <SectionHeader title="Recommended Actions" />
                                <ul className="space-y-2">
                                    {riskData.recommendations.map((rec, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                                            <span className="w-4 h-4 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                                {i + 1}
                                            </span>
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-32">
                        <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
                    </div>
                )}
            </div>
        </div>
    );
}
