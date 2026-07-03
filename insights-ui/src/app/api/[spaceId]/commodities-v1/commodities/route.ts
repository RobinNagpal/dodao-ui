import { withAdminOrToken } from '@/app/api/helpers/withAdminOrToken';
import { prisma } from '@/prisma';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { Commodity } from '@prisma/client';
import { NextRequest } from 'next/server';

export interface CommodityUpsertPayload {
  slug: string;
  name: string;
  commodityGroup: string;
  priceSymbol?: string | null;
  exchange?: string | null;
  unit?: string | null;
  currency?: string;
}

/** List every commodity in the space (used by the public listing + admin). */
async function getHandler(
  _req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload | null,
  { params }: { params: Promise<{ spaceId: string }> }
): Promise<{ commodities: Commodity[] }> {
  const { spaceId } = await params;
  const commodities = await prisma.commodity.findMany({
    where: { spaceId },
    orderBy: [{ commodityGroup: 'asc' }, { name: 'asc' }],
  });
  return { commodities };
}

/**
 * Upsert a batch of commodities by (spaceId, slug). Lets an admin seed/curate
 * the ~20-30 commodity universe without a DB migration. Report generation is a
 * separate step (the generation-requests endpoint).
 */
async function postHandler(
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload | null,
  { params }: { params: Promise<{ spaceId: string }> }
): Promise<{ commodities: Commodity[] }> {
  const { spaceId } = await params;
  const payloads = (await req.json()) as CommodityUpsertPayload[];
  if (!Array.isArray(payloads) || payloads.length === 0) {
    throw new Error('Request body must be a non-empty array of commodities');
  }

  const commodities: Commodity[] = [];
  for (const payload of payloads) {
    if (!payload.slug || !payload.name || !payload.commodityGroup) {
      throw new Error('Each commodity needs slug, name and commodityGroup');
    }
    const data = {
      name: payload.name,
      commodityGroup: payload.commodityGroup,
      priceSymbol: payload.priceSymbol ?? null,
      exchange: payload.exchange ?? null,
      unit: payload.unit ?? null,
      currency: payload.currency ?? 'USD',
    };
    const commodity = await prisma.commodity.upsert({
      where: { spaceId_slug: { spaceId, slug: payload.slug } },
      update: data,
      create: { spaceId, slug: payload.slug, ...data },
    });
    commodities.push(commodity);
  }

  return { commodities };
}

export const GET = withAdminOrToken<{ commodities: Commodity[] }>(getHandler);
export const POST = withAdminOrToken<{ commodities: Commodity[] }>(postHandler);
