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

// Layout modes — pure-CSS responsive (no JS toggle), so there's no CLS / no SEO penalty.
//
// • 1024px–1699px: in-flow flex. Sidebar (w-52) sits flush against the viewport's
//   left edge (no left padding, no left rounding/border so it reads as attached).
//   PageWrapper's max-w-7xl shrinks within the remaining flex slot — content sits
//   slightly right of the original centered position.
//
// • ≥1700px: outer becomes `display: block`, sidebar switches to `position: fixed`
//   inside the left margin (`left: max(1rem, calc(50vw - 832px))`), so it leaves
//   the flow entirely and the content goes back to its original max-w-7xl mx-auto
//   centered position — breadcrumb is exactly where it used to be.
//
// • Below 1024px: sidebar is `display: none` (mobile/tablet unaffected).
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
    <div className="lg:flex lg:items-start lg:gap-2 min-[1700px]:block">
      <aside className="hidden lg:block w-52 shrink-0 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto border border-white/10 bg-white/[0.02] p-3 rounded-r-lg min-[1700px]:rounded-lg min-[1700px]:fixed min-[1700px]:left-[max(1rem,calc(50vw-832px))] min-[1700px]:top-24 min-[1700px]:max-h-[calc(100vh-7rem)]">
        <EtfListingSidebar country={currentCountry} />
      </aside>
      <div className="lg:flex-1 lg:min-w-0">
        <PageWrapper>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
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
        </PageWrapper>
      </div>
    </div>
  );
}
