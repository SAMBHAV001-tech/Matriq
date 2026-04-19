import { useState, useCallback } from 'react';
import { ToastProvider } from './context/ToastContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { AppShell } from './components/layout/AppShell';
import { Overview } from './views/Overview';
import { ALVReport } from './views/ALVReport';
import { AlertsView } from './views/AlertsView';
import { ReorderInsights } from './views/ReorderInsights';
import { MaterialRisk } from './views/MaterialRisk';

function DashboardContent() {
    const { activeView } = useNavigation();
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = useCallback(() => {
        setRefreshKey((k) => k + 1);
    }, []);

    return (
        <AppShell onRefresh={handleRefresh}>
            {activeView === 'overview' && <Overview refreshKey={refreshKey} />}
            {activeView === 'alv-report' && <ALVReport refreshKey={refreshKey} />}
            {activeView === 'alerts' && <AlertsView refreshKey={refreshKey} />}
            {activeView === 'reorder-insights' && <ReorderInsights refreshKey={refreshKey} />}
            {activeView === 'material-risk' && <MaterialRisk refreshKey={refreshKey} />}
        </AppShell>
    );
}

function App() {
    return (
        <ToastProvider>
            <NavigationProvider>
                <DashboardContent />
            </NavigationProvider>
        </ToastProvider>
    );
}

export default App;
