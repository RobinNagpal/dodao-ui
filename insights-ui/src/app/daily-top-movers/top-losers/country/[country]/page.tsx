import StockMoversTable from '@/components/daily-stock-movers/StockMoversTable';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { DailyMoverType } from '@/types/daily-mover-constants';
import { TopLoserWithTicker } from '@/types/daily-stock-movers';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getCachedDailyMoverAvailableDates, getCachedDailyMovers } from '@/utils/daily-movers-data';
import { generateCountryMoversBreadcrumbSchema, generateDailyMoversListMetadata } from '@/utils/metadata-generators';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ country: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { country } = await params;
  return generateDailyMoversListMetadata(country, DailyMoverType.LOSER);
}

export default async function DailyTopLosersPage({ params }: PageProps) {
  const { country } = await params;

  // Direct (cached) prisma access — see `daily-movers-data.ts`. The previous
  // self-`fetch()` of our own API routes failed wherever NEXT_PUBLIC_VERCEL_URL
  // is unset (relative URL → ERR_INVALID_URL on the server).
  const availableDates = await getCachedDailyMoverAvailableDates(KoalaGainsSpaceId, country, DailyMoverType.LOSER);
  const latestDate = availableDates.length > 0 ? availableDates[0] : null;
  const topLosers = (await getCachedDailyMovers(KoalaGainsSpaceId, country, DailyMoverType.LOSER, latestDate)) as TopLoserWithTicker[];

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
