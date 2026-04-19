import { useEffect, useRef } from 'react';
import { useState, useCallback } from 'react';
import { ToastProvider } from './context/ToastContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { AppShell } from './components/layout/AppShell';
import { Overview } from './views/Overview';
import { ALVReport } from './views/ALVReport';
import { AlertsView } from './views/AlertsView';
import { ReorderInsights } from './views/ReorderInsights';
import { MaterialRisk } from './views/MaterialRisk';
import { wakeBackend } from './api/client';

// Immediately fire wake pings before React even mounts
// This ensures the HF Spaces container starts warming ASAP
wakeBackend();

function DashboardContent({ isWaking }: { isWaking: boolean }) {
    const { activeView } = useNavigation();
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = useCallback(() => {
        setRefreshKey((k) => k + 1);
    }, []);

    return (
        <AppShell onRefresh={handleRefresh} isWaking={isWaking}>
            {activeView === 'overview' && <Overview refreshKey={refreshKey} />}
            {activeView === 'alv-report' && <ALVReport refreshKey={refreshKey} />}
            {activeView === 'alerts' && <AlertsView refreshKey={refreshKey} />}
            {activeView === 'reorder-insights' && <ReorderInsights refreshKey={refreshKey} />}
            {activeView === 'material-risk' && <MaterialRisk refreshKey={refreshKey} />}
        </AppShell>
    );
}

function App() {
    const [isWaking, setIsWaking] = useState(false);
    const checkedRef = useRef(false);

    useEffect(() => {
        if (checkedRef.current) return;
        checkedRef.current = true;

        // Quick probe: if /health doesn't respond in 800ms, backend is cold → show banner
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 800);

        fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/health`, {
            signal: controller.signal,
        })
            .then((res) => {
                clearTimeout(timeoutId);
                if (!res.ok) setIsWaking(true);
            })
            .catch(() => {
                // Timed out or failed → backend is sleeping, show warmup banner
                setIsWaking(true);
                // wakeBackend already looping; when it resolves, hide banner
                wakeBackend().then(() => setIsWaking(false));
            });

        return () => controller.abort();
    }, []);

    return (
        <ToastProvider>
            <NavigationProvider>
                <DashboardContent isWaking={isWaking} />
            </NavigationProvider>
        </ToastProvider>
    );
}

export default App;
