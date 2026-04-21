import { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Search,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    Download,
    Filter,
    X,
} from 'lucide-react';
import { reportsApi, plantsApi, vendorsApi } from '../api/endpoints';
import type { ALVReportItem, Plant, Vendor, ALVFilters, StockStatus } from '../api/types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { RiskBadge } from '../components/ui/RiskBadge';
import { TableRowSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';

interface ALVReportProps {
    refreshKey: number;
}

type SortKey = keyof ALVReportItem;
type SortDir = 'asc' | 'desc' | null;

const STOCK_STATUSES: { value: StockStatus | ''; label: string }[] = [
    { value: '', label: 'All Status' },
    { value: 'healthy', label: 'Healthy' },
    { value: 'low', label: 'Low Stock' },
    { value: 'critical', label: 'Critical' },
    { value: 'out_of_stock', label: 'Out of Stock' },
];

function formatDate(d: string) {
    if (!d) return '—';
    try {
        return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return d; }
}

function fmt(n: number | undefined | null) {
    if (n == null) return '—';
    return n.toLocaleString();
}

function fmtCurrency(n: number | undefined | null) {
    if (n == null) return '—';
    return `$${n.toFixed(2)}`;
}

export function ALVReport({ refreshKey }: ALVReportProps) {
    const [data, setData] = useState<ALVReportItem[]>([]);
    const [plants, setPlants] = useState<Plant[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [filters, setFilters] = useState<ALVFilters>({});
    const [localSearch, setLocalSearch] = useState('');
    const [sortKey, setSortKey] = useState<SortKey | null>(null);
    const [sortDir, setSortDir] = useState<SortDir>(null);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 15;

    const uniqueGroups = useMemo(() => {
        const s = new Set(data.map((d) => d.material_group).filter(Boolean));
        return Array.from(s).sort();
    }, [data]);

    const load = useCallback(async (f?: ALVFilters) => {
        setLoading(true);
        setError(null);
        try {
            const [rows, ps, vs] = await Promise.all([
                reportsApi.getALV(f),
                plantsApi.getAll(),
                vendorsApi.getAll(),
            ]);
            setData(Array.isArray(rows) ? rows : []);
            setPlants(Array.isArray(ps) ? ps : []);
            setVendors(Array.isArray(vs) ? vs : []);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load ALV report');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(filters); }, [load, refreshKey]);

    const applyFilters = () => { setPage(1); load(filters); };

    const clearFilters = () => {
        const empty: ALVFilters = {};
        setFilters(empty);
        setLocalSearch('');
        setPage(1);
        load(empty);
    };

    const hasActiveFilters = !!(
        filters.plant_code || filters.vendor_code || filters.material_group || filters.stock_status
    );

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(sortDir === 'asc' ? 'desc' : sortDir === 'desc' ? null : 'asc');
            if (sortDir === 'desc') setSortKey(null);
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    const filtered = useMemo(() => {
        let rows = [...data];
        if (localSearch) {
            const q = localSearch.toLowerCase();
            rows = rows.filter(
                (r) =>
                    r.material_name?.toLowerCase().includes(q) ||
                    r.material_code?.toLowerCase().includes(q) ||
                    r.vendor_name?.toLowerCase().includes(q) ||
                    r.plant_name?.toLowerCase().includes(q)
            );
        }
        if (sortKey && sortDir) {
            rows.sort((a, b) => {
                const av = a[sortKey] ?? '';
                const bv = b[sortKey] ?? '';
                const cmp = av < bv ? -1 : av > bv ? 1 : 0;
                return sortDir === 'asc' ? cmp : -cmp;
            });
        }
        return rows;
    }, [data, localSearch, sortKey, sortDir]);

    const paginated = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);
    }, [filtered, page]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

    const SortIcon = ({ col }: { col: SortKey }) => {
        if (sortKey !== col) return <ChevronsUpDown className="w-3 h-3 text-slate-600" />;
        if (sortDir === 'asc') return <ChevronUp className="w-3 h-3 text-sky-400" />;
        return <ChevronDown className="w-3 h-3 text-sky-400" />;
    };

    const exportCSV = () => {
        const headers = [
            'Material Code', 'Material Name', 'Group', 'Vendor', 'Plant',
            'Storage Loc', 'Current Stock', 'Reorder Level', 'Unit Price',
            'Monthly Consumption', 'Last GR Date', 'Stock Status',
            'Recommended Reorder Qty', 'Risk Score', 'Risk Label',
        ];
        const rows = filtered.map((r) => [
            r.material_code, r.material_name, r.material_group,
            `${r.vendor_code} - ${r.vendor_name}`, `${r.plant_code} - ${r.plant_name}`,
            r.storage_location, r.current_stock, r.reorder_level, r.unit_price,
            r.monthly_consumption, r.last_gr_date, r.stock_status,
            r.recommended_reorder_qty, r.risk_score, r.risk_label,
        ]);
        const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'matriq-alv-report.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    if (error) return <ErrorState message={error} onRetry={() => load(filters)} />;

    return (
        <div className="p-6 space-y-4">
            <div className="flex flex-wrap items-end gap-3 p-4 bg-slate-900/60 backdrop-blur-sm rounded-xl border border-slate-800/60">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search materials, vendors, plants…"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-xs bg-slate-800 border border-slate-700/60 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
                    />
                </div>

                <select
                    value={filters.plant_code ?? ''}
                    onChange={(e) => setFilters((f) => ({ ...f, plant_code: e.target.value || undefined }))}
                    className="px-3 py-2 text-xs bg-slate-800 border border-slate-700/60 rounded-lg text-slate-300 focus:outline-none focus:border-sky-500/50"
                >
                    <option value="">All Plants</option>
                    {plants.map((p) => (
                        <option key={p.id} value={p.plant_code}>{p.plant_code} – {p.plant_name}</option>
                    ))}
                </select>

                <select
                    value={filters.vendor_code ?? ''}
                    onChange={(e) => setFilters((f) => ({ ...f, vendor_code: e.target.value || undefined }))}
                    className="px-3 py-2 text-xs bg-slate-800 border border-slate-700/60 rounded-lg text-slate-300 focus:outline-none focus:border-sky-500/50"
                >
                    <option value="">All Vendors</option>
                    {vendors.map((v) => (
                        <option key={v.id} value={v.vendor_code}>{v.vendor_code} – {v.vendor_name}</option>
                    ))}
                </select>

                <select
                    value={filters.material_group ?? ''}
                    onChange={(e) => setFilters((f) => ({ ...f, material_group: e.target.value || undefined }))}
                    className="px-3 py-2 text-xs bg-slate-800 border border-slate-700/60 rounded-lg text-slate-300 focus:outline-none focus:border-sky-500/50"
                >
                    <option value="">All Groups</option>
                    {uniqueGroups.map((g) => (
                        <option key={g} value={g}>{g}</option>
                    ))}
                </select>

                <select
                    value={filters.stock_status ?? ''}
                    onChange={(e) => setFilters((f) => ({ ...f, stock_status: (e.target.value as StockStatus) || undefined }))}
                    className="px-3 py-2 text-xs bg-slate-800 border border-slate-700/60 rounded-lg text-slate-300 focus:outline-none focus:border-sky-500/50"
                >
                    {STOCK_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>

                <button
                    onClick={applyFilters}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-all font-medium"
                >
                    <Filter className="w-3 h-3" />
                    Apply
                </button>

                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-1 px-2.5 py-2 text-xs rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/40 transition-all"
                    >
                        <X className="w-3 h-3" />
                        Clear
                    </button>
                )}

                <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                        {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                    </span>
                    <button
                        onClick={exportCSV}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-300 transition-all"
                    >
                        <Download className="w-3 h-3" />
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl border border-slate-800/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-slate-800/80 bg-slate-950/60">
                                {([
                                    ['material_code', 'Mat. Code'],
                                    ['material_name', 'Material Name'],
                                    ['material_group', 'Group'],
                                    ['vendor_code', 'Vendor'],
                                    ['plant_code', 'Plant'],
                                    ['storage_location', 'Storage Loc'],
                                    ['current_stock', 'Curr. Stock'],
                                    ['reorder_level', 'Reorder Lvl'],
                                    ['unit_price', 'Unit Price'],
                                    ['monthly_consumption', 'Mo. Cons.'],
                                    ['last_gr_date', 'Last GR'],
                                    ['stock_status', 'Status'],
                                    ['recommended_reorder_qty', 'Rec. Qty'],
                                    ['risk_score', 'Risk'],
                                ] as [SortKey, string][]).map(([key, label]) => (
                                    <th
                                        key={key}
                                        onClick={() => handleSort(key)}
                                        className="px-3 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:text-slate-300 transition-colors whitespace-nowrap"
                                    >
                                        <span className="flex items-center gap-1.5">
                                            {label}
                                            <SortIcon col={key} />
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                            {loading ? (
                                Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={14} />)
                            ) : paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={14}>
                                        <EmptyState
                                            title="No records found"
                                            description="Try adjusting filters or seeding the database."
                                        />
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((row, i) => (
                                    <tr
                                        key={row.material_id ?? i}
                                        className="hover:bg-slate-800/30 transition-colors group"
                                    >
                                        <td className="px-3 py-3 font-mono text-sky-400 font-medium whitespace-nowrap">
                                            {row.material_code}
                                        </td>
                                        <td className="px-3 py-3 text-slate-200 font-medium max-w-[180px] truncate">
                                            <span title={row.material_name}>{row.material_name}</span>
                                        </td>
                                        <td className="px-3 py-3 text-slate-400 whitespace-nowrap">
                                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 border border-slate-700/40">
                                                {row.material_group}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            <div className="font-mono text-slate-300 text-[10px]">{row.vendor_code}</div>
                                            <div className="text-slate-500 text-[10px] truncate max-w-[100px]" title={row.vendor_name}>
                                                {row.vendor_name}
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            <div className="font-mono text-slate-300 text-[10px]">{row.plant_code}</div>
                                            <div className="text-slate-500 text-[10px] truncate max-w-[100px]" title={row.plant_name}>
                                                {row.plant_name}
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 font-mono text-slate-400 whitespace-nowrap">
                                            {row.storage_location}
                                        </td>
                                        <td className="px-3 py-3 font-mono text-slate-200 text-right whitespace-nowrap">
                                            {fmt(row.current_stock)}
                                        </td>
                                        <td className="px-3 py-3 font-mono text-slate-400 text-right whitespace-nowrap">
                                            {fmt(row.reorder_level)}
                                        </td>
                                        <td className="px-3 py-3 font-mono text-slate-300 text-right whitespace-nowrap">
                                            {fmtCurrency(row.unit_price)}
                                        </td>
                                        <td className="px-3 py-3 font-mono text-slate-400 text-right whitespace-nowrap">
                                            {fmt(row.monthly_consumption)}
                                        </td>
                                        <td className="px-3 py-3 text-slate-500 whitespace-nowrap">
                                            {formatDate(row.last_gr_date)}
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            <StatusBadge status={row.stock_status} compact />
                                        </td>
                                        <td className="px-3 py-3 font-mono text-teal-400 font-semibold text-right whitespace-nowrap">
                                            {fmt(row.recommended_reorder_qty)}
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            <RiskBadge label={row.risk_label} score={row.risk_score} compact />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800/60">
                        <span className="text-xs text-slate-500">
                            Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-2.5 py-1 text-xs rounded-md bg-slate-800 border border-slate-700/60 text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition-all"
                            >
                                Prev
                            </button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                                const p = start + i;
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-7 h-7 text-xs rounded-md border transition-all ${p === page
                                                ? 'bg-sky-600 border-sky-500 text-white'
                                                : 'bg-slate-800 border-slate-700/60 text-slate-400 hover:bg-slate-700'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-2.5 py-1 text-xs rounded-md bg-slate-800 border border-slate-700/60 text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
