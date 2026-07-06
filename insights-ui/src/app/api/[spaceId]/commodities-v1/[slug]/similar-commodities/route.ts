import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { SimilarCommodity } from '@/utils/commodity-analysis-reports/get-similar-commodities-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

/** How many peers to surface. Commodities are few, so a small grid is plenty. */
const SIMILAR_COMMODITIES_LIMIT = 6;

/**
 * Peers for a commodity: other commodities in the same `commodityGroup`, ordered
 * by final score (desc) then name. The commodity parallel of the stock
 * `similar-tickers` / ETF `similar-etfs` routes — the report pages fetch this
 * instead of querying prisma directly.
 */
async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; slug: string }> }): Promise<SimilarCommodity[]> {
  const { spaceId, slug } = await context.params;
  const resolvedSpaceId = spaceId || KoalaGainsSpaceId;

  const current = await prisma.commodity.findFirst({
    where: { spaceId: resolvedSpaceId, slug },
    select: { id: true, commodityGroup: true },
  });
  if (!current) return [];

  const peers = await prisma.commodity.findMany({
    where: {
      spaceId: resolvedSpaceId,
      commodityGroup: current.commodityGroup,
      id: { not: current.id },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      commodityGroup: true,
      cachedScore: { select: { finalScore: true } },
    },
    orderBy: [{ cachedScore: { finalScore: 'desc' } }, { name: 'asc' }],
    take: SIMILAR_COMMODITIES_LIMIT,
  });

  return peers.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    commodityGroup: p.commodityGroup,
    finalScore: p.cachedScore?.finalScore ?? null,
  }));
}

export const GET = withErrorHandlingV2<SimilarCommodity[]>(getHandler);
