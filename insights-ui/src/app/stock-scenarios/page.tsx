import StockScenariosPageActions from '@/app/stock-scenarios/StockScenariosPageActions';
import { StockScenarioListingResponse } from '@/app/api/[spaceId]/stock-scenarios/listing/route';
import StockScenarioListingGrid from '@/components/stock-scenarios/StockScenarioListingGrid';
import StockScenarioPageLayout from '@/components/stock-scenarios/StockScenarioPageLayout';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { STOCK_SCENARIO_LISTING_TAG } from '@/utils/stock-scenario-cache-utils';
import {
  generateStockScenarioListingBreadcrumbJsonLd,
  generateStockScenarioListingItemListJsonLd,
  generateStockScenarioListingJsonLd,
  generateStockScenarioListingMetadata,
} from '@/utils/stock-scenario-metadata-generators';

export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = 86400; // 24 hours

const DEFAULT_PAGE_SIZE = 200; // dataset should stay under ~100 for the foreseeable future; 200 leaves headroom
const WEEK_IN_SECONDS = 7 * 24 * 60 * 60;

export const metadata = generateStockScenarioListingMetadata();

async function fetchScenarioListing(): Promise<StockScenarioListingResponse> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/stock-scenarios/listing?pageSize=${DEFAULT_PAGE_SIZE}`;
  try {
    const res = await fetch(url, {
      next: { revalidate: WEEK_IN_SECONDS, tags: [STOCK_SCENARIO_LISTING_TAG] },
    });
    if (!res.ok) {
      console.error(`Failed to fetch stock scenarios listing: HTTP ${res.status}`);
      return { scenarios: [], totalCount: 0, page: 1, pageSize: DEFAULT_PAGE_SIZE, totalPages: 1, filtersApplied: false };
    }
    return (await res.json()) as StockScenarioListingResponse;
  } catch (e) {
    console.error('Failed to fetch stock scenarios listing:', e);
    return { scenarios: [], totalCount: 0, page: 1, pageSize: DEFAULT_PAGE_SIZE, totalPages: 1, filtersApplied: false };
  }
}

export default async function StockScenariosPage() {
  const data = await fetchScenarioListing();

  return (
    <StockScenarioPageLayout
      title="Stock Market Scenarios"
      description="A dated playbook of recurring market scenarios that meaningfully move specific stocks — with winners, losers, historical analogs, and a qualitative probability outlook. Filter by country to narrow in on a single market."
      rightButton={<StockScenariosPageActions />}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateStockScenarioListingJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateStockScenarioListingBreadcrumbJsonLd()) }} />
      {data.scenarios.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              generateStockScenarioListingItemListJsonLd(
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
      <StockScenarioListingGrid data={data} />
    </StockScenarioPageLayout>
  );
}
