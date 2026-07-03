'use client';

import AdminNav from '@/app/admin-v1/AdminNav';
import { CommodityGenerationRequestWithCommodity, CommodityGenerationRequestsResponse } from '@/app/api/[spaceId]/commodities-v1/generation-requests/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Link from 'next/link';
import { useEffect, useState } from 'react';

function RequestRow({ request, onReload }: { request: CommodityGenerationRequestWithCommodity; onReload?: (id: string) => void }): JSX.Element {
  return (
    <tr className="border-b border-border/50">
      <td className="py-2 pr-4">
        <Link href={`/commodities/${request.commodity.slug}`} className="link-color hover:underline">
          {request.commodity.name}
        </Link>
      </td>
      <td className="py-2 px-2">{request.inProgressStep ?? '—'}</td>
      <td className="py-2 px-2">{request.completedSteps.length}</td>
      <td className="py-2 px-2">{request.failedSteps.length}</td>
      <td className="py-2 px-2">{(request.pendingSteps ?? []).length}</td>
      <td className="py-2 px-2 text-center">
        {onReload && (
          <button onClick={() => onReload(request.id)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium py-1.5 px-3 rounded-md">
            Reload
          </button>
        )}
      </td>
    </tr>
  );
}

function Section({
  title,
  requests,
  onReload,
}: {
  title: string;
  requests: CommodityGenerationRequestWithCommodity[];
  onReload?: (id: string) => void;
}): JSX.Element {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-2">
        {title} ({requests.length})
      </h2>
      {requests.length === 0 ? (
        <p className="text-muted text-sm">None.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-border">
                <th className="py-2 pr-4">Commodity</th>
                <th className="py-2 px-2">In-progress step</th>
                <th className="py-2 px-2">Completed</th>
                <th className="py-2 px-2">Failed</th>
                <th className="py-2 px-2">Pending</th>
                <th className="py-2 px-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <RequestRow key={r.id} request={r} onReload={onReload} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function CommodityGenerationRequestsPage(): JSX.Element {
  const { data, reFetchData } = useFetchData<CommodityGenerationRequestsResponse>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/commodities-v1/generation-requests`,
    {},
    'Failed to load commodity generation requests'
  );

  const hasActive = (data?.counts.inProgress ?? 0) > 0 || (data?.counts.notStarted ?? 0) > 0;

  // Auto-refresh every 15s while any request is active so the admin sees progress.
  useEffect((): (() => void) | void => {
    if (!hasActive) return;
    const id = setInterval(() => reFetchData(), 15_000);
    return () => clearInterval(id);
  }, [hasActive, reFetchData]);

  async function handleReload(id: string): Promise<void> {
    try {
      await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/commodities-v1/generation-requests/${id}/reload`, { method: 'POST' });
      await reFetchData();
    } catch (err) {
      console.error('Failed to reload commodity generation request:', err);
    }
  }

  return (
    <PageWrapper>
      <AdminNav />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Commodity Generation Requests</h1>
        <div className="flex items-center gap-3">
          <Link href="/admin-v1/commodity-reports" className="text-sm link-color hover:underline">
            ← Commodity Reports
          </Link>
          <button onClick={() => reFetchData()} className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2 px-4 rounded-md">
            Refresh
          </button>
        </div>
      </div>

      <Section title="In Progress" requests={data?.inProgress ?? []} />
      <Section title="Not Started" requests={data?.notStarted ?? []} />
      <Section title="Failed" requests={data?.failed ?? []} onReload={handleReload} />
      <Section title="Completed" requests={data?.completed ?? []} />
    </PageWrapper>
  );
}
