import IndustryStocksGrid from '@/components/stocks/IndustryStocksGrid';
import IndustryWithStocksPageLayout from '@/components/stocks/IndustryWithStocksPageLayout';
import { SubIndustriesResponse } from '@/types/api/ticker-industries';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { commonViewport, generateCountryIndustryStocksMetadata } from '@/utils/metadata-generators';
import { getIndustryPageTag } from '@/utils/ticker-v1-cache-utils';
import { Metadata } from 'next';

export async function generateMetadata(props: { params: Promise<{ country: string; industry: string }> }): Promise<Metadata> {
  const params = await props.params;
  const countryName = decodeURIComponent(params.country);
  const industryKey = decodeURIComponent(params.industry);
  return generateCountryIndustryStocksMetadata(countryName, industryKey);
}

const WEEK = 60 * 60 * 24 * 7;

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

  const baseUrl = getBaseUrlForServerSidePages();
  const baseUrlPath = `${baseUrl}/api/${KoalaGainsSpaceId}/tickers-v1/country/${country}/tickers/industries/${industryKey}`;

  const res = await fetch(baseUrlPath, {
    next: { revalidate: WEEK, tags: [getIndustryPageTag(country, industryKey)] },
  });

  const data = (await res.json()) as SubIndustriesResponse | null;

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
