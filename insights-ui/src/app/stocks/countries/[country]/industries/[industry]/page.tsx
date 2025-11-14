import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import IndustryStocksGrid from '@/components/stocks/IndustryStocksGrid';
import StocksPageLayout from '@/components/stocks/StocksPageLayout';
import { KoalaGainsSession } from '@/types/auth';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { fetchIndustryStocksData } from '@/utils/stocks-data-utils';
import { generateCountryIndustryStocksMetadata, commonViewport } from '@/utils/metadata-generators';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { TickerV1Industry } from '@prisma/client';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';

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
  const session = (await getServerSession(authOptions)) as KoalaGainsSession | undefined;

  // Convert countryName to SupportedCountries type
  const country = countryName as SupportedCountries;

  // Fetch data using the cached function (no filters on static pages)
  const data = await fetchIndustryStocksData(industryKey, country, {});

  // Try to get industry data for metadata and display
  let industryData: TickerV1Industry | null = null;
  try {
    const res = await fetch(`${getBaseUrl()}/api/industries/${industryKey}`, { next: { revalidate: 3600 } });
    industryData = (await res.json()) as TickerV1Industry;
  } catch {
    // fallback will be handled below
  }

  const breadcrumbs: BreadcrumbsOjbect[] = [
    { name: `${countryName} Stocks`, href: `/stocks/countries/${encodeURIComponent(countryName)}`, current: false },
    {
      name: data?.name || industryData?.name || industryKey,
      href: `/stocks/countries/${encodeURIComponent(countryName)}/industries/${encodeURIComponent(industryKey)}`,
      current: true,
    },
  ];

  return (
    <StocksPageLayout
      breadcrumbs={breadcrumbs}
      title={`${data?.name || industryData?.name || industryKey} Stocks in ${countryName}`}
      description={`Explore ${data?.name || industryData?.name || industryKey} companies in ${countryName}. ${
        data?.summary || industryData?.summary || 'View detailed reports and AI-driven insights.'
      }`}
      currentCountry={countryName}
      industryKey={industryKey}
      session={session}
    >
      {!data ? (
        <>
          <p className="text-[#E5E7EB] text-lg">{`No ${industryKey} stocks found in ${countryName}.`}</p>
          <p className="text-[#E5E7EB] text-sm mt-2">Please try again later.</p>
        </>
      ) : (
        <IndustryStocksGrid data={data} industryName={data?.name || industryData?.name || industryKey} />
      )}
    </StocksPageLayout>
  );
}
