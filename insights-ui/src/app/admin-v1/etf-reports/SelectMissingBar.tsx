'use client';

import { EtfReportRow } from '@/app/api/[spaceId]/etfs-v1/etf-admin-reports/route';

interface MissingCategory {
  key: string;
  label: string;
  filter: (e: EtfReportRow) => boolean;
}

const isReportMissing = (status: 'generated' | 'missing' | 'in-progress' | 'failed'): boolean => status !== 'generated';

const reportTypeCategories: MissingCategory[] = [
  { key: 'missingPerformance', label: 'Missing Performance', filter: (e) => isReportMissing(e.reportStatuses.performance) },
  { key: 'missingCostEfficiencyAndTeam', label: 'Missing Cost & Team', filter: (e) => isReportMissing(e.reportStatuses.costEfficiencyAndTeam) },
  { key: 'missingRisk', label: 'Missing Risk', filter: (e) => isReportMissing(e.reportStatuses.risk) },
  { key: 'missingSummary', label: 'Missing Summary', filter: (e) => isReportMissing(e.reportStatuses.summary) },
  { key: 'missingIndexStrategy', label: 'Missing Index & Strategy', filter: (e) => isReportMissing(e.reportStatuses.indexStrategy) },
  { key: 'missingFutureOutlook', label: 'Missing Future Outlook', filter: (e) => isReportMissing(e.reportStatuses.futureOutlook) },
  { key: 'missingCompetition', label: 'Missing Competition', filter: (e) => isReportMissing(e.reportStatuses.competition) },
  {
    key: 'missingAllAnalysis',
    label: 'Missing All Analysis',
    filter: (e) =>
      isReportMissing(e.reportStatuses.performance) &&
      isReportMissing(e.reportStatuses.costEfficiencyAndTeam) &&
      isReportMissing(e.reportStatuses.risk) &&
      isReportMissing(e.reportStatuses.summary) &&
      isReportMissing(e.reportStatuses.indexStrategy) &&
      isReportMissing(e.reportStatuses.futureOutlook) &&
      isReportMissing(e.reportStatuses.competition),
  },
];

const categories: MissingCategory[] = [
  { key: 'financialInfo', label: 'Financial Info', filter: (e) => !e.hasFinancialInfo },
  { key: 'stockAnalyzer', label: 'Stock Analyzer', filter: (e) => !e.hasStockAnalyzerInfo },
  { key: 'morAnalyzer', label: 'MOR Analyzer', filter: (e) => !e.hasMorAnalyzerInfo },
  { key: 'morRisk', label: 'MOR Risk', filter: (e) => !e.hasMorRiskInfo },
  { key: 'morPeople', label: 'MOR People', filter: (e) => !e.hasMorPeopleInfo },
  { key: 'morPortfolio', label: 'MOR Portfolio', filter: (e) => !e.hasMorPortfolioInfo },
  ...reportTypeCategories,
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
    <div className="flex flex-wrap items-center gap-3 px-6 py-3 bg-amber-900/30 border-b border-amber-700/40">
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
