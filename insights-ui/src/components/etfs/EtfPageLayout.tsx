import { ReactNode } from 'react';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import EtfFiltersButton from '@/components/etfs/EtfFiltersButton';
import EtfSortButton from '@/components/etfs/EtfSortButton';
import EtfListingPageActions from '@/components/etfs/EtfListingPageActions';
import EtfAppliedFilterChips from '@/components/etfs/EtfAppliedFilterChips';
import EtfCountryAlternatives from '@/components/etfs/EtfCountryAlternatives';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { EtfBrowseSection, etfBasePath, etfCountryDisplayName } from '@/utils/etf-country-route-utils';
import { generateBreadcrumbJsonLdFromCrumbs } from '@/utils/etf-metadata-generators';
import type { EtfListingCacheTag } from '@/utils/etf-cache-utils';

interface EtfPageLayoutProps {
  title: string;
  description: string;
  showAppliedFilters?: boolean;
  extraBreadcrumbs?: BreadcrumbsOjbect[];
  currentCountry?: EtfSupportedCountry;
  switcherSection?: EtfBrowseSection;
  /** Builds the country-switcher href for a given country; lets detail pages keep the active listing when switching countries. */
  switcherHref?: (country: EtfSupportedCountry) => string;
  /** Next.js Data Cache tag backing this listing surface, for the admin "Revalidate This Listing" action. Omitted on uncached filter-detail pages (CloudFront-only purge). */
  revalidateTag?: EtfListingCacheTag;
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
  showAppliedFilters = true,
  extraBreadcrumbs,
  currentCountry = SupportedCountries.US,
  switcherSection,
  switcherHref,
  revalidateTag,
  children,
}: EtfPageLayoutProps) {
  const breadcrumbs = buildBreadcrumbs(currentCountry, extraBreadcrumbs);

  const breadcrumbJsonLd = generateBreadcrumbJsonLdFromCrumbs(breadcrumbs);

  return (
    <PageWrapper>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <div className="overflow-x-auto">
        {/*
          On mobile keep the breadcrumb and the Filters + Sort buttons on one
          row. Deeper pages (groups / categories / providers / asset classes)
          collapse the multi-level chain to a single back link; the root pages
          (`/etfs`, `/etfs/countries/{country}`) have a single crumb that stays
          inline. Same behavior as the stocks listing pages.
        */}
        <Breadcrumbs
          breadcrumbs={breadcrumbs}
          mobileBackOnly={true}
          rightButton={
            <div className="flex items-center gap-2">
              <EtfFiltersButton />
              <EtfSortButton />
              <EtfListingPageActions tag={revalidateTag} />
            </div>
          }
        />
      </div>

      {showAppliedFilters && <EtfAppliedFilterChips showClearAll={true} />}

      <div className="w-full mb-8">
        <h1 className="text-2xl font-bold text-white mb-4">{title}</h1>
        <p className="text-[#E5E7EB] text-md mb-4">{description}</p>
        <div className="mt-2 mb-2">
          <EtfCountryAlternatives currentCountry={currentCountry} section={switcherSection} buildHref={switcherHref} className="text-sm" />
        </div>
      </div>

      {children}
    </PageWrapper>
  );
}
