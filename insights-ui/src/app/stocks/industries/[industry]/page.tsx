import IndustryStocksGrid from '@/components/stocks/IndustryStocksGrid';
import StocksPageLayout from '@/components/stocks/StocksPageLayout';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { fetchIndustryStocksData } from '@/utils/stocks-data-utils';
import { generateIndustryStocksMetadata, commonViewport } from '@/utils/metadata-generators';
import type { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import type { Metadata } from 'next';

export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = 86400; // 24 hours

// ────────────────────────────────────────────────────────────────────────────────
// Metadata

export async function generateMetadata(props: { params: Promise<{ industry: string }> }): Promise<Metadata> {
  const { industry } = await props.params;
  const industryKey = decodeURIComponent(industry);
  return generateIndustryStocksMetadata(industryKey);
}

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

  // Fetch data using the cached function (no filters on static pages)
  const data = await fetchIndustryStocksData(industryKey, SupportedCountries.US, {});

  const breadcrumbs: BreadcrumbsOjbect[] = [
    { name: 'US Stocks', href: `/stocks`, current: false },
    { name: data?.name || industryKey, href: `/stocks/industries/${encodeURIComponent(industryKey)}`, current: true },
  ];

  return (
    <StocksPageLayout
      breadcrumbs={breadcrumbs}
      title={`${data?.name || industryKey} Stocks`}
      description={`Explore ${data?.name || industryKey} companies listed on US exchanges (NASDAQ, NYSE, AMEX). ${
        data?.summary || 'View detailed reports and AI-driven insights.'
      }`}
      currentCountry="US"
      industryKey={industryKey}
    >
      {!data ? (
        <>
          <p className="text-[#E5E7EB] text-lg">{`No ${industryKey} stocks found.`}</p>
          <p className="text-[#E5E7EB] text-sm mt-2">Please try again later.</p>
        </>
      ) : (
        <IndustryStocksGrid data={data} industryName={data?.name || industryKey} />
      )}
    </StocksPageLayout>
  );
}
