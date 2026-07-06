import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

/** One row in the public commodities listing (grouped by `commodityGroup`). */
export interface CommodityListItem {
  id: string;
  slug: string;
  name: string;
  commodityGroup: string;
  finalScore: number | null;
}

/**
 * Public listing of every commodity in the space, ordered by group then name,
 * with each commodity's final score. Backs the `/commodities` index page so it
 * fetches through the API instead of querying prisma directly — the commodity
 * parallel of the stock/ETF listing endpoints.
 */
async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<CommodityListItem[]> {
  const { spaceId } = await context.params;

  const commodities = await prisma.commodity.findMany({
    where: { spaceId: spaceId || KoalaGainsSpaceId },
    orderBy: [{ commodityGroup: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      slug: true,
      name: true,
      commodityGroup: true,
      cachedScore: { select: { finalScore: true } },
    },
  });

  return commodities.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    commodityGroup: c.commodityGroup,
    finalScore: c.cachedScore?.finalScore ?? null,
  }));
}

export const GET = withErrorHandlingV2<CommodityListItem[]>(getHandler);
