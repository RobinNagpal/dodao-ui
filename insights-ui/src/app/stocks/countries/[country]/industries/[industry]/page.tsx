import IndustryStocksGrid from '@/components/stocks/IndustryStocksGrid';
import IndustryWithStocksPageLayout from '@/components/stocks/IndustryWithStocksPageLayout';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { fetchIndustryStocksData } from '@/utils/stocks-data-utils';
import { generateCountryIndustryStocksMetadata, commonViewport } from '@/utils/metadata-generators';
import { Metadata } from 'next';

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
};

export default async function CountryIndustryStocksPage({ params }: PageProps) {
  const resolvedParams = await params;
  const countryName = decodeURIComponent(resolvedParams.country);
  const industryKey = decodeURIComponent(resolvedParams.industry);

  // Convert countryName to SupportedCountries type
  const country = countryName as SupportedCountries;

  // Fetch data using the cached function (no filters on static pages)
  const data = await fetchIndustryStocksData(industryKey, country);

  return (
    <IndustryWithStocksPageLayout
      title={`${data?.name || industryKey} Stocks in ${countryName}`}
      description={`Explore ${data?.name || industryKey} companies in ${countryName}. ${data?.summary || 'View detailed reports and AI-driven insights.'}`}
      currentCountry={countryName}
      industryKey={industryKey}
      industryName={data?.name}
    >
      {!data ? (
        <>
          <p className="text-[#E5E7EB] text-lg">{`No ${industryKey} stocks found in ${countryName}.`}</p>
          <p className="text-[#E5E7EB] text-sm mt-2">Please try again later.</p>
        </>
      ) : (
        <IndustryStocksGrid data={data} industryName={data?.name || industryKey} />
      )}
    </IndustryWithStocksPageLayout>
  );
}
