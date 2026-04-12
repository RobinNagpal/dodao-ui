'use client';

import { EtfReportRow } from '@/app/api/[spaceId]/etfs-v1/etf-admin-reports/route';

interface MissingCategory {
  key: string;
  label: string;
  filter: (e: EtfReportRow) => boolean;
}

const categories: MissingCategory[] = [
  { key: 'financialInfo', label: 'Financial Info', filter: (e) => !e.hasFinancialInfo },
  { key: 'stockAnalyzer', label: 'Stock Analyzer', filter: (e) => !e.hasStockAnalyzerInfo },
  { key: 'morAnalyzer', label: 'MOR Analyzer', filter: (e) => !e.hasMorAnalyzerInfo },
  { key: 'morRisk', label: 'MOR Risk', filter: (e) => !e.hasMorRiskInfo },
  { key: 'morPeople', label: 'MOR People', filter: (e) => !e.hasMorPeopleInfo },
  { key: 'morPortfolio', label: 'MOR Portfolio', filter: (e) => !e.hasMorPortfolioInfo },
];

export interface SelectMissingBarProps {
  etfs: EtfReportRow[];
  onSelectIds: (ids: Set<string>) => void;
}

export default function SelectMissingBar({ etfs, onSelectIds }: SelectMissingBarProps): JSX.Element | null {
  const activeCats = categories.filter((cat) => etfs.some(cat.filter));

  if (activeCats.length === 0) return null;

  const buttonClass = 'px-3 py-1.5 text-xs font-medium rounded-md transition-colors bg-gray-700 text-gray-200 hover:bg-gray-600';

  return (
    <div className="flex items-center gap-3 px-6 py-3 bg-amber-900/30 border-b border-amber-700/40">
      <span className="text-sm font-medium text-amber-200">Select missing</span>
      <div className="h-4 w-px bg-amber-700/50" />
      {activeCats.map((cat) => {
        const missingEtfs = etfs.filter(cat.filter);
        return (
          <button key={cat.key} className={buttonClass} onClick={() => onSelectIds(new Set(missingEtfs.map((e) => e.id)))}>
            {cat.label} ({missingEtfs.length})
          </button>
        );
      })}
    </div>
  );
}
