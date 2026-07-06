'use client';

import AdminNav from '@/app/admin-v1/AdminNav';
import { COMMODITY_LAUNCH_SET } from '@/app/admin-v1/commodity-reports/CommodityLaunchSet';
import { CommodityAdminReportRow, CommodityAdminReportsResponse } from '@/app/api/[spaceId]/commodities-v1/commodity-admin-reports/route';
import { CommodityAnalysisCategory, CommodityReportType, COMMODITY_REPORT_TYPE_TO_CATEGORY } from '@/types/commodity/commodity-analysis-types';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Link from 'next/link';
import { useState } from 'react';

/** The six report types, in generation order (Final Summary depends on the four categories). */
const REPORT_COLUMNS: { reportType: CommodityReportType; label: string }[] = [
  { reportType: CommodityReportType.SUPPLY_AND_DEMAND, label: 'Supply & Demand' },
  { reportType: CommodityReportType.PRICE_AND_VALUE, label: 'Price & Value' },
  { reportType: CommodityReportType.VOLATILITY_AND_RISK, label: 'Volatility & Risk' },
  { reportType: CommodityReportType.FUTURE_OUTLOOK, label: 'Future Outlook' },
  { reportType: CommodityReportType.KEY_FACTS, label: 'Key Facts' },
  { reportType: CommodityReportType.FINAL_SUMMARY, label: 'Final Summary' },
];

const CATEGORY_REPORT_TYPES: CommodityReportType[] = [
  CommodityReportType.SUPPLY_AND_DEMAND,
  CommodityReportType.PRICE_AND_VALUE,
  CommodityReportType.VOLATILITY_AND_RISK,
  CommodityReportType.FUTURE_OUTLOOK,
];

/** Whether a given report type has already been generated for this commodity. */
function isReportDone(row: CommodityAdminReportRow, reportType: CommodityReportType): boolean {
  if (reportType === CommodityReportType.KEY_FACTS) return row.hasKeyFacts;
  if (reportType === CommodityReportType.FINAL_SUMMARY) return row.hasFinalSummary;
  const category = COMMODITY_REPORT_TYPE_TO_CATEGORY[reportType] as CommodityAnalysisCategory;
  return row.categories[category];
}

/** Final Summary depends on the four scored categories being generated first. */
function isBlocked(row: CommodityAdminReportRow, reportType: CommodityReportType): boolean {
  return reportType === CommodityReportType.FINAL_SUMMARY && !CATEGORY_REPORT_TYPES.every((rt) => isReportDone(row, rt));
}

function YesNoPill({ done }: { done: boolean }): JSX.Element {
  return done ? (
    <span className="px-2 py-0.5 rounded-full text-xs bg-green-900 text-green-200">Yes</span>
  ) : (
    <span className="px-2 py-0.5 rounded-full text-xs bg-red-900 text-red-200">No</span>
  );
}

export default function CommodityReportsPage(): JSX.Element {
  const { data, loading, reFetchData } = useFetchData<CommodityAdminReportsResponse>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/commodities-v1/commodity-admin-reports`,
    {},
    'Failed to load commodities'
  );
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [seeding, setSeeding] = useState<boolean>(false);

  const commodities: CommodityAdminReportRow[] = data?.commodities ?? [];

  async function handleGenerate(slug: string, reportType: CommodityReportType): Promise<void> {
    setBusyKey(`${slug}:${reportType}`);
    try {
      await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/commodities-v1/${slug}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType }),
      });
      await reFetchData();
    } catch (err) {
      console.error('Failed to start commodity report generation:', err);
    } finally {
      setBusyKey(null);
    }
  }

  async function handleSeedLaunchSet(): Promise<void> {
    setSeeding(true);
    try {
      await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/commodities-v1/commodities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(COMMODITY_LAUNCH_SET),
      });
      await reFetchData();
    } catch (err) {
      console.error('Failed to seed launch commodities:', err);
    } finally {
      setSeeding(false);
    }
  }

  return (
    <PageWrapper>
      <AdminNav />
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Commodity Reports</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSeedLaunchSet}
            disabled={seeding}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium py-2 px-4 rounded-md"
          >
            {seeding ? 'Seeding…' : 'Seed launch commodities'}
          </button>
          <button onClick={() => reFetchData()} className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2 px-4 rounded-md">
            Refresh
          </button>
        </div>
      </div>
      <p className="text-muted text-sm mb-4">
        Generate each report type on demand — it runs in the background and saves when done. Click <span className="font-medium">Refresh</span> to see updated
        status. Final Summary unlocks once the four category reports exist.
      </p>

      {loading && commodities.length === 0 ? (
        <p className="text-muted">Loading…</p>
      ) : commodities.length === 0 ? (
        <p className="text-muted">No commodities yet. Click &ldquo;Seed launch commodities&rdquo; to add the starter set.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-border">
                <th className="py-2 pr-4">Commodity</th>
                <th className="py-2 px-2">Group</th>
                {REPORT_COLUMNS.map((col) => (
                  <th key={col.reportType} className="py-2 px-2 text-center whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
                <th className="py-2 px-2 text-center">Score</th>
              </tr>
            </thead>
            <tbody>
              {commodities.map((c) => (
                <tr key={c.id} className="border-b border-border/50 align-top">
                  <td className="py-2 pr-4">
                    <Link href={`/commodities/${c.slug}`} className="link-color hover:underline">
                      {c.name}
                    </Link>
                    <span className="text-muted"> ({c.slug})</span>
                  </td>
                  <td className="py-2 px-2">{c.commodityGroup}</td>
                  {REPORT_COLUMNS.map((col) => {
                    const done = isReportDone(c, col.reportType);
                    const blocked = isBlocked(c, col.reportType);
                    const running = busyKey === `${c.slug}:${col.reportType}`;
                    return (
                      <td key={col.reportType} className="py-2 px-2 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <YesNoPill done={done} />
                          <button
                            onClick={() => handleGenerate(c.slug, col.reportType)}
                            disabled={running || blocked || busyKey !== null}
                            title={blocked ? 'Generate the four category reports first' : `Generate ${col.label}`}
                            className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-[11px] font-medium py-0.5 px-2 rounded"
                          >
                            {running ? '…' : done ? 'Regen' : 'Gen'}
                          </button>
                        </div>
                      </td>
                    );
                  })}
                  <td className="py-2 px-2 text-center">{c.finalScore ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageWrapper>
  );
}
