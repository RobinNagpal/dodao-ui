import StocksPageLayout from '@/components/stocks/StocksPageLayout';
import WithSuspenseIndustryStocksGrid from '@/components/stocks/WithSuspenseIndustryStocksGrid';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { fetchIndustryStocksData, type SearchParams } from '@/utils/stocks-data-utils';
import { generateIndustryStocksMetadata, commonViewport } from '@/utils/metadata-generators';
import type { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import type { TickerV1Industry } from '@prisma/client';
import type { Metadata } from 'next';

// Dynamic page for filtered results
export const dynamic = 'force-dynamic';

// ────────────────────────────────────────────────────────────────────────────────
// Metadata

export async function generateMetadata(props: { params: Promise<{ industry: string }> }): Promise<Metadata> {
  const { industry } = await props.params;
  const industryKey = decodeURIComponent(industry);
  return generateIndustryStocksMetadata(industryKey);
}

export const viewport = commonViewport;

// ────────────────────────────────────────────────────────────────────────────────
// Types

type PageProps = {
  params: Promise<{ industry: string }>;
  searchParams: Promise<SearchParams>;
};

// ────────────────────────────────────────────────────────────────────────────────
// Page

export default async function IndustryStocksFilteredPage({ params, searchParams }: PageProps) {
  // Resolve params now because we need the key for filtering inside the data promise
  const resolvedParams = await params;
  const industryKey = decodeURIComponent(resolvedParams.industry);
  const resolvedSearchParams = await searchParams;

  // Create a data promise for Suspense
  const dataPromise = (async () => {
    return fetchIndustryStocksData(industryKey, SupportedCountries.US, resolvedSearchParams);
  })();

  // Fetch industry data for display
  let industryData: TickerV1Industry | null = null;
  try {
    const res = await fetch(`${getBaseUrl()}/api/industries/${industryKey}`, { next: { revalidate: 3600 } });
    industryData = (await res.json()) as TickerV1Industry;
  } catch {
    // fallback will be handled below
  }

  const breadcrumbs: BreadcrumbsOjbect[] = [
    { name: 'US Stocks', href: `/stocks`, current: false },
    { name: industryData?.name || industryKey, href: `/stocks/industries/${encodeURIComponent(industryKey)}`, current: true },
  ];

  return (
    <StocksPageLayout
      breadcrumbs={breadcrumbs}
      title={`${industryData?.name || industryKey} Stocks`}
      description={`Explore ${industryData?.name || industryKey} companies listed on US exchanges (NASDAQ, NYSE, AMEX). ${
        industryData?.summary || 'View detailed reports and AI-driven insights.'
      }`}
      currentCountry="US"
      industryKey={industryKey}
      showAppliedFilters={true}
    >
      <WithSuspenseIndustryStocksGrid dataPromise={dataPromise} industryName={industryData?.name || industryKey} />
    </StocksPageLayout>
  );
}
