'use client';

import PrivateWrapper from '@/components/auth/PrivateWrapper';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import dynamic from 'next/dynamic';

export default function LookupTablePage() {
  const CriteriaLookupTableWithNoSSR = dynamic(() => import('./CriteriaLookupTable'), { ssr: false });
  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: `Industry Group Criteria Table`,
      href: `/public-equities/common/industry-group-criteria`,
      current: true,
    },
  ];
  return (
    <PageWrapper>
      <PrivateWrapper>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
        <CriteriaLookupTableWithNoSSR />
      </PrivateWrapper>
    </PageWrapper>
  );
}
