import { withAdminOrToken } from '@/app/api/helpers/withAdminOrToken';
import etfCategoriesRaw from '@/etf-analysis-data/etf-analysis-categories.json';
import { prisma } from '@/prisma';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { EtfCategoriesConfig } from '@/types/etf/etf-analysis-types';
import { parseNumericStringValue } from '@/utils/etf-filter-utils';
import { NextRequest } from 'next/server';

const categoriesConfig = etfCategoriesRaw as EtfCategoriesConfig;

export interface DiverseEtf {
  symbol: string;
  exchange: string;
  name: string;
  category: string | null;
  aum: string | null;
  aumNumeric: number | null;
}

export interface DiverseEtfsResponse {
  groupKey: string;
  groupName: string;
  categories: string[];
  etfs: DiverseEtf[];
}

function categoriesForGroup(groupKey: string): string[] {
  return categoriesConfig.categories.filter((c) => c.group === groupKey).map((c) => c.name);
}

/**
 * Pick up to `limit` ETFs that span distinct categories within a group, ranked by AUM.
 * Iterate all ETFs sorted by AUM desc, then pick one per category in round-robin rounds:
 * first the largest ETF from each category, then the next largest from each remaining
 * category, until we hit the cap. This guarantees the first N picks come from N different
 * categories when there are that many categories with data.
 */
function pickDiverse(etfs: DiverseEtf[], limit: number): DiverseEtf[] {
  const buckets = new Map<string, DiverseEtf[]>();
  for (const e of etfs) {
    const key = e.category ?? '(unknown)';
    const list = buckets.get(key) ?? [];
    list.push(e);
    buckets.set(key, list);
  }

  const picked: DiverseEtf[] = [];
  let exhausted = false;
  while (picked.length < limit && !exhausted) {
    exhausted = true;
    for (const [, list] of buckets) {
      if (list.length === 0) continue;
      picked.push(list.shift()!);
      exhausted = false;
      if (picked.length >= limit) break;
    }
  }
  return picked;
}

async function getHandler(
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload | null,
  { params }: { params: Promise<{ spaceId: string; groupKey: string }> }
): Promise<DiverseEtfsResponse> {
  const { spaceId, groupKey } = await params;

  const group = categoriesConfig.groups.find((g) => g.key === groupKey);
  if (!group) {
    throw new Error(`Unknown group key "${groupKey}". Valid: ${categoriesConfig.groups.map((g) => g.key).join(', ')}`);
  }

  const url = new URL(req.url);
  const rawLimit = parseInt(url.searchParams.get('limit') || '10', 10);
  const limit = Number.isFinite(rawLimit) ? Math.min(50, Math.max(1, rawLimit)) : 10;

  const groupCategories = categoriesForGroup(groupKey);
  if (groupCategories.length === 0) {
    return { groupKey, groupName: group.name, categories: [], etfs: [] };
  }

  const rows = await prisma.etf.findMany({
    where: {
      spaceId,
      stockAnalyzerInfo: { category: { in: groupCategories } },
    },
    select: {
      symbol: true,
      exchange: true,
      name: true,
      stockAnalyzerInfo: { select: { category: true } },
      financialInfo: { select: { aum: true } },
    },
  });

  const enriched: DiverseEtf[] = rows
    .map((r) => ({
      symbol: r.symbol,
      exchange: r.exchange,
      name: r.name,
      category: r.stockAnalyzerInfo?.category ?? null,
      aum: r.financialInfo?.aum ?? null,
      aumNumeric: parseNumericStringValue(r.financialInfo?.aum ?? null),
    }))
    .filter((e) => e.category !== null)
    .sort((a, b) => (b.aumNumeric ?? 0) - (a.aumNumeric ?? 0));

  const diverse = pickDiverse(enriched, limit);

  return { groupKey, groupName: group.name, categories: groupCategories, etfs: diverse };
}

export const GET = withAdminOrToken<DiverseEtfsResponse>(getHandler);
