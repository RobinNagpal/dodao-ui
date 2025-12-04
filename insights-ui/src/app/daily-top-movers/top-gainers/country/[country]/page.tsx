import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { TopGainerWithTicker } from '@/types/daily-stock-movers';
import { DailyMoverType } from '@/utils/daily-movers-generation-utils';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import StockMoversTable from '@/components/daily-stock-movers/StockMoversTable';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Metadata } from 'next';
import { generateDailyMoversListMetadata, generateCountryMoversBreadcrumbSchema } from '@/utils/metadata-generators';
import { getDailyMoversByCountryTag } from '@/utils/ticker-v1-cache-utils';

interface PageProps {
  params: Promise<{ country: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { country } = await params;
  return generateDailyMoversListMetadata(country, DailyMoverType.GAINER);
}

export default async function DailyTopGainersPage({ params }: PageProps) {
  const { country } = await params;

  // Fetch top gainers from the API with country filter
  const response = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/daily-top-gainers?country=${country}`, {
    next: {
      revalidate: 604800, // 7 days in seconds
      tags: [getDailyMoversByCountryTag(country, DailyMoverType.GAINER)],
    },
  });

  const topGainers: TopGainerWithTicker[] = await response.json();

  // Generate structured data
  const breadcrumbSchema = generateCountryMoversBreadcrumbSchema(country, DailyMoverType.GAINER);

  const breadcrumbs = [
    { name: `Top Performing Stocks in ${country.toUpperCase()} Today`, href: `/daily-top-movers/top-gainers/country/${country}`, current: true },
  ];

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <StockMoversTable movers={topGainers} type={DailyMoverType.GAINER} country={country} />
    </PageWrapper>
  );
}
