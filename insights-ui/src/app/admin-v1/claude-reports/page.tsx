'use client';

import MarketsFilter from '@/app/admin-v1/claude-reports/MarketsFilter';
import UpcomingReportsTable from '@/app/admin-v1/claude-reports/UpcomingReportsTable';
import SectionPagination from '@/app/admin-v1/generation-requests/SectionPagination';
import { UpcomingAutoGenerationResponse } from '@/app/api/[spaceId]/tickers-v1/upcoming-auto-generation/route';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { AUTO_GEN_MARKETS_INFO } from '@/utils/auto-generation/auto-gen-config';
import { AutoGenMarkets } from '@/utils/auto-generation/auto-gen-models';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';

const PAGE_SIZE: number = 25;

/**
 * Preview of the stock auto-generation queue: which stocks the nightly Claude job
 * will generate reports for, in the order it will pick them (stalest report first).
 *
 * The markets toggle mirrors the `AUTOMATED_GENERATION_MARKETS` App Setting — the
 * job only generates for US/Canadian listings by default, so the page opens on
 * whatever is configured and lets an operator preview the "All markets" queue
 * without changing the setting.
 */
export default function ClaudeReportsPage(): JSX.Element {
  const [page, setPage] = useState<number>(1);
  // `undefined` until the first response tells us what is configured, so the page
  // opens on the real setting instead of guessing a default that may be wrong.
  const [markets, setMarkets] = useState<AutoGenMarkets | undefined>(undefined);

  const apiUrl: string = useMemo(() => {
    const params = new URLSearchParams({ skip: String((page - 1) * PAGE_SIZE), take: String(PAGE_SIZE) });
    if (markets) params.append('markets', markets);
    return `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/upcoming-auto-generation?${params.toString()}`;
  }, [page, markets]);

  const { data, loading, reFetchData } = useFetchData<UpcomingAutoGenerationResponse>(apiUrl, {}, 'Failed to fetch upcoming Claude reports');

  const rows = data?.items ?? [];
  const totalCount: number = data?.totalCount ?? 0;
  const selectedMarkets: AutoGenMarkets = markets ?? data?.configuredMarkets ?? AutoGenMarkets.UsAndCanadaOnly;

  // Only mark the next batch when this preview matches what the job is configured
  // to do — on a hypothetical market selection those rows are not what runs next.
  const isConfiguredView: boolean = data !== undefined && data.appliedMarkets === data.configuredMarkets;
  const nextBatchCount: number = isConfiguredView ? data!.batchSize : 0;

  function handleMarketsChange(next: AutoGenMarkets): void {
    setMarkets(next);
    setPage(1);
  }

  return (
    <>
      <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
        <Heading as="h2" size="2xl" weight="bold">
          Upcoming Claude Reports
        </Heading>
        <Button onClick={() => reFetchData()} variant="outlined" className="flex items-center gap-2">
          <ArrowPathIcon className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <Text tone="muted" className="mb-4">
        Stocks the automated Claude job will generate reports for, oldest report first — the same order and eligibility the nightly job uses. Stocks with no
        report yet, or with a generation request already in flight, are not listed.
      </Text>

      <div className="bg-surface border border-border rounded-lg p-3">
        <div className="flex flex-wrap gap-3 justify-between items-center mb-3">
          <MarketsFilter selected={selectedMarkets} onChange={handleMarketsChange} disabled={loading} />
          <Text size="xs" tone="muted" as="span">
            {totalCount} stock{totalCount === 1 ? '' : 's'} queued
          </Text>
        </div>

        {data && !isConfiguredView && (
          <Text size="xs" tone="muted" className="mb-3">
            Preview only. The job is currently set to <strong>{AUTO_GEN_MARKETS_INFO[data.configuredMarkets].label}</strong>, so these are not the reports that
            will actually run next. Change it under{' '}
            <Link href="/admin-v1/app-settings" className="text-link">
              App Settings → Automated generation markets
            </Link>
            .
          </Text>
        )}

        {isConfiguredView && (
          <Text size="xs" tone="muted" className="mb-3">
            The next batch takes the top {data!.batchSize} of these.
          </Text>
        )}

        {loading && rows.length === 0 ? (
          <div className="py-6">Loading upcoming reports...</div>
        ) : rows.length === 0 ? (
          <div className="py-3 text-muted">No stocks are queued for automated generation in these markets.</div>
        ) : (
          <>
            <UpcomingReportsTable rows={rows} startRank={(page - 1) * PAGE_SIZE + 1} nextBatchCount={nextBatchCount} />
            <SectionPagination currentPage={page} totalCount={totalCount} rowsOnPage={rows.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
          </>
        )}
      </div>
    </>
  );
}
