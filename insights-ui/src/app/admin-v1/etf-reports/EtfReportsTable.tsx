'use client';

import { EtfReportRow } from '@/app/api/[spaceId]/etfs-v1/etf-admin-reports/route';
import Link from 'next/link';
import EtfRowActionsDropdown from './EtfRowActionsDropdown';

function StatusPill({ ok }: { ok: boolean }): JSX.Element {
  return <span className={`px-2 py-1 rounded-full text-xs ${ok ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>{ok ? 'Yes' : 'No'}</span>;
}

function AnalysisPill({ count }: { count: number }): JSX.Element {
  if (count === 0) return <span className="px-2 py-1 rounded-full text-xs bg-red-900 text-red-200">—</span>;
  return <span className="px-2 py-1 rounded-full text-xs bg-green-900 text-green-200">{count}</span>;
}

function SummaryPill({ ok }: { ok: boolean }): JSX.Element {
  return <span className={`px-2 py-1 rounded-full text-xs ${ok ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>{ok ? 'Yes' : 'No'}</span>;
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
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-4 py-3 text-center w-10">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected && !allSelected;
                }}
                onChange={onToggleSelectAll}
                className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
              />
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-700 z-10">ETF</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Financial Info</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Stock Analyzer</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">MOR Analyzer</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">MOR Risk</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">MOR People</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">MOR Portfolio</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Performance</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Cost & Team</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Risk</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Summary</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {etfs.map((e) => (
            <tr key={e.id} className={selectedIds.has(e.id) ? 'bg-indigo-900/20' : ''}>
              <td className="px-4 py-3 text-center w-10">
                <input
                  type="checkbox"
                  checked={selectedIds.has(e.id)}
                  onChange={() => onToggleSelect(e.id)}
                  className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                />
              </td>
              <td className="px-4 py-3 text-sm font-medium sticky left-0 bg-gray-800 z-10" style={{ minWidth: '220px', maxWidth: '320px' }}>
                <Link href={`/etfs/${e.exchange}/${e.symbol}`} target="_blank" rel="noopener noreferrer" className="link-color">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-sm">{e.symbol}</span>
                    <span className="text-blue-400 text-xs">({e.exchange})</span>
                  </div>
                  <div className="text-xs text-gray-400 truncate" title={e.name}>
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
                <AnalysisPill count={e.performanceAnalysisCount} />
              </td>
              <td className="px-4 py-3 text-sm text-center">
                <AnalysisPill count={e.costEfficiencyAnalysisCount} />
              </td>
              <td className="px-4 py-3 text-sm text-center">
                <AnalysisPill count={e.riskAnalysisCount} />
              </td>
              <td className="px-4 py-3 text-sm text-center">
                <SummaryPill ok={e.hasSummary} />
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
              <td colSpan={12} className="px-4 py-10 text-center text-gray-300">
                No ETFs found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
