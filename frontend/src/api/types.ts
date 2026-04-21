export interface Material {
    id: number;
    material_code: string;
    material_name: string;
    material_group: string;
    unit_price: number;
    base_unit?: string;
    reorder_level?: number;
}

export interface Vendor {
    id: number;
    vendor_code: string;
    vendor_name: string;
    city?: string;
    country?: string;
    rating?: number;
}

export interface Plant {
    id: number;
    plant_code: string;
    plant_name: string;
    location?: string;
}

export interface InventoryRecord {
    id: string;
    material_id: string;
    vendor_id: string;
    plant_id: string;
    storage_location: string;
    current_stock: number;
    reorder_level: number;
    monthly_consumption: number;
    last_gr_date: string;
    recommended_reorder_qty: number;
    stock_status?: StockStatus;
}

export type StockStatus = 'healthy' | 'low' | 'critical' | 'out_of_stock';
export type RiskLabel = 'low' | 'medium' | 'high' | 'critical';

export interface ALVReportItem {
    material_id: string;
    material_code: string;
    material_name: string;
    material_group: string;
    vendor_code: string;
    vendor_name: string;
    plant_code: string;
    plant_name: string;
    storage_location: string;
    current_stock: number;
    reorder_level: number;
    unit_price: number;
    monthly_consumption: number;
    last_gr_date: string;
    stock_status: StockStatus;
    recommended_reorder_qty: number;
    risk_score: number;
    risk_label: RiskLabel;
}

export interface ALVSummary {
    total_materials: number;
    healthy_count: number;
    low_count: number;
    critical_count: number;
    out_of_stock_count: number;
    total_inventory_value: number;
    material_groups?: Record<string, number>;
}

export interface Alert {
    id?: string;
    material_id?: string;
    material_code: string;
    material_name: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    plant_code?: string;
    plant_name?: string;
    vendor_code?: string;
    vendor_name?: string;
    stock_status?: StockStatus;
    current_stock?: number;
    reorder_level?: number;
}

export interface ReorderRecommendation {
    material_id: string;
    material_code: string;
    material_name: string;
    material_group?: string;
    vendor_code?: string;
    vendor_name?: string;
    plant_code?: string;
    plant_name?: string;
    current_stock: number;
    reorder_level: number;
    monthly_consumption: number;
    recommended_reorder_qty: number;
    risk_score?: number;
    risk_label?: RiskLabel;
    reason?: string;
}

export interface MaterialRisk {
    material_id: string;
    material_code?: string;
    material_name?: string;
    risk_score: number;
    risk_label: RiskLabel;
    contributing_factors?: ContributingFactor[];
    interpretation?: string;
    recommendations?: string[];
}

export interface ContributingFactor {
    factor: string;
    weight?: number;
    value?: string | number;
    impact?: 'positive' | 'negative' | 'neutral';
}

export interface HealthResponse {
    status: string;
    timestamp?: string;
    version?: string;
    database?: string;
}

export interface ALVFilters {
    plant_code?: string;
    vendor_code?: string;
    material_group?: string;
    stock_status?: StockStatus | '';
    search?: string;
}

export interface ApiError {
    message: string;
    status?: number;
}
