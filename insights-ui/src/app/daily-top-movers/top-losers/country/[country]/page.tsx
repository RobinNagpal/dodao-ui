import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { TopLoserWithTicker } from '@/types/daily-stock-movers';
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
  return generateDailyMoversListMetadata(country, DailyMoverType.LOSER);
}

export default async function DailyTopLosersPage({ params }: PageProps) {
  const { country } = await params;
  const baseUrl = getBaseUrl();
  const cacheOptions = {
    next: {
      revalidate: 604800,
      tags: [getDailyMoversByCountryTag(country, DailyMoverType.LOSER)],
    },
  };

  // Fetch available dates first, then only the latest date's movers
  const datesRes = await fetch(
    `${baseUrl}/api/${KoalaGainsSpaceId}/tickers-v1/daily-movers-available-dates?country=${country}&type=${DailyMoverType.LOSER}`,
    cacheOptions
  );
  const { dates: availableDates } = (await datesRes.json()) as { dates: string[] };

  const latestDate = availableDates.length > 0 ? availableDates[0] : null;
  const dateParam = latestDate ? `&date=${latestDate}` : '';
  const losersRes = await fetch(`${baseUrl}/api/${KoalaGainsSpaceId}/tickers-v1/daily-top-losers?country=${country}${dateParam}`, cacheOptions);
  const topLosers: TopLoserWithTicker[] = await losersRes.json();

  const breadcrumbSchema = generateCountryMoversBreadcrumbSchema(country, DailyMoverType.LOSER);

  const breadcrumbs = [
    { name: `Worst Performing Stocks in ${country.toUpperCase()} Today`, href: `/daily-top-movers/top-losers/country/${country}`, current: true },
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

      <StockMoversTable movers={topLosers} type={DailyMoverType.LOSER} country={country} availableDates={availableDates} />
    </PageWrapper>
  );
}
