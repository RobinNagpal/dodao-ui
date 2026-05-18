import { ReactNode } from 'react';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import EtfFiltersButton from '@/components/etfs/EtfFiltersButton';
import EtfAppliedFilterChips from '@/components/etfs/EtfAppliedFilterChips';
import EtfCountryAlternatives from '@/components/etfs/EtfCountryAlternatives';
import EtfListingSidebar from '@/components/etfs/EtfListingSidebar';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { EtfBrowseSection, etfBasePath, etfCountryDisplayName } from '@/utils/etf-country-route-utils';
import { generateBreadcrumbJsonLdFromCrumbs } from '@/utils/etf-metadata-generators';

interface EtfPageLayoutProps {
  title: string;
  description: string;
  showAppliedFilters?: boolean;
  extraBreadcrumbs?: BreadcrumbsOjbect[];
  currentCountry?: EtfSupportedCountry;
  switcherSection?: EtfBrowseSection;
  children: ReactNode;
}

function buildBreadcrumbs(currentCountry: EtfSupportedCountry, extraBreadcrumbs?: BreadcrumbsOjbect[]): BreadcrumbsOjbect[] {
  const rootName = `${etfCountryDisplayName(currentCountry)} ETFs`;
  const rootHref = etfBasePath(currentCountry);
  if (!extraBreadcrumbs || extraBreadcrumbs.length === 0) {
    return [{ name: rootName, href: rootHref, current: true }];
  }
  return [{ name: rootName, href: rootHref, current: false }, ...extraBreadcrumbs];
}

export default function EtfPageLayout({
  title,
  description,
  showAppliedFilters = false,
  extraBreadcrumbs,
  currentCountry = SupportedCountries.US,
  switcherSection,
  children,
}: EtfPageLayoutProps) {
  const breadcrumbs = buildBreadcrumbs(currentCountry, extraBreadcrumbs);

  const breadcrumbJsonLd = generateBreadcrumbJsonLdFromCrumbs(breadcrumbs);

  return (
    <PageWrapper>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        <aside className="hidden lg:block w-64 shrink-0 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <EtfListingSidebar country={currentCountry} />
        </aside>
        <div className="flex-1 min-w-0">
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
            <div className="mt-2 mb-2">
              <EtfCountryAlternatives currentCountry={currentCountry} section={switcherSection} className="text-sm" />
            </div>
          </div>

          {children}
        </div>
      </div>
    </PageWrapper>
  );
}
