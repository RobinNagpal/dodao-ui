'use client';

import { EtfReportRow, EtfReportStatus } from '@/app/api/[spaceId]/etfs-v1/etf-admin-reports/route';
import Link from 'next/link';
import EtfRowActionsDropdown from './EtfRowActionsDropdown';

function StatusPill({ ok }: { ok: boolean }): JSX.Element {
  return <span className={`px-2 py-1 rounded-full text-xs ${ok ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>{ok ? 'Yes' : 'No'}</span>;
}

function ReportStatusPill({ status, count }: { status: EtfReportStatus; count?: number }): JSX.Element {
  if (status === 'generated') {
    const label = typeof count === 'number' ? String(count) : 'Yes';
    return <span className="px-2 py-1 rounded-full text-xs bg-green-900 text-green-200">{label}</span>;
  }
  if (status === 'in-progress') {
    return <span className="px-2 py-1 rounded-full text-xs bg-blue-900 text-blue-200">In Progress</span>;
  }
  if (status === 'failed') {
    return <span className="px-2 py-1 rounded-full text-xs bg-orange-900 text-orange-200">Failed</span>;
  }
  return <span className="px-2 py-1 rounded-full text-xs bg-red-900 text-red-200">No</span>;
}

export interface EtfReportsTableProps {
  etfs: EtfReportRow[];
  onRefresh: () => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
}

export default function EtfReportsTable({ etfs, onRefresh, selectedIds, onToggleSelect, onToggleSelectAll }: EtfReportsTableProps): JSX.Element {
  const allSelected = etfs.length > 0 && etfs.every((e) => selectedIds.has(e.id));
  const someSelected = etfs.some((e) => selectedIds.has(e.id));

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-surface-2">
          <tr>
            <th className="px-4 py-3 text-center w-10">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected && !allSelected;
                }}
                onChange={onToggleSelectAll}
                className="h-4 w-4 rounded border-border bg-surface-2 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
              />
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider sticky left-0 bg-surface-2 z-10">ETF</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-muted uppercase tracking-wider">Financial Info</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-muted uppercase tracking-wider">Stock Analyzer</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-muted uppercase tracking-wider">MOR Analyzer</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-muted uppercase tracking-wider">MOR Risk</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-muted uppercase tracking-wider">MOR People</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-muted uppercase tracking-wider">MOR Portfolio</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-muted uppercase tracking-wider">Performance</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-muted uppercase tracking-wider">Cost & Team</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-muted uppercase tracking-wider">Risk</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-muted uppercase tracking-wider">Future Outlook</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-muted uppercase tracking-wider">Summary</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-muted uppercase tracking-wider">Key Facts</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-muted uppercase tracking-wider">Competition</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-muted uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="bg-surface divide-y divide-border">
          {etfs.map((e) => (
            <tr key={e.id} className={selectedIds.has(e.id) ? 'bg-indigo-900/20' : ''}>
              <td className="px-4 py-3 text-center w-10">
                <input
                  type="checkbox"
                  checked={selectedIds.has(e.id)}
                  onChange={() => onToggleSelect(e.id)}
                  className="h-4 w-4 rounded border-border bg-surface-2 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                />
              </td>
              <td className="px-4 py-3 text-sm font-medium sticky left-0 bg-surface z-10" style={{ minWidth: '220px', maxWidth: '320px' }}>
                <Link href={`/etfs/${e.exchange}/${e.symbol}`} target="_blank" rel="noopener noreferrer" className="link-color">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-sm">{e.symbol}</span>
                    <span className="text-link text-xs">({e.exchange})</span>
                  </div>
                  <div className="text-xs text-muted truncate" title={e.name}>
                    {e.name}
                  </div>
                </Link>
              </td>
              <td className="px-4 py-3 text-sm text-center">
                <StatusPill ok={e.hasFinancialInfo} />
              </td>
              <td className="px-4 py-3 text-sm text-center">
                <StatusPill ok={e.hasStockAnalyzerInfo} />
              </td>
              <td className="px-4 py-3 text-sm text-center">
                <StatusPill ok={e.hasMorAnalyzerInfo} />
              </td>
              <td className="px-4 py-3 text-sm text-center">
                <StatusPill ok={e.hasMorRiskInfo} />
              </td>
              <td className="px-4 py-3 text-sm text-center">
                <StatusPill ok={e.hasMorPeopleInfo} />
              </td>
              <td className="px-4 py-3 text-sm text-center">
                <StatusPill ok={e.hasMorPortfolioInfo} />
              </td>
              <td className="px-4 py-3 text-sm text-center">
                <ReportStatusPill status={e.reportStatuses.performance} count={e.performanceAnalysisCount} />
              </td>
              <td className="px-4 py-3 text-sm text-center">
                <ReportStatusPill status={e.reportStatuses.costEfficiencyAndTeam} count={e.costEfficiencyAnalysisCount} />
              </td>
              <td className="px-4 py-3 text-sm text-center">
                <ReportStatusPill status={e.reportStatuses.risk} count={e.riskAnalysisCount} />
              </td>
              <td className="px-4 py-3 text-sm text-center">
                <ReportStatusPill status={e.reportStatuses.futureOutlook} count={e.futureOutlookAnalysisCount} />
              </td>
              <td className="px-4 py-3 text-sm text-center">
                <ReportStatusPill status={e.reportStatuses.summary} />
              </td>
              <td className="px-4 py-3 text-sm text-center">
                <ReportStatusPill status={e.reportStatuses.keyFacts} />
              </td>
              <td className="px-4 py-3 text-sm text-center">
                <ReportStatusPill status={e.reportStatuses.competition} />
              </td>
              <td className="px-4 py-3 text-sm text-center">
                <div className="flex items-center justify-center gap-2">
                  <Link
                    href={`/etfs/${e.exchange}/${e.symbol}/financial-data`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs link-color underline underline-offset-2"
                  >
                    Open
                  </Link>
                  <EtfRowActionsDropdown etf={e} onDone={onRefresh} />
                </div>
              </td>
            </tr>
          ))}

          {etfs.length === 0 && (
            <tr>
              <td colSpan={16} className="px-4 py-10 text-center text-muted">
                No ETFs found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
