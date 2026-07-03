'use client';

import AdminNav from '@/app/admin-v1/AdminNav';
import { COMMODITY_LAUNCH_SET } from '@/app/admin-v1/commodity-reports/CommodityLaunchSet';
import { CommodityAdminReportRow, CommodityAdminReportsResponse } from '@/app/api/[spaceId]/commodities-v1/commodity-admin-reports/route';
import { CommodityAnalysisCategory, COMMODITY_CATEGORY_NAMES } from '@/types/commodity/commodity-analysis-types';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Link from 'next/link';
import { useState } from 'react';

const CATEGORY_COLUMNS: CommodityAnalysisCategory[] = [
  CommodityAnalysisCategory.SupplyAndDemand,
  CommodityAnalysisCategory.PriceAndValue,
  CommodityAnalysisCategory.VolatilityAndRisk,
  CommodityAnalysisCategory.FutureOutlook,
];

function YesNoPill({ done }: { done: boolean }): JSX.Element {
  return done ? (
    <span className="px-2 py-1 rounded-full text-xs bg-green-900 text-green-200">Yes</span>
  ) : (
    <span className="px-2 py-1 rounded-full text-xs bg-red-900 text-red-200">No</span>
  );
}

export default function CommodityReportsPage(): JSX.Element {
  const { data, loading, reFetchData } = useFetchData<CommodityAdminReportsResponse>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/commodities-v1/commodity-admin-reports`,
    {},
    'Failed to load commodities'
  );
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [seeding, setSeeding] = useState<boolean>(false);

  const commodities: CommodityAdminReportRow[] = data?.commodities ?? [];

  async function handleGenerate(slug: string): Promise<void> {
    setBusySlug(slug);
    try {
      await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/commodities-v1/generation-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{ slug }]),
      });
      await reFetchData();
    } catch (err) {
      console.error('Failed to start commodity generation:', err);
    } finally {
      setBusySlug(null);
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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Commodity Reports</h1>
        <div className="flex items-center gap-3">
          <Link href="/admin-v1/commodity-generation-requests" className="text-sm link-color hover:underline">
            Generation Requests →
          </Link>
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
                {CATEGORY_COLUMNS.map((cat) => (
                  <th key={cat} className="py-2 px-2 text-center">
                    {COMMODITY_CATEGORY_NAMES[cat]}
                  </th>
                ))}
                <th className="py-2 px-2 text-center">Key Facts</th>
                <th className="py-2 px-2 text-center">Summary</th>
                <th className="py-2 px-2 text-center">Score</th>
                <th className="py-2 px-2 text-center">Status</th>
                <th className="py-2 px-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {commodities.map((c) => (
                <tr key={c.id} className="border-b border-border/50">
                  <td className="py-2 pr-4">
                    <Link href={`/commodities/${c.slug}`} className="link-color hover:underline">
                      {c.name}
                    </Link>
                    <span className="text-muted"> ({c.slug})</span>
                  </td>
                  <td className="py-2 px-2">{c.commodityGroup}</td>
                  {CATEGORY_COLUMNS.map((cat) => (
                    <td key={cat} className="py-2 px-2 text-center">
                      <YesNoPill done={c.categories[cat]} />
                    </td>
                  ))}
                  <td className="py-2 px-2 text-center">
                    <YesNoPill done={c.hasKeyFacts} />
                  </td>
                  <td className="py-2 px-2 text-center">
                    <YesNoPill done={c.hasFinalSummary} />
                  </td>
                  <td className="py-2 px-2 text-center">{c.finalScore ?? '—'}</td>
                  <td className="py-2 px-2 text-center">{c.latestRequestStatus ?? '—'}</td>
                  <td className="py-2 px-2 text-center">
                    <button
                      onClick={() => handleGenerate(c.slug)}
                      disabled={busySlug === c.slug}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-medium py-1.5 px-3 rounded-md"
                    >
                      {busySlug === c.slug ? 'Starting…' : 'Generate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageWrapper>
  );
}
