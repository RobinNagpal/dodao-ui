import CriteriaTable from '@/components/criteria/CriteriaTable';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';

export default async function CustomCriteriaPage({ params }: { params: Promise<{ sectorSlug: string; industryGroupSlug: string }> }) {
  const { sectorSlug, industryGroupSlug } = await params;

  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: `Industry Group Criteria Table`,
      href: `/public-equities/industry-group-criteria`,
      current: false,
    },
    {
      name: `Create`,
      href: `/public-equities/industry-group-criteria/${sectorSlug}/${industryGroupSlug}/create`,
      current: true,
    },
  ];

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <CriteriaTable sectorSlug={sectorSlug} industryGroupSlug={industryGroupSlug} />
    </PageWrapper>
  );
}
