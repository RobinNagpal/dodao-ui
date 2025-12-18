import { ReactNode } from 'react';
import Link from 'next/link';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import FiltersButton from '@/components/stocks/filters/FiltersButton';
import StocksGridPageActions from '@/app/stocks/StocksGridPageActions';
import CountryAlternatives from '@/components/stocks/CountryAlternatives';
import AppliedFilterChips from '@/components/stocks/filters/AppliedFilterChips';

interface IndustryWithStocksPageLayoutProps {
  title: string;
  description: string;
  currentCountry: string;
  industryKey?: string;
  industryName?: string;
  showAppliedFilters?: boolean;
  hasAnalysis?: boolean;
  children: ReactNode;
}

/**
 * Builds breadcrumbs based on the current country and optional industry
 */
function buildBreadcrumbs(currentCountry: string, industryKey?: string, industryName?: string): BreadcrumbsOjbect[] {
  const countryName = currentCountry;
  const encodedCountry = encodeURIComponent(countryName);

  if (!industryKey) {
    // Root level: just the country stocks page
    if (countryName === 'US') {
      return [{ name: 'US Stocks', href: '/stocks', current: true }];
    }
    return [{ name: `${countryName} Stocks`, href: `/stocks/countries/${encodedCountry}`, current: true }];
  }

  // Industry level: country -> industry
  const encodedIndustryKey = encodeURIComponent(industryKey);
  const displayIndustryName = industryName || industryKey;

  if (countryName === 'US') {
    return [
      { name: 'US Stocks', href: '/stocks', current: false },
      { name: displayIndustryName, href: `/stocks/industries/${encodedIndustryKey}`, current: true },
    ];
  }

  return [
    { name: `${countryName} Stocks`, href: `/stocks/countries/${encodedCountry}`, current: false },
    { name: displayIndustryName, href: `/stocks/countries/${encodedCountry}/industries/${encodedIndustryKey}`, current: true },
  ];
}

export default function IndustryWithStocksPageLayout({
  title,
  description,
  currentCountry,
  industryKey,
  industryName,
  showAppliedFilters = false,
  hasAnalysis = false,
  children,
}: IndustryWithStocksPageLayoutProps) {
  const breadcrumbs = buildBreadcrumbs(currentCountry, industryKey, industryName);

  return (
    <PageWrapper>
      <div className="overflow-x-auto">
        <Breadcrumbs
          breadcrumbs={breadcrumbs}
          rightButton={
            <div className="flex">
              <FiltersButton />
              <StocksGridPageActions currentCountry={currentCountry} industryKey={industryKey} />
            </div>
          }
        />
      </div>

      {showAppliedFilters && <AppliedFilterChips showClearAll={true} />}

      <div className="w-full mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {industryKey && hasAnalysis && (
            <Link href={`/stocks/industries/${encodeURIComponent(industryKey)}/analysis`} className="link-color hover:underline text-sm whitespace-nowrap">
              View Industry Analysis →
            </Link>
          )}
        </div>
        <p className="text-[#E5E7EB] text-md mb-4">{description}</p>
        <div className="mt-2 mb-2">
          <CountryAlternatives currentCountry={currentCountry} industryKey={industryKey} className="flex-shrink-0 text-sm" enhanced={true} compact={true} />
        </div>
      </div>

      {children}
    </PageWrapper>
  );
}
