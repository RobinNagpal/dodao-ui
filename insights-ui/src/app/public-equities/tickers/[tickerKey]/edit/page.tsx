import SingleCardLayout from '@/layouts/SingleCardLayout';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import gicsData from '@/gicsData/gicsData.json';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Ticker } from '@prisma/client';
import EditTickerView from '@/components/ticker/EditTickerView';

export default async function Page({ params }: { params: Promise<{ tickerKey: string }> }) {
  const { tickerKey } = await params;

  const response = await fetch(`${getBaseUrl()}/api/tickers/${tickerKey}?page=tickerEditPage`);
  const ticker = (await response.json()) as Ticker;
  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: `Edit Ticker`,
      href: `/public-equities/ticker/edit`,
      current: true,
    },
  ];
  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <SingleCardLayout>
        <EditTickerView gicsData={gicsData} ticker={ticker} />
      </SingleCardLayout>
    </PageWrapper>
  );
}
