import { withLoggedInAdmin } from '@/app/api/helpers/withLoggedInAdmin';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { AUTO_GEN_PRIORITY_STOCK_EXCHANGES } from '@/utils/auto-generation/auto-gen-config';
import { AutoGenMarkets } from '@/utils/auto-generation/auto-gen-models';
import { getAutoGenMarkets, getAutoGenModePreset } from '@/utils/auto-generation/auto-gen-utils';
import { getUpcomingAutoGenerationStocks } from '@/utils/oldest-reports-utils';
import { NextRequest } from 'next/server';

/** One stock in the queue, already flattened for the admin table. */
export interface UpcomingAutoGenerationStock {
  tickerId: string;
  symbol: string;
  exchange: string;
  name: string;
  /** `TickerV1.updatedAt` — the report date the queue is ordered by. */
  reportLastUpdatedAt: string;
}

export interface UpcomingAutoGenerationResponse {
  items: UpcomingAutoGenerationStock[];
  /** Every eligible candidate for the selected markets, not just this page. */
  totalCount: number;
  /** The markets this response was built for (the `markets` param, else the configured value). */
  appliedMarkets: AutoGenMarkets;
  /** What App Settings currently selects — the markets the job will really use. */
  configuredMarkets: AutoGenMarkets;
  /** How many of the listed stocks the next batch takes, from the current mode preset. */
  batchSize: number;
  pagination: { skip: number; take: number };
}

/** Upper bound on a page, so a hand-crafted `take` can't pull the whole ticker table. */
const MAX_TAKE = 200;
const DEFAULT_TAKE = 25;

/** `UsAndCanadaOnly` narrows to the priority venues; `AllMarkets` means no exchange filter. */
function exchangesForMarkets(markets: AutoGenMarkets): string[] | undefined {
  return markets === AutoGenMarkets.UsAndCanadaOnly ? AUTO_GEN_PRIORITY_STOCK_EXCHANGES : undefined;
}

/**
 * Read-only preview of the stock auto-generation queue: the stocks the nightly
 * Claude job would pick, in the order it would pick them.
 *
 * Ordering and eligibility come from `getUpcomingAutoGenerationStocks`, the same
 * helper `getOldestStocksOverall` (the real enqueue path) is built on, so the
 * screen cannot show a different queue from the one the job consumes.
 *
 * The `markets` param overrides the configured `AUTOMATED_GENERATION_MARKETS` for
 * this response only — it lets an admin see what the "All markets" setting would
 * queue up without actually changing the setting. The response carries both values
 * so the UI can flag when the preview is not what the job will do.
 */
async function getHandler(
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload,
  { params }: { params: Promise<{ spaceId: string }> }
): Promise<UpcomingAutoGenerationResponse> {
  const { spaceId } = await params;
  const url = new URL(req.url);

  const parsedSkip = parseInt(url.searchParams.get('skip') || '0', 10);
  const skip = Number.isNaN(parsedSkip) ? 0 : Math.max(0, parsedSkip);

  const parsedTake = parseInt(url.searchParams.get('take') || String(DEFAULT_TAKE), 10);
  const take = Number.isNaN(parsedTake) ? DEFAULT_TAKE : Math.min(MAX_TAKE, Math.max(1, parsedTake));

  const configuredMarkets = await getAutoGenMarkets();
  const requestedMarkets = url.searchParams.get('markets');
  const appliedMarkets =
    requestedMarkets !== null && (Object.values(AutoGenMarkets) as string[]).includes(requestedMarkets)
      ? (requestedMarkets as AutoGenMarkets)
      : configuredMarkets;

  const [{ rows, totalCount }, preset] = await Promise.all([
    getUpcomingAutoGenerationStocks(spaceId, { exchanges: exchangesForMarkets(appliedMarkets), skip, take }),
    getAutoGenModePreset(),
  ]);

  return {
    items: rows.map((r) => ({
      tickerId: r.tickerId,
      symbol: r.symbol,
      exchange: r.exchange,
      name: r.name,
      reportLastUpdatedAt: r.reportLastUpdatedAt.toISOString(),
    })),
    totalCount,
    appliedMarkets,
    configuredMarkets,
    batchSize: preset.batchSize,
    pagination: { skip, take },
  };
}

export const GET = withLoggedInAdmin<UpcomingAutoGenerationResponse>(getHandler);
