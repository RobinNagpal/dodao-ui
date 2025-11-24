import IndustryStocksGrid from '@/components/stocks/IndustryStocksGrid';
import IndustryWithStocksPageLayout from '@/components/stocks/IndustryWithStocksPageLayout';
import { SubIndustriesResponse } from '@/types/api/ticker-industries';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { commonViewport, generateCountryIndustryStocksMetadata } from '@/utils/metadata-generators';
import { getIndustryPageTag } from '@/utils/ticker-v1-cache-utils';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import type { Metadata } from 'next';

export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = 86400; // 24 hours

// ────────────────────────────────────────────────────────────────────────────────
// Metadata

export async function generateMetadata(props: { params: Promise<{ industry: string }> }): Promise<Metadata> {
  const { industry } = await props.params;
  const industryKey = decodeURIComponent(industry);
  return generateCountryIndustryStocksMetadata('US', industryKey);
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
  const industryKey = decodeURIComponent(resolvedParams.industry);

  const baseUrl = getBaseUrl();
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
