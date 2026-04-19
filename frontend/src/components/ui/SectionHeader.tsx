import { ReactNode } from 'react';

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
}

export function SectionHeader({ title, subtitle, actions }: SectionHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-5">
            <div>
                <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
                {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    );
}
