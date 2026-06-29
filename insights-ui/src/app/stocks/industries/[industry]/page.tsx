import IndustryStocksGrid from '@/components/stocks/IndustryStocksGrid';
import IndustryWithStocksPageLayout from '@/components/stocks/IndustryWithStocksPageLayout';
import { SubIndustriesResponse } from '@/types/api/ticker-industries';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { commonViewport, generateCountryIndustryStocksMetadata } from '@/utils/metadata-generators';
import { fetchIndustryStocksData, isIndustryStocksResponseEmpty } from '@/utils/stocks-data-utils';
import { getIndustryPageTag } from '@/utils/ticker-v1-cache-utils';
import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

// ────────────────────────────────────────────────────────────────────────────────
// Metadata

export async function generateMetadata(props: { params: Promise<{ industry: string }> }): Promise<Metadata> {
  const { industry } = await props.params;
  const industryKey = decodeURIComponent(industry);

  // noindex empty industry listings (thin content → soft 404 in Google Search Console).
  const data = await fetchIndustryStocksData(industryKey.toUpperCase(), SupportedCountries.US, {});
  return generateCountryIndustryStocksMetadata('US', industryKey, { noIndex: isIndustryStocksResponseEmpty(data) });
}

const WEEK = 60 * 60 * 24 * 7;

export const viewport = commonViewport;

// ────────────────────────────────────────────────────────────────────────────────
// Types

type PageProps = {
  params: Promise<{ industry: string }>;
};

// ────────────────────────────────────────────────────────────────────────────────
// Page

export default async function IndustryStocksPage({ params }: PageProps) {
  const resolvedParams = await params;
  const rawIndustryKey = decodeURIComponent(resolvedParams.industry);
  const industryKey = rawIndustryKey.toUpperCase();

  // Redirect lowercase/mixed-case URLs to the canonical uppercase URL
  if (rawIndustryKey !== industryKey) {
    permanentRedirect(`/stocks/industries/${industryKey}`);
  }

  const baseUrl = getBaseUrlForServerSidePages();
  const baseUrlPath = `${baseUrl}/api/${KoalaGainsSpaceId}/tickers-v1/country/${SupportedCountries.US}/tickers/industries/${industryKey}`;

  const res = await fetch(baseUrlPath, {
    next: { revalidate: WEEK, tags: [getIndustryPageTag(SupportedCountries.US, industryKey)] },
  });

  const data = (await res.json()) as SubIndustriesResponse | null;

  return (
    <IndustryWithStocksPageLayout
      title={`${data?.name || industryKey} Stocks`}
      description={`Explore ${data?.name || industryKey} companies listed on US exchanges (NASDAQ, NYSE, AMEX). ${
        data?.summary || 'View detailed reports and AI-driven insights.'
      }`}
      currentCountry="US"
      industryKey={industryKey}
      industryName={data?.name}
      hasAnalysis={data?.hasAnalysis}
    >
      {!data ? (
        <>
          <p className="text-[#E5E7EB] text-lg">{`No ${industryKey} stocks found.`}</p>
          <p className="text-[#E5E7EB] text-sm mt-2">Please try again later.</p>
        </>
      ) : (
        <IndustryStocksGrid data={data} industryName={data?.name || industryKey} />
      )}
    </IndustryWithStocksPageLayout>
  );
}
