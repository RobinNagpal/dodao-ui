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

// PageWrapper centers content at max-w-7xl (1280px). On screens wide enough to
// host a sidebar in the left margin without pushing the content, we fixed-position
// the sidebar there so the breadcrumb / cards keep their original width.
//
// Math (w-52 = 208px sidebar, 16px gap to content): the sidebar fits beside the
// centered content when viewport ≥ 1696px (≈ 1700px breakpoint chosen for safety).
// `left: max(1rem, calc(50vw - 832px))` keeps the sidebar pinned 16px to the left
// of the content area at every viewport ≥ that breakpoint, gracefully approaching
// the viewport's left edge as it narrows.
const SIDEBAR_LEFT_STYLE: React.CSSProperties = { left: 'max(1rem, calc(50vw - 832px))' };

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
    <>
      <aside
        style={SIDEBAR_LEFT_STYLE}
        className="hidden min-[1700px]:block fixed top-24 w-52 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-lg border border-white/10 bg-white/[0.02] p-3 z-10"
      >
        <EtfListingSidebar country={currentCountry} />
      </aside>
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
    </>
  );
}
