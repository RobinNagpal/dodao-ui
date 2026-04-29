import { Suspense } from 'react';
import EtfScenariosPageActions from '@/app/etf-scenarios/EtfScenariosPageActions';
import EtfScenarioListingGrid from '@/components/etf-scenarios/EtfScenarioListingGrid';
import EtfScenarioPageLayout from '@/components/etf-scenarios/EtfScenarioPageLayout';
import { EtfScenarioListingResponse } from '@/app/api/[spaceId]/etf-scenarios/listing/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { ETF_SCENARIO_LISTING_TAG } from '@/utils/etf-scenario-cache-utils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import {
  generateEtfScenarioListingMetadata,
  generateEtfScenarioListingJsonLd,
  generateEtfScenarioListingBreadcrumbJsonLd,
  generateEtfScenarioListingItemListJsonLd,
} from '@/utils/etf-scenario-metadata-generators';

export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = 86400; // 24 hours

const DEFAULT_PAGE_SIZE = 100; // fixed 31-row dataset today; 100 leaves headroom
const WEEK_IN_SECONDS = 7 * 24 * 60 * 60;

export const metadata = generateEtfScenarioListingMetadata();

async function fetchScenarioListing(): Promise<EtfScenarioListingResponse> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etf-scenarios/listing?pageSize=${DEFAULT_PAGE_SIZE}`;
  try {
    const res = await fetch(url, {
      next: { revalidate: WEEK_IN_SECONDS, tags: [ETF_SCENARIO_LISTING_TAG] },
    });
    if (!res.ok) {
      console.error(`Failed to fetch ETF scenarios listing: HTTP ${res.status}`);
      return { scenarios: [], totalCount: 0, page: 1, pageSize: DEFAULT_PAGE_SIZE, totalPages: 1, filtersApplied: false };
    }
    return (await res.json()) as EtfScenarioListingResponse;
  } catch (e) {
    console.error('Failed to fetch ETF scenarios listing:', e);
    return { scenarios: [], totalCount: 0, page: 1, pageSize: DEFAULT_PAGE_SIZE, totalPages: 1, filtersApplied: false };
  }
}

export default async function EtfScenariosPage() {
  const data = await fetchScenarioListing();

  return (
    <EtfScenarioPageLayout
      title="ETF Market Scenarios"
      description="A dated playbook of recurring market scenarios that meaningfully move specific ETF categories — with winners, losers, historical analogs, and a qualitative probability outlook."
      rightButton={<EtfScenariosPageActions />}
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
      <Suspense fallback={null}>
        <EtfScenarioListingGrid data={data} />
      </Suspense>
    </EtfScenarioPageLayout>
  );
}
