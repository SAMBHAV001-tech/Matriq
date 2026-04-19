import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
    message?: string;
    onRetry?: () => void;
}

export function ErrorState({
    message = 'Failed to load data. Check your backend connection.',
    onRetry,
}: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-300 mb-1">Data unavailable</h3>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-4">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-all"
                >
                    <RefreshCw className="w-3 h-3" />
                    Retry
                </button>
            )}
        </div>
    );
}
