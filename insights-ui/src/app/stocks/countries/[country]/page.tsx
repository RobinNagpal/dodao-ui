import AllStocksGridForCountry from '@/components/stocks/AllStocksGridForCountry';
import CountryIndustriesGrid from '@/components/stocks/CountryIndustriesGrid';
import IndustryWithStocksPageLayout from '@/components/stocks/IndustryWithStocksPageLayout';
import { IndustriesResponse } from '@/types/api/ticker-industries';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { TickerWithIndustryNames } from '@/types/ticker-typesv1';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { generateCountryStocksMetadata } from '@/utils/metadata-generators';
import { parseStockCountryParam, resolveStockCountryParam } from '@/utils/stock-country-route-utils';
import { getStocksPageTag } from '@/utils/ticker-v1-cache-utils';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export async function generateMetadata(props: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const params = await props.params;
  // Validate without logging/404ing here: the page render does both, so an invalid country
  // produces exactly one warn line.
  const country = parseStockCountryParam(params.country);
  if (!country) return {};
  return generateCountryStocksMetadata(country);
}

type PageProps = {
  params: Promise<{ country: string }>;
};

const WEEK = 60 * 60 * 24 * 7;

export default async function CountryStocksPage({ params: paramsPromise }: PageProps) {
  const params = await paramsPromise;
  const baseUrl = getBaseUrlForServerSidePages();
  const country: SupportedCountries = resolveStockCountryParam(params.country, 'stocks/countries/[country]');
  const countryName: string = country;

  // Fetch data using the cached function (no filters on static pages)
  const url = `${baseUrl}/api/${KoalaGainsSpaceId}/tickers-v1/country/${country}/tickers/industries`;
  const res = await fetch(url, {
    next: { revalidate: WEEK, tags: [getStocksPageTag(country)] },
  });

  if (res.status === 404) notFound();
  if (!res.ok) {
    // Real upstream failure (e.g. 5xx / LB error page): stay an error. Next's data cache only
    // stores OK responses, so this is never cached as a page.
    throw new Error(`industries fetch failed (${res.status}): ${url}`);
  }

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
