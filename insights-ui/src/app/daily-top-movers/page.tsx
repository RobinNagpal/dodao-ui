import DailyMoversOverview, { MoversByDate } from '@/components/daily-stock-movers/DailyMoversOverview';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { DailyMoverType } from '@/types/daily-mover-constants';
import { TopGainerWithTicker, TopLoserWithTicker } from '@/types/daily-stock-movers';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getCachedDailyMoverAvailableDates, getCachedDailyMovers } from '@/utils/daily-movers-data';
import { generateDailyMoversOverviewBreadcrumbSchema, generateDailyMoversOverviewMetadata } from '@/utils/metadata-generators';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';

const COUNTRY = 'US';
const DAYS_TO_SHOW = 5;

export const metadata: Metadata = generateDailyMoversOverviewMetadata(COUNTRY);

// Data comes straight from prisma via the cached helpers in
// `daily-movers-data.ts` (same revalidate window + cache tags the previous
// self-`fetch()` used). Fetching our own API routes here broke `next build`
// wherever NEXT_PUBLIC_VERCEL_URL is unset (relative URL → ERR_INVALID_URL
// during prerender).
async function fetchMoversByDate<T extends TopGainerWithTicker | TopLoserWithTicker>(type: DailyMoverType): Promise<MoversByDate<T>[]> {
  const availableDates = await getCachedDailyMoverAvailableDates(KoalaGainsSpaceId, COUNTRY, type);

  const lastDays = availableDates.slice(0, DAYS_TO_SHOW);

  const groups = await Promise.all(
    lastDays.map(async (date): Promise<MoversByDate<T>> => {
      const movers = (await getCachedDailyMovers(KoalaGainsSpaceId, COUNTRY, type, date)) as T[];
      return { date, movers };
    })
  );

  return groups.filter((group) => group.movers.length > 0);
}

export default async function DailyTopMoversPage() {
  const [gainersByDate, losersByDate] = await Promise.all([
    fetchMoversByDate<TopGainerWithTicker>(DailyMoverType.GAINER),
    fetchMoversByDate<TopLoserWithTicker>(DailyMoverType.LOSER),
  ]);

  const breadcrumbSchema = generateDailyMoversOverviewBreadcrumbSchema(COUNTRY);

  const breadcrumbs = [{ name: `Top Gainers & Losers in ${COUNTRY}`, href: '/daily-top-movers', current: true }];

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

      <DailyMoversOverview country={COUNTRY} gainersByDate={gainersByDate} losersByDate={losersByDate} />
    </PageWrapper>
  );
}
