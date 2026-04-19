import { ReactNode, useCallback, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from '../ui/Toast';

interface AppShellProps {
    children: ReactNode;
    onRefresh?: () => void;
    refreshKey?: number;
    setRefreshKey?: (fn: (k: number) => number) => void;
}

export function AppShell({ children, onRefresh }: AppShellProps) {
    const handleRefresh = useCallback(() => {
        onRefresh?.();
    }, [onRefresh]);

    return (
        <div className="flex h-screen bg-[#080e1a] text-slate-200 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Topbar onRefresh={handleRefresh} />
                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                    {children}
                </main>
            </div>
            <ToastContainer />
        </div>
    );
}
