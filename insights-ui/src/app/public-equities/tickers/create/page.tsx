'use client';

import EditTickerView from '@/components/ticker/EditTickerView';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import gicsData from '@/gicsData/gicsData.json';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';

export default async function Page() {
  // const EditTickerViewNoSSR = dynamic(() => import('@/components/ticker/EditTickerView'), { ssr: false });
  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: `New Ticker`,
      href: `/public-equities/ticker/create`,
      current: true,
    },
  ];
  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <SingleCardLayout>
        <EditTickerView gicsData={gicsData} />
      </SingleCardLayout>
    </PageWrapper>
  );
}
