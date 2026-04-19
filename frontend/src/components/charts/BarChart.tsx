interface BarItem {
    label: string;
    value: number;
    color?: string;
    sub?: string;
}

interface BarChartProps {
    items: BarItem[];
    maxValue?: number;
    formatValue?: (v: number) => string;
    height?: number;
}

export function HorizontalBarChart({
    items,
    maxValue,
    formatValue = (v) => v.toLocaleString(),
}: BarChartProps) {
    const max = maxValue ?? Math.max(...items.map((i) => i.value), 1);

    return (
        <div className="space-y-3">
            {items.map((item, i) => {
                const pct = Math.min((item.value / max) * 100, 100);
                return (
                    <div key={i} className="group">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-400 truncate max-w-[150px]" title={item.label}>
                                {item.label}
                            </span>
                            <span className="text-xs font-mono text-slate-300 ml-2 shrink-0">
                                {formatValue(item.value)}
                            </span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                    width: `${pct}%`,
                                    backgroundColor: item.color ?? '#0ea5e9',
                                }}
                            />
                        </div>
                        {item.sub && (
                            <div className="text-[10px] text-slate-600 mt-0.5">{item.sub}</div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export function VerticalBarChart({
    items,
    maxValue,
    formatValue = (v) => v.toString(),
}: BarChartProps) {
    const max = maxValue ?? Math.max(...items.map((i) => i.value), 1);

    return (
        <div className="flex items-end gap-2 h-32">
            {items.map((item, i) => {
                const pct = Math.min((item.value / max) * 100, 100);
                return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                        <span className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            {formatValue(item.value)}
                        </span>
                        <div className="w-full flex items-end" style={{ height: '80px' }}>
                            <div
                                className="w-full rounded-t transition-all duration-700"
                                style={{
                                    height: `${Math.max(pct, 4)}%`,
                                    backgroundColor: item.color ?? '#0ea5e9',
                                    opacity: 0.8,
                                }}
                            />
                        </div>
                        <span
                            className="text-[10px] text-slate-500 text-center leading-tight truncate w-full"
                            title={item.label}
                        >
                            {item.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
