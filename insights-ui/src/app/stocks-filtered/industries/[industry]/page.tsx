import IndustryWithStocksPageLayout from '@/components/stocks/IndustryWithStocksPageLayout';
import IndustryStocksGrid from '@/components/stocks/IndustryStocksGrid';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { fetchIndustryStocksData, type SearchParams } from '@/utils/stocks-data-utils';
import { generateCountryIndustryStocksMetadata, commonViewport } from '@/utils/metadata-generators';
import type { Metadata } from 'next';

// Dynamic page for filtered results
export const dynamic = 'force-dynamic';

// ────────────────────────────────────────────────────────────────────────────────
// Metadata

export async function generateMetadata(props: { params: Promise<{ industry: string }> }): Promise<Metadata> {
  const { industry } = await props.params;
  const industryKey = decodeURIComponent(industry);
  return generateCountryIndustryStocksMetadata('US', industryKey);
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
  const resolvedParams = await params;
  const industryKey = decodeURIComponent(resolvedParams.industry);
  const resolvedSearchParams = await searchParams;

  const data = await fetchIndustryStocksData(industryKey, SupportedCountries.US, resolvedSearchParams);
  const industryName = data?.name || industryKey;

  return (
    <IndustryWithStocksPageLayout
      title={`${industryName} Stocks in US`}
      description={`Explore ${industryName} companies in US. ${data?.summary || 'View detailed reports and AI-driven insights.'}`}
      currentCountry="US"
      industryKey={industryKey}
      industryName={data?.name}
      showAppliedFilters={true}
    >
      <IndustryStocksGrid data={data} industryName={industryName} />
    </IndustryWithStocksPageLayout>
  );
}
