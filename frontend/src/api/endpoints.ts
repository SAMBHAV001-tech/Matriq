import { api } from './client';
import type {
    Material,
    Vendor,
    Plant,
    InventoryRecord,
    ALVReportItem,
    ALVSummary,
    Alert,
    ReorderRecommendation,
    MaterialRisk,
    HealthResponse,
    ALVFilters,
} from './types';

export const healthApi = {
    check: () => api.get<HealthResponse>('/health'),
};

export const seedApi = {
    seed: () => api.post<{ message: string }>('/seed'),
};

export const materialsApi = {
    getAll: () => api.get<Material[]>('/materials'),
};

export const vendorsApi = {
    getAll: () => api.get<Vendor[]>('/vendors'),
};

export const plantsApi = {
    getAll: () => api.get<Plant[]>('/plants'),
};

export const inventoryApi = {
    getAll: () => api.get<InventoryRecord[]>('/inventory'),
    create: (record: Partial<InventoryRecord>) =>
        api.post<InventoryRecord>('/inventory', record),
    update: (id: string, record: Partial<InventoryRecord>) =>
        api.patch<InventoryRecord>(`/inventory/${id}`, record),
};

export const reportsApi = {
    getALV: (filters?: ALVFilters) => {
        const params = new URLSearchParams();
        if (filters?.plant_code) params.set('plant_code', filters.plant_code);
        if (filters?.vendor_code) params.set('vendor_code', filters.vendor_code);
        if (filters?.material_group) params.set('material_group', filters.material_group);
        if (filters?.stock_status) params.set('stock_status', filters.stock_status);
        if (filters?.search) params.set('search', filters.search);
        const qs = params.toString();
        return api.get<ALVReportItem[]>(`/reports/alv${qs ? `?${qs}` : ''}`);
    },
    getSummary: () => api.get<ALVSummary>('/reports/alv/summary'),
    getAlerts: () => api.get<Alert[]>('/reports/alerts'),
};

export const analyticsApi = {
    getReorderRecommendations: () =>
        api.get<ReorderRecommendation[]>('/analytics/reorder-recommendations'),
    getMaterialRisk: (materialId: string) =>
        api.get<MaterialRisk>(`/analytics/material-risk/${materialId}`),
};
