interface Segment {
    label: string;
    value: number;
    color: string;
}

interface DonutChartProps {
    segments: Segment[];
    size?: number;
    thickness?: number;
    centerLabel?: string;
    centerValue?: string;
}

export function DonutChart({
    segments,
    size = 140,
    thickness = 22,
    centerLabel,
    centerValue,
}: DonutChartProps) {
    const total = segments.reduce((s, seg) => s + seg.value, 0);
    const r = (size - thickness) / 2;
    const circumference = 2 * Math.PI * r;
    const cx = size / 2;
    const cy = size / 2;

    let accumulated = 0;

    return (
        <div className="flex items-center gap-5">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90">
                <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth={thickness}
                />
                {total > 0 &&
                    segments.map((seg, i) => {
                        if (seg.value === 0) return null;
                        const fraction = seg.value / total;
                        const dashArray = fraction * circumference;
                        const offset = circumference - accumulated * circumference;
                        accumulated += fraction;
                        return (
                            <circle
                                key={i}
                                cx={cx}
                                cy={cy}
                                r={r}
                                fill="none"
                                stroke={seg.color}
                                strokeWidth={thickness}
                                strokeDasharray={`${dashArray} ${circumference}`}
                                strokeDashoffset={offset}
                                strokeLinecap="butt"
                                style={{ transition: 'stroke-dasharray 0.6s ease' }}
                            />
                        );
                    })}
            </svg>
            {(centerLabel || centerValue) && (
                <div className="absolute" style={{ transform: 'none' }} />
            )}
            <div className="flex flex-col gap-2">
                {segments.map((seg, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                        <span className="text-[11px] text-slate-400">{seg.label}</span>
                        <span className="text-[11px] font-mono text-slate-300 ml-auto pl-3">{seg.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function DonutChartWithCenter({
    segments,
    size = 140,
    thickness = 22,
    centerLabel,
    centerValue,
}: DonutChartProps) {
    const total = segments.reduce((s, seg) => s + seg.value, 0);
    const r = (size - thickness) / 2;
    const circumference = 2 * Math.PI * r;
    const cx = size / 2;
    const cy = size / 2;

    let accumulated = 0;

    return (
        <div className="flex items-center gap-5">
            <div className="relative shrink-0" style={{ width: size, height: size }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth={thickness} />
                    {total > 0 &&
                        segments.map((seg, i) => {
                            if (seg.value === 0) return null;
                            const fraction = seg.value / total;
                            const dashArray = fraction * circumference;
                            const offset = circumference - accumulated * circumference;
                            accumulated += fraction;
                            return (
                                <circle
                                    key={i}
                                    cx={cx}
                                    cy={cy}
                                    r={r}
                                    fill="none"
                                    stroke={seg.color}
                                    strokeWidth={thickness}
                                    strokeDasharray={`${dashArray} ${circumference}`}
                                    strokeDashoffset={offset}
                                    strokeLinecap="butt"
                                />
                            );
                        })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center rotate-0">
                    {centerValue && (
                        <span className="text-lg font-bold text-slate-100 leading-tight">{centerValue}</span>
                    )}
                    {centerLabel && (
                        <span className="text-[10px] text-slate-500 leading-tight">{centerLabel}</span>
                    )}
                </div>
            </div>
            <div className="flex flex-col gap-2 min-w-[110px]">
                {segments.map((seg, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                        <span className="text-[11px] text-slate-400 flex-1">{seg.label}</span>
                        <span className="text-[11px] font-mono text-slate-300">{seg.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
