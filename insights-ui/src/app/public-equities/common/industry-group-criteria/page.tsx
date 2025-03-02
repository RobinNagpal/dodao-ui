import GicsIndustryGroupCriterias from '@/components/criteria/GicsIndustryGroupCriterias';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';

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
      <GicsIndustryGroupCriterias />
    </PageWrapper>
  );
}
