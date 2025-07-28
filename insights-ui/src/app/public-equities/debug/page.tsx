import TickersTable from '@/app/public-equities/debug/tickers/TickersTable';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Ticker } from '@prisma/client';
import Link from 'next/link';

export interface PaginatedTickersResponse {
  tickers: Ticker[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default async function DebugPage() {
  const response = await fetch(`${getBaseUrl()}/api/tickers?all=true`, { cache: 'no-cache' });
  const { tickers } = (await response.json()) as PaginatedTickersResponse;
  return (
    <PageWrapper>
      <div className="my-16">
        <h1>Criteria</h1>
        <ul>
          <ol>
            <Link href="/public-equities/industry-group-criteria" className="link-color underline text-xl" target="_blank">
              Criteria Table
            </Link>
          </ol>
          <ol>
            <Link href="/public-equities/industry-group-criteria" className="link-color underline text-xl" target="_blank">
              REIT Criteria
            </Link>
          </ol>
        </ul>
      </div>
      <h1 className="text-3xl">Ticker</h1>
      <TickersTable tickers={tickers} />
    </PageWrapper>
  );
}
