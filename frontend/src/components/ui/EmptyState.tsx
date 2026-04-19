import { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: ReactNode;
    action?: ReactNode;
}

export function EmptyState({
    title = 'No data available',
    description = 'There is currently no data to display. Try seeding the database or check your backend connection.',
    icon,
    action,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center mb-4">
                {icon ?? <Inbox className="w-5 h-5 text-slate-500" />}
            </div>
            <h3 className="text-sm font-semibold text-slate-300 mb-1">{title}</h3>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">{description}</p>
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
