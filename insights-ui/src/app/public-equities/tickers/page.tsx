import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Ticker } from '@prisma/client';
import Link from 'next/link';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PrivateWrapper from '@/components/auth/PrivateWrapper';
import TickerActionsDropdown from './[tickerKey]/TickerActionsDropdown';
import classNames from '@dodao/web-core/utils/classNames';

async function getTickersResponse(): Promise<Ticker[]> {
  try {
    const response = await fetch(`${getBaseUrl()}/api/tickers`, { cache: 'no-cache' });
    return await response.json();
  } catch (error) {
    console.error('Error fetching tickers:', error);
    return [];
  }
}

const breadcrumbs: BreadcrumbsOjbect[] = [
  {
    name: 'Custom Reports',
    href: `/custom-reports`,
    current: false,
  },
  {
    name: 'Tickers',
    href: `/public-equities/tickers`,
    current: true,
  },
];

export default async function AllTickersPage() {
  const tickers: Ticker[] = await getTickersResponse();

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <PrivateWrapper>
        <div className="flex justify-end mb-4">
          <Link
            href={'/public-equities/industry-group-criteria/real-estate/equity-real-estate-investment-trusts-reits/create'}
            className="link-color border border-color rounded-xl p-2"
          >
            View Criteria
          </Link>
          <Link href={'/public-equities/tickers/create'} className="link-color border border-color ml-4 rounded-xl p-2">
            Create Ticker
          </Link>
        </div>
      </PrivateWrapper>
      <ul role="list" className="divide-y">
        {tickers.length === 0 ? (
          <li className="py-5 text-center italic">No tickers found.</li>
        ) : (
          tickers.map((ticker) => (
            <li key={ticker.tickerKey} className="flex items-center justify-between gap-x-6 py-5">
              <div className="min-w-0">
                <div className="flex items-center gap-x-3">
                  <p className="text-sm font-semibold heading-color">{ticker.companyName || 'Unknown Company'}</p>
                  <p className="whitespace-nowrap rounded-md px-1.5 py-1 text-xs font-medium ring-1 ring-inset ring-border primary-text-color">
                    {ticker.tickerKey}
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-x-2 text-xs text-color">
                  <p>{ticker.shortDescription || 'No description provided'}</p>
                </div>
              </div>
              <div className="flex flex-none items-center gap-x-4">
                <Link
                  href={`/public-equities/tickers/${ticker.tickerKey}`}
                  className="rounded-md bg-block-bg-color px-2.5 py-1.5 text-sm font-semibold link-color shadow-sm ring-1 ring-inset ring-border hover:bg-block-bg-color"
                >
                  View Reports
                </Link>
                <PrivateWrapper>
                  <TickerActionsDropdown tickerKey={ticker.tickerKey} />
                </PrivateWrapper>
              </div>
            </li>
          ))
        )}
      </ul>
    </PageWrapper>
  );
}
