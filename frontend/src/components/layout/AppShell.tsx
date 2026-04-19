import { ReactNode, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from '../ui/Toast';
import { Loader2 } from 'lucide-react';

interface AppShellProps {
    children: ReactNode;
    onRefresh?: () => void;
    isWaking?: boolean;
}

export function AppShell({ children, onRefresh, isWaking }: AppShellProps) {
    const handleRefresh = useCallback(() => {
        onRefresh?.();
    }, [onRefresh]);

    return (
        <div className="flex h-screen bg-[#080e1a] text-slate-200 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Topbar onRefresh={handleRefresh} />

                {/* Backend cold-start warmup banner */}
                {isWaking && (
                    <div className="flex items-center gap-3 px-5 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-amber-300 text-xs font-medium animate-pulse">
                        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                        <span>
                            Warming up the backend API — first load may take a few seconds as the server wakes up…
                        </span>
                    </div>
                )}

                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                    {children}
                </main>
            </div>
            <ToastContainer />
        </div>
    );
}
