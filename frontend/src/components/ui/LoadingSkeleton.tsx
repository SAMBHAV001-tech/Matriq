interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <div className={`animate-pulse rounded bg-slate-800/80 ${className}`} />
    );
}

export function StatCardSkeleton() {
    return (
        <div className="p-5 rounded-xl border border-slate-800/60 bg-slate-900/60">
            <Skeleton className="h-3 w-24 mb-4" />
            <Skeleton className="h-7 w-20 mb-2" />
            <Skeleton className="h-2.5 w-16" />
        </div>
    );
}

export function TableRowSkeleton({ cols = 8 }: { cols?: number }) {
    return (
        <tr className="border-b border-slate-800/40">
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <Skeleton className="h-3 w-full max-w-[120px]" />
                </td>
            ))}
        </tr>
    );
}

export function CardSkeleton() {
    return (
        <div className="p-4 rounded-xl border border-slate-800/60 bg-slate-900/60">
            <div className="flex items-start gap-3 mb-3">
                <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                <div className="flex-1">
                    <Skeleton className="h-3.5 w-32 mb-2" />
                    <Skeleton className="h-2.5 w-20" />
                </div>
            </div>
            <Skeleton className="h-2.5 w-full mb-1.5" />
            <Skeleton className="h-2.5 w-3/4" />
        </div>
    );
}
