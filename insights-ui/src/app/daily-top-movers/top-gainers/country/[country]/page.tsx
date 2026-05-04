import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { TopGainerWithTicker } from '@/types/daily-stock-movers';
import { DailyMoverType } from '@/types/daily-mover-constants';
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
  const baseUrl = getBaseUrl();
  const cacheOptions = {
    next: {
      revalidate: 1209600,
      tags: [getDailyMoversByCountryTag(country, DailyMoverType.GAINER)],
    },
  };

  // Fetch available dates first, then only the latest date's movers
  const datesRes = await fetch(
    `${baseUrl}/api/${KoalaGainsSpaceId}/tickers-v1/daily-movers-available-dates?country=${country}&type=${DailyMoverType.GAINER}`,
    cacheOptions
  );
  const { dates: availableDates } = (await datesRes.json()) as { dates: string[] };

  const latestDate = availableDates.length > 0 ? availableDates[0] : null;
  const dateParam = latestDate ? `&date=${latestDate}` : '';
  const gainersRes = await fetch(`${baseUrl}/api/${KoalaGainsSpaceId}/tickers-v1/daily-top-gainers?country=${country}${dateParam}`, cacheOptions);
  const topGainers: TopGainerWithTicker[] = await gainersRes.json();

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

      <StockMoversTable movers={topGainers} type={DailyMoverType.GAINER} country={country} availableDates={availableDates} />
    </PageWrapper>
  );
}
