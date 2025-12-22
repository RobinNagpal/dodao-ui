import IndustryStocksGrid from '@/components/stocks/IndustryStocksGrid';
import IndustryWithStocksPageLayout from '@/components/stocks/IndustryWithStocksPageLayout';
import { SubIndustriesResponse } from '@/types/api/ticker-industries';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { SupportedCountries, toSupportedCountry } from '@/utils/countryExchangeUtils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';

// ────────────────────────────────────────────────────────────────────────────────
// Types

type PageProps = {
  params: Promise<{ id: string; country: string; industry: string }>;
};

// ────────────────────────────────────────────────────────────────────────────────
// Page

export default async function PortfolioManagerIndustryPage({ params }: PageProps) {
  const resolvedParams = await params;
  const profileId = resolvedParams.id;
  const countryName = decodeURIComponent(resolvedParams.country);
  const industryKey = decodeURIComponent(resolvedParams.industry);

  const country = countryName as SupportedCountries;

  const baseUrl = getBaseUrlForServerSidePages();
  const baseUrlPath = `${baseUrl}/api/${KoalaGainsSpaceId}/tickers-v1/country/${country}/tickers/industries/${industryKey}/${profileId}`;

  const res = await fetch(baseUrlPath);

  const data = (await res.json()) as SubIndustriesResponse | null;

  return (
    <IndustryWithStocksPageLayout
      title={`${data?.name || industryKey} Stocks`}
      description={`Explore ${data?.name || industryKey} companies in ${countryName}. ${data?.summary || 'View detailed reports and AI-driven insights.'}`}
      currentCountry={country}
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
