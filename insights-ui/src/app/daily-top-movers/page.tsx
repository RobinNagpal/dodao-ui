import DailyMoversOverview, { MoversByDate } from '@/components/daily-stock-movers/DailyMoversOverview';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { DailyMoverType } from '@/types/daily-mover-constants';
import { TopGainerWithTicker, TopLoserWithTicker } from '@/types/daily-stock-movers';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { generateDailyMoversOverviewBreadcrumbSchema, generateDailyMoversOverviewMetadata } from '@/utils/metadata-generators';
import { getDailyMoversByCountryTag } from '@/utils/ticker-v1-cache-utils';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Metadata } from 'next';

const COUNTRY = 'US';
const DAYS_TO_SHOW = 5;

export const metadata: Metadata = generateDailyMoversOverviewMetadata(COUNTRY);

async function fetchMoversByDate<T extends TopGainerWithTicker | TopLoserWithTicker>(type: DailyMoverType): Promise<MoversByDate<T>[]> {
  const baseUrl = getBaseUrl();
  const cacheOptions = {
    next: {
      revalidate: 1209600,
      tags: [getDailyMoversByCountryTag(COUNTRY, type)],
    },
  };

  const datesRes = await fetch(`${baseUrl}/api/${KoalaGainsSpaceId}/tickers-v1/daily-movers-available-dates?country=${COUNTRY}&type=${type}`, cacheOptions);
  const { dates: availableDates } = (await datesRes.json()) as { dates: string[] };

  const lastDays = availableDates.slice(0, DAYS_TO_SHOW);
  const endpoint = type === DailyMoverType.GAINER ? 'daily-top-gainers' : 'daily-top-losers';

  const groups = await Promise.all(
    lastDays.map(async (date): Promise<MoversByDate<T>> => {
      const res = await fetch(`${baseUrl}/api/${KoalaGainsSpaceId}/tickers-v1/${endpoint}?country=${COUNTRY}&date=${date}`, cacheOptions);
      const movers: T[] = await res.json();
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
