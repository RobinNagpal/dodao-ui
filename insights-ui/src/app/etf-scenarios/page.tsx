import EtfScenarioListingGrid from '@/components/etf-scenarios/EtfScenarioListingGrid';
import EtfScenarioPageLayout from '@/components/etf-scenarios/EtfScenarioPageLayout';
import { EtfScenarioListingResponse, EtfScenarioListingItem } from '@/app/api/[spaceId]/etf-scenarios/listing/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import {
  generateEtfScenarioListingMetadata,
  generateEtfScenarioListingJsonLd,
  generateEtfScenarioListingBreadcrumbJsonLd,
  generateEtfScenarioListingItemListJsonLd,
} from '@/utils/etf-scenario-metadata-generators';
import { prisma } from '@/prisma';

export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = 86400; // 24 hours

const DEFAULT_PAGE_SIZE = 100; // fixed 31-row dataset today; 100 leaves headroom

export const metadata = generateEtfScenarioListingMetadata();

export default async function EtfScenariosPage() {
  let data: EtfScenarioListingResponse = {
    scenarios: [],
    totalCount: 0,
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalPages: 1,
    filtersApplied: false,
  };

  try {
    const [rows, totalCount] = await Promise.all([
      prisma.etfScenario.findMany({
        where: { spaceId: KoalaGainsSpaceId, archived: false },
        orderBy: [{ scenarioNumber: 'asc' }],
        take: DEFAULT_PAGE_SIZE,
        select: {
          id: true,
          scenarioNumber: true,
          title: true,
          slug: true,
          direction: true,
          timeframe: true,
          probabilityBucket: true,
          probabilityPercentage: true,
          outlookAsOfDate: true,
          underlyingCause: true,
          archived: true,
        },
      }),
      prisma.etfScenario.count({ where: { spaceId: KoalaGainsSpaceId, archived: false } }),
    ]);

    const scenarios: EtfScenarioListingItem[] = rows.map((s) => ({
      id: s.id,
      scenarioNumber: s.scenarioNumber,
      title: s.title,
      slug: s.slug,
      direction: s.direction,
      timeframe: s.timeframe,
      probabilityBucket: s.probabilityBucket,
      probabilityPercentage: s.probabilityPercentage,
      outlookAsOfDate: s.outlookAsOfDate.toISOString(),
      underlyingCause: s.underlyingCause,
      archived: s.archived,
    }));

    data = {
      scenarios,
      totalCount,
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil(totalCount / DEFAULT_PAGE_SIZE)),
      filtersApplied: false,
    };
  } catch (e) {
    console.error('Failed to fetch ETF scenarios listing:', e);
  }

  return (
    <EtfScenarioPageLayout
      title="ETF Market Scenarios"
      description="A dated playbook of recurring market scenarios that meaningfully move specific ETF categories — with winners, losers, historical analogs, and a qualitative probability outlook."
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateEtfScenarioListingJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateEtfScenarioListingBreadcrumbJsonLd()) }} />
      {data.scenarios.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              generateEtfScenarioListingItemListJsonLd(
                data.scenarios.map((s) => ({
                  slug: s.slug,
                  title: s.title,
                  scenarioNumber: s.scenarioNumber,
                }))
              )
            ),
          }}
        />
      )}
      <EtfScenarioListingGrid data={data} />
    </EtfScenarioPageLayout>
  );
}
