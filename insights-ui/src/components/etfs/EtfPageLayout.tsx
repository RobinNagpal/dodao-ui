import { ReactNode } from 'react';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import EtfFiltersButton from '@/components/etfs/EtfFiltersButton';
import EtfAppliedFilterChips from '@/components/etfs/EtfAppliedFilterChips';

interface EtfPageLayoutProps {
  title: string;
  description: string;
  showAppliedFilters?: boolean;
  extraBreadcrumbs?: BreadcrumbsOjbect[];
  children: ReactNode;
}

function buildBreadcrumbs(extraBreadcrumbs?: BreadcrumbsOjbect[]): BreadcrumbsOjbect[] {
  if (!extraBreadcrumbs || extraBreadcrumbs.length === 0) {
    return [{ name: 'US ETFs', href: '/etfs', current: true }];
  }
  const rootCrumb: BreadcrumbsOjbect = { name: 'US ETFs', href: '/etfs', current: false };
  return [rootCrumb, ...extraBreadcrumbs];
}

export default function EtfPageLayout({ title, description, showAppliedFilters = false, extraBreadcrumbs, children }: EtfPageLayoutProps) {
  const breadcrumbs = buildBreadcrumbs(extraBreadcrumbs);

  return (
    <PageWrapper>
      <div className="overflow-x-auto">
        <Breadcrumbs
          breadcrumbs={breadcrumbs}
          rightButton={
            <div className="flex">
              <EtfFiltersButton />
            </div>
          }
        />
      </div>

      {showAppliedFilters && <EtfAppliedFilterChips showClearAll={true} />}

      <div className="w-full mb-8">
        <h1 className="text-2xl font-bold text-white mb-4">{title}</h1>
        <p className="text-[#E5E7EB] text-md mb-4">{description}</p>
      </div>

      {children}
    </PageWrapper>
  );
}
