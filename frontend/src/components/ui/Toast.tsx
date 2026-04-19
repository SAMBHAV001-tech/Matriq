import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast, Toast, ToastType } from '../../context/ToastContext';

const ICONS: Record<ToastType, React.ElementType> = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

const STYLES: Record<ToastType, string> = {
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    error: 'border-red-500/30 bg-red-500/10 text-red-300',
    warning: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    info: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
};

function ToastItem({ toast }: { toast: Toast }) {
    const { removeToast } = useToast();
    const Icon = ICONS[toast.type];

    return (
        <div
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm shadow-xl max-w-sm w-full animate-fade-in ${STYLES[toast.type]}`}
        >
            <Icon className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="flex-1 text-xs leading-relaxed">{toast.message}</p>
            <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}

export function ToastContainer() {
    const { toasts } = useToast();

    if (!toasts.length) return null;

    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
            {toasts.map((t) => (
                <ToastItem key={t.id} toast={t} />
            ))}
        </div>
    );
}
