import EditPublicEquityView from '@/components/projects/EditPublicEquityView';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import gicsData from '@/gicsData/gicsData.json';

export default async function Page({ params }: { params: Promise<{ projectId: string }> }) {
  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: `Industry Group Criterias`,
      href: `/`,
      current: true,
    },
  ];
  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <EditPublicEquityView gicsData={gicsData} />
    </PageWrapper>
  );
}
