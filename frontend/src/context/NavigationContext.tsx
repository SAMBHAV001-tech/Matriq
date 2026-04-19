import { createContext, useContext, useState, ReactNode } from 'react';

export type ViewId =
    | 'overview'
    | 'alv-report'
    | 'alerts'
    | 'reorder-insights'
    | 'material-risk';

interface NavigationContextValue {
    activeView: ViewId;
    setActiveView: (view: ViewId) => void;
    selectedMaterialId: string | null;
    setSelectedMaterialId: (id: string | null) => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
    const [activeView, setActiveView] = useState<ViewId>('overview');
    const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);

    return (
        <NavigationContext.Provider
            value={{ activeView, setActiveView, selectedMaterialId, setSelectedMaterialId }}
        >
            {children}
        </NavigationContext.Provider>
    );
}

export function useNavigation() {
    const ctx = useContext(NavigationContext);
    if (!ctx) throw new Error('useNavigation must be used within NavigationProvider');
    return ctx;
}
