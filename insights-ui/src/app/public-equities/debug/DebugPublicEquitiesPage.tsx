'use client';

import TickersTable from '@/app/public-equities/debug/tickers/TickersTable';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Ticker } from '@prisma/client';
import Link from 'next/link';

export default async function DebugPublicEquitiesPage() {
  const response = await fetch(`${getBaseUrl()}/api/tickers`, { cache: 'no-cache' });
  const tickers: Ticker[] = (await response.json()) as Ticker[];
  return (
    <PageWrapper>
      <div>
        <div>
          <h1>Criteria</h1>
          <ul>
            <ol>
              <Link href="/public-equities/industry-group-criteria" className="link-color underline text-xl" target="_blank">
                Criteria Table
              </Link>
            </ol>
            <ol>
              <Link
                href="/public-equities/industry-group-criteria/real-estate/equity-real-estate-investment-trusts-reits/create"
                className="link-color underline text-xl"
                target="_blank"
              >
                REIT Custom Criteria
              </Link>
            </ol>
          </ul>
        </div>
        <div>
          <h1 className="text-3xl">Ticker</h1>
          <TickersTable tickers={tickers} />
        </div>
      </div>
    </PageWrapper>
  );
}
