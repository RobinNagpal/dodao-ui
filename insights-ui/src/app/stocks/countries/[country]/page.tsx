import AllStocksGridForCountry from '@/components/stocks/AllStocksGridForCountry';
import CountryIndustriesGrid from '@/components/stocks/CountryIndustriesGrid';
import IndustryWithStocksPageLayout from '@/components/stocks/IndustryWithStocksPageLayout';
import { IndustriesResponse } from '@/types/api/ticker-industries';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { TickerWithIndustryNames } from '@/types/ticker-typesv1';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { generateCountryStocksMetadata } from '@/utils/metadata-generators';
import { getStocksPageTag } from '@/utils/ticker-v1-cache-utils';
import type { Metadata } from 'next';

export async function generateMetadata(props: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const params = await props.params;
  const countryName = decodeURIComponent(params.country);
  return generateCountryStocksMetadata(countryName);
}

type PageProps = {
  params: Promise<{ country: string }>;
};

const WEEK = 60 * 60 * 24 * 7;

export default async function CountryStocksPage({ params: paramsPromise }: PageProps) {
  const params = await paramsPromise;
  const baseUrl = getBaseUrlForServerSidePages();
  const countryName = decodeURIComponent(params.country);
  const country = countryName as SupportedCountries;

  // Fetch data using the cached function (no filters on static pages)
  const res = await fetch(`${baseUrl}/api/${KoalaGainsSpaceId}/tickers-v1/country/${SupportedCountries.US}/tickers/industries`, {
    next: { revalidate: WEEK, tags: [getStocksPageTag(SupportedCountries.US)] },
  });

  const data = (await res.json()) as IndustriesResponse;

  // For Pakistan, show all stocks in a flat list instead of organized by industries
  if (country === SupportedCountries.Pakistan) {
    // Flatten all stocks from all industries and attach industry information
    const allStocks: TickerWithIndustryNames[] = data.industries.flatMap((industry) =>
      industry.subIndustries.flatMap((subIndustry) =>
        subIndustry.topTickers.map(
          (ticker) =>
            ({
              ...ticker,
              industryName: industry.name,
              subIndustryName: subIndustry.name,
            } as TickerWithIndustryNames)
        )
      )
    );

    return (
      <IndustryWithStocksPageLayout
        title={`${countryName} Stocks`}
        description={`Explore top 100 performing ${countryName} stocks with detailed financial reports and AI-driven analysis.`}
        currentCountry={countryName}
      >
        <AllStocksGridForCountry stocks={allStocks} countryName={countryName} />
      </IndustryWithStocksPageLayout>
    );
  }

  return (
    <IndustryWithStocksPageLayout
      title={`${countryName} Stocks by Industry`}
      description={`Explore ${countryName} stocks organized by industry. View top-performing companies in each sector with detailed financial reports and AI-driven analysis.`}
      currentCountry={countryName}
    >
      <CountryIndustriesGrid data={data} countryName={countryName} />
    </IndustryWithStocksPageLayout>
  );
}
