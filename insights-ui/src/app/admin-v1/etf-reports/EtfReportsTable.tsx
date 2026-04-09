'use client';

import { EtfReportRow } from '@/app/api/[spaceId]/etfs-v1/etf-admin-reports/route';

function StatusPill({ ok }: { ok: boolean }): JSX.Element {
  return <span className={`px-2 py-1 rounded-full text-xs ${ok ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>{ok ? 'Yes' : 'No'}</span>;
}

export default function EtfReportsTable({ etfs }: { etfs: EtfReportRow[] }): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-700 z-10">ETF</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Financial Info</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Stock Analyzer</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">MOR Analyzer</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">MOR Risk</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">MOR People</th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {etfs.map((e) => (
            <tr key={e.id}>
              <td className="px-4 py-3 text-sm font-medium sticky left-0 bg-gray-800 z-10" style={{ minWidth: '220px', maxWidth: '320px' }}>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-sm text-gray-100">{e.symbol}</span>
                  <span className="text-blue-400 text-xs">({e.exchange})</span>
                </div>
                <div className="text-xs text-gray-400 truncate" title={e.name}>
                  {e.name}
                </div>
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
            </tr>
          ))}

          {etfs.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-gray-300">
                No ETFs found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

