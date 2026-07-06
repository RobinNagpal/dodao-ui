import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';

/** Lightweight peer commodity shown in the "Similar Commodities" section. */
export interface SimilarCommodity {
  id: string;
  name: string;
  slug: string;
  commodityGroup: string;
  finalScore: number | null;
}

/** How many peers to surface. Commodities are few, so a small grid is plenty. */
const SIMILAR_COMMODITIES_LIMIT = 6;

/**
 * Peers for a commodity: other commodities in the same `commodityGroup`, ordered
 * by final score (desc) then name. Mirrors the stock "Top Similar Companies" /
 * ETF "Similar ETFs" sections, keyed off the group instead of industry.
 */
export async function fetchSimilarCommodities(slug: string): Promise<SimilarCommodity[]> {
  const current = await prisma.commodity.findFirst({
    where: { spaceId: KoalaGainsSpaceId, slug },
    select: { id: true, commodityGroup: true },
  });
  if (!current) return [];

  const peers = await prisma.commodity.findMany({
    where: {
      spaceId: KoalaGainsSpaceId,
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
