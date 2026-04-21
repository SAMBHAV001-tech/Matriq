import { useEffect, useRef, useState, useCallback } from 'react';
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

function DashboardContent({ isWaking, refreshKey, onRefresh }: { isWaking: boolean; refreshKey: number; onRefresh: () => void }) {
    const { activeView } = useNavigation();

    return (
        <AppShell onRefresh={onRefresh} isWaking={isWaking}>
            {activeView === 'overview' && <Overview refreshKey={refreshKey} />}
            {activeView === 'alv-report' && <ALVReport refreshKey={refreshKey} />}
            {activeView === 'alerts' && <AlertsView refreshKey={refreshKey} />}
            {activeView === 'reorder-insights' && <ReorderInsights refreshKey={refreshKey} />}
            {activeView === 'material-risk' && <MaterialRisk refreshKey={refreshKey} />}
        </AppShell>
    );
}

function App() {
    // Start as true — hold off all data fetches until backend confirmed alive
    const [isWaking, setIsWaking] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const checkedRef = useRef(false);

    const handleRefresh = useCallback(() => {
        setRefreshKey((k) => k + 1);
    }, []);

    useEffect(() => {
        if (checkedRef.current) return;
        checkedRef.current = true;

        const BASE = import.meta.env.VITE_API_BASE_URL || 'https://SamD444-matriq-backend-api.hf.space';

        // Quick probe: if /health responds within 2s, backend is already up
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        fetch(`${BASE}/health`, { signal: controller.signal })
            .then((res) => {
                clearTimeout(timeoutId);
                if (res.ok) {
                    // Backend up — allow views to load & trigger first data fetch
                    setIsWaking(false);
                    setRefreshKey((k) => k + 1);
                } else {
                    wakeBackend().then(() => {
                        setIsWaking(false);
                        setRefreshKey((k) => k + 1);
                    });
                }
            })
            .catch(() => {
                // Timed out or failed → backend cold, keep waking
                wakeBackend().then(() => {
                    setIsWaking(false);
                    setRefreshKey((k) => k + 1);
                });
            });

        return () => controller.abort();
    }, []);

    return (
        <ToastProvider>
            <NavigationProvider>
                <DashboardContent isWaking={isWaking} refreshKey={refreshKey} onRefresh={handleRefresh} />
            </NavigationProvider>
        </ToastProvider>
    );
}

export default App;
