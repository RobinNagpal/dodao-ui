import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import IndustryWithStocksPageLayout from '@/components/stocks/IndustryWithStocksPageLayout';
import WithSuspenseCountryIndustriesGrid from '@/components/stocks/WithSuspenseCountryIndustriesGrid';
import AllStocksGridForCountry from '@/components/stocks/AllStocksGridForCountry';
import { KoalaGainsSession } from '@/types/auth';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { generateCountryStocksMetadata } from '@/utils/metadata-generators';
import { fetchStocksData, type SearchParams } from '@/utils/stocks-data-utils';
import { TickerWithIndustryNames } from '@/types/ticker-typesv1';
import { getServerSession } from 'next-auth';
import type { Metadata } from 'next';

// Dynamic page for filtered results
export const dynamic = 'force-dynamic';

export async function generateMetadata(props: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const params = await props.params;
  const countryName = decodeURIComponent(params.country);
  return generateCountryStocksMetadata(countryName);
}

type PageProps = {
  params: Promise<{ country: string }>;
  searchParams: Promise<SearchParams>;
};

export default async function CountryStocksFilteredPage({ params: paramsPromise, searchParams: searchParamsPromise }: PageProps) {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  const session = (await getServerSession(authOptions)) as KoalaGainsSession | undefined;

  const countryName = decodeURIComponent(params.country);
  const country = countryName as SupportedCountries;

  // For Pakistan, show all stocks in a flat list instead of organized by industries
  if (country === SupportedCountries.Pakistan) {
    // Create a data promise for Suspense
    const dataPromise = (async () => {
      const data = await fetchStocksData(country, searchParams);
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
      return allStocks;
    })();

    return (
      <IndustryWithStocksPageLayout
        title={`${countryName} Stocks`}
        description={`Explore top 100 performing ${countryName} stocks with detailed financial reports and AI-driven analysis.`}
        currentCountry={countryName}
        session={session}
        showAppliedFilters={true}
      >
        <AllStocksGridForCountry stocksPromise={dataPromise} countryName={countryName} />
      </IndustryWithStocksPageLayout>
    );
  }

  // Create a data promise for Suspense
  const dataPromise = (async () => {
    return fetchStocksData(country, searchParams);
  })();

  return (
    <IndustryWithStocksPageLayout
      title={`${countryName} Stocks by Industry`}
      description={`Explore ${countryName} stocks organized by industry. View top-performing companies in each sector with detailed financial reports and AI-driven analysis.`}
      currentCountry={countryName}
      session={session}
      showAppliedFilters={true}
    >
      <WithSuspenseCountryIndustriesGrid dataPromise={dataPromise} countryName={countryName} />
    </IndustryWithStocksPageLayout>
  );
}
