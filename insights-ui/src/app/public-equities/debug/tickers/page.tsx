'use client';

import TickersTable from '@/app/public-equities/debug/tickers/TickersTable';
import PrivateWrapper from '@/components/auth/PrivateWrapper';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Ticker } from '@prisma/client';
import Link from 'next/link';

interface PaginatedTickersResponse {
  tickers: Ticker[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const breadcrumbs: BreadcrumbsOjbect[] = [
  {
    name: 'Debug Tickers',
    href: `/public-equities/debug/tickers`,
    current: true,
  },
];

export default async function AllTickersPage() {
  const response = await fetch(`${getBaseUrl()}/api/tickers?all=true`, { cache: 'no-cache' });
  const { tickers } = (await response.json()) as PaginatedTickersResponse;

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <PrivateWrapper>
        <div className="flex justify-between">
          <div></div>
          <div>
            <Link href={'/public-equities/industry-group-criteria'} className="link-color border border-color rounded-xl p-2">
              Criteria Table
            </Link>
            <Link
              href={'/public-equities/industry-group-criteria/real-estate/equity-real-estate-investment-trusts-reits/create'}
              className="link-color border border-color rounded-xl p-2"
            >
              View Criteria
            </Link>
            <Link href={'/public-equities/tickers/create'} className="link-color underline ml-4">
              Create Ticker
            </Link>
          </div>
        </div>
      </PrivateWrapper>
      <TickersTable tickers={tickers} />
    </PageWrapper>
  );
}
