import IndustryStocksGrid from '@/components/stocks/IndustryStocksGrid';
import IndustryWithStocksPageLayout from '@/components/stocks/IndustryWithStocksPageLayout';
import { SubIndustriesResponse } from '@/types/api/ticker-industries';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { commonViewport, generateCountryIndustryStocksMetadata } from '@/utils/metadata-generators';
import { fetchIndustryStocksData, isIndustryStocksResponseEmpty } from '@/utils/stocks-data-utils';
import { parseStockCountryParam, resolveStockCountryParam } from '@/utils/stock-country-route-utils';
import { getIndustryPageTag } from '@/utils/ticker-v1-cache-utils';
import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { truncateForLog } from '@/utils/route-param-utils';
import { COUNTRY_INDUSTRY_ROUTE, getCountryIndustryPath, parseIndustryKeyParam } from './industry-route-utils';

export async function generateMetadata(props: { params: Promise<{ country: string; industry: string }> }): Promise<Metadata> {
  const params = await props.params;
  // Validate without logging/404ing here: the page render does both, so invalid input produces
  // exactly one warn line.
  const country = parseStockCountryParam(params.country);
  const industryKey = parseIndustryKeyParam(params.industry);
  if (!country || !industryKey) return {};

  // noindex empty industry listings (thin content → soft 404 in Google Search Console).
  const data = await fetchIndustryStocksData(industryKey.toUpperCase(), country, {});
  return generateCountryIndustryStocksMetadata(country, industryKey, { noIndex: isIndustryStocksResponseEmpty(data) });
}

const WEEK = 60 * 60 * 24 * 7;

// Add viewport meta tag if not already in your _document.js or layout component
export const viewport = commonViewport;

type PageProps = {
  params: Promise<{ country: string; industry: string }>;
};

export default async function CountryIndustryStocksPage({ params }: PageProps) {
  const resolvedParams = await params;
  const country: SupportedCountries = resolveStockCountryParam(resolvedParams.country, COUNTRY_INDUSTRY_ROUTE);

  const rawIndustryKey = parseIndustryKeyParam(resolvedParams.industry);
  if (!rawIndustryKey) {
    console.warn(`[${COUNTRY_INDUSTRY_ROUTE}] invalid industry param, returning 404: ${truncateForLog(resolvedParams.industry)}`);
    notFound();
  }
  const industryKey = rawIndustryKey.toUpperCase();

  const baseUrl = getBaseUrlForServerSidePages();
  const url = `${baseUrl}/api/${KoalaGainsSpaceId}/tickers-v1/country/${encodeURIComponent(country)}/tickers/industries/${encodeURIComponent(industryKey)}`;

  const res = await fetch(url, {
    next: { revalidate: WEEK, tags: [getIndustryPageTag(country, industryKey)] },
  });

  if (!res.ok) {
    // Real upstream failure (5xx / LB error page): stay an error. Next's data cache only stores OK
    // responses, so this is never cached as a page.
    throw new Error(`industry stocks fetch failed (${res.status}): ${url}`);
  }

  const data = (await res.json()) as SubIndustriesResponse | null;

  // Unknown industry: the API answers HTTP 200 with a null body → real 404 (sibling not-found.tsx).
  if (!data) {
    console.warn(`[${COUNTRY_INDUSTRY_ROUTE}] unknown industry key, returning 404: ${truncateForLog(industryKey)}`);
    notFound();
  }

  // Confirmed-empty listing → real 404 instead of a soft 404.
  if (isIndustryStocksResponseEmpty(data)) notFound();

  // Redirect lowercase/mixed-case URLs to the canonical uppercase URL. Only done once the industry is
  // confirmed to exist, and built from the validated country + DB key (URI-encoded), never raw input.
  if (rawIndustryKey !== industryKey) {
    permanentRedirect(getCountryIndustryPath(country, data.industryKey));
  }

  return (
    <IndustryWithStocksPageLayout
      title={`${data.name || industryKey} Stocks in ${country}`}
      description={`Explore ${data.name || industryKey} companies in ${country}. ${data.summary || 'View detailed reports and AI-driven insights.'}`}
      currentCountry={country}
      industryKey={industryKey}
      industryName={data.name}
      hasAnalysis={data.hasAnalysis}
      countriesWithStocks={data.countriesWithStocks}
    >
      <IndustryStocksGrid data={data} industryName={data.name || industryKey} />
    </IndustryWithStocksPageLayout>
  );
}
