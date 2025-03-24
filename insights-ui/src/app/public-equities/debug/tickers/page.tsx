import { GicsSector } from '@/types/public-equity/gicsSector';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Ticker } from '@prisma/client';
import Link from 'next/link';
import TickerTableActions from './TickerTableActions';
import gicsData from '@/gicsData/gicsData.json';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import PrivateWrapper from '@/components/auth/PrivateWrapper';

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
    name: 'Debug',
    href: `/public-equities/debug`,
    current: false,
  },
  {
    name: 'Tickers',
    href: `/public-equities/debug/tickers`,
    current: true,
  },
];

export default async function AllTickersPage() {
  const tickers: Ticker[] = await getTickersResponse();
  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <PrivateWrapper>
        <div className="flex justify-between">
          <div></div>
          <Link href={'/public-equities/tickers/create'} className="link-color underline">
            Create Ticker
          </Link>
        </div>
      </PrivateWrapper>
      <table className="w-full border-collapse border border-gray-300 text-left mt-6">
        <thead>
          <tr>
            <th className="p-3 border text-left">Ticker</th>
            <th className="p-3 border text-left">Sector</th>
            <th className="p-3 border text-left">Industry Group</th>
            <th className="p-3 border text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tickers.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-3 border text-center italic">
                No tickers found.
              </td>
            </tr>
          ) : (
            tickers.map((ticker) => {
              const sectors: GicsSector[] = Object.values(gicsData);
              const sector = sectors.find((sector) => sector.id === ticker.sectorId)!;
              const industryGroup = Object.values(sector?.industryGroups).find((group) => group.id === ticker.industryGroupId)!;
              return (
                <tr key={ticker.tickerKey} className="border">
                  <td className="p-3 border text-left">{ticker.tickerKey}</td>
                  <td className="p-3 border text-left">{sector.name}</td>
                  <td className="p-3 border text-left">{industryGroup.name}</td>
                  <td className="p-3 border text-left flex gap-2">
                    <TickerTableActions ticker={ticker} />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </PageWrapper>
  );
}
