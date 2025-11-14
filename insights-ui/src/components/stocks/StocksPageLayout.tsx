import { ReactNode } from 'react';
import { KoalaGainsSession } from '@/types/auth';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import FiltersButton from '@/components/stocks/filters/FiltersButton';
import StocksGridPageActions from '@/app/stocks/StocksGridPageActions';
import CountryAlternatives from '@/components/stocks/CountryAlternatives';
import AppliedFilterChips from '@/components/stocks/filters/AppliedFilterChips';

interface StocksPageLayoutProps {
  breadcrumbs: BreadcrumbsOjbect[];
  title: string;
  description: string;
  currentCountry: string;
  industryKey?: string;
  session?: KoalaGainsSession | undefined;
  showAppliedFilters?: boolean;
  children: ReactNode;
}

export default function StocksPageLayout({
  breadcrumbs,
  title,
  description,
  currentCountry,
  industryKey,
  session,
  showAppliedFilters = false,
  children,
}: StocksPageLayoutProps) {
  return (
    <PageWrapper>
      <div className="overflow-x-auto">
        <Breadcrumbs
          breadcrumbs={breadcrumbs}
          rightButton={
            <div className="flex">
              <FiltersButton />
              <StocksGridPageActions session={session} />
            </div>
          }
        />
      </div>

      {showAppliedFilters && <AppliedFilterChips showClearAll={true} />}

      <div className="w-full mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
          <h1 className="text-2xl font-bold text-white mb-2 sm:mb-0">{title}</h1>
          <CountryAlternatives currentCountry={currentCountry} industryKey={industryKey} className="flex-shrink-0" />
        </div>
        <p className="text-[#E5E7EB] text-md mb-4">{description}</p>
      </div>

      {children}
    </PageWrapper>
  );
}
