import IndustryWithStocksPageLayout from '@/components/stocks/IndustryWithStocksPageLayout';
import IndustryStocksGrid from '@/components/stocks/IndustryStocksGrid';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { fetchIndustryStocksData, type SearchParams } from '@/utils/stocks-data-utils';
import { generateCountryIndustryStocksMetadata, commonViewport } from '@/utils/metadata-generators';
import { Metadata } from 'next';

// Dynamic page for filtered results
export const dynamic = 'force-dynamic';

export async function generateMetadata(props: { params: Promise<{ country: string; industry: string }> }): Promise<Metadata> {
  const params = await props.params;
  const countryName = decodeURIComponent(params.country);
  const industryKey = decodeURIComponent(params.industry);
  return generateCountryIndustryStocksMetadata(countryName, industryKey);
}

// Add viewport meta tag if not already in your _document.js or layout component
export const viewport = commonViewport;

type PageProps = {
  params: Promise<{ country: string; industry: string }>;
  searchParams: Promise<SearchParams>;
};

export default async function CountryIndustryStocksFilteredPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const countryName = decodeURIComponent(resolvedParams.country);
  const industryKey = decodeURIComponent(resolvedParams.industry);
  const resolvedSearchParams = await searchParams;

  const country = countryName as SupportedCountries;

  const data = await fetchIndustryStocksData(industryKey, country, resolvedSearchParams);
  const industryName = data?.name || industryKey;

  return (
    <IndustryWithStocksPageLayout
      title={`${industryName} Stocks in ${countryName}`}
      description={`Explore ${industryName} companies in ${countryName}. ${data?.summary || 'View detailed reports and AI-driven insights.'}`}
      currentCountry={countryName}
      industryKey={industryKey}
      industryName={data?.name}
      showAppliedFilters={true}
    >
      <IndustryStocksGrid data={data} industryName={industryName} />
    </IndustryWithStocksPageLayout>
  );
}
