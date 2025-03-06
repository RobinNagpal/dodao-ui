import SingleCardLayout from '@/layouts/SingleCardLayout';
import EditTickerView from './EditTickerView';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import gicsData from '@/gicsData/gicsData.json';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';

export default async function Page({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
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
