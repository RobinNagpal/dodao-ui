import { withAdminOrToken } from '@/app/api/helpers/withAdminOrToken';
import { prisma } from '@/prisma';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { NextRequest } from 'next/server';

export interface PickedEtf {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  inception: string | null;
  aum: string | null;
  expenseRatio: number | null;
  /** Why this ETF was picked (e.g. "high-aum", "low-aum", "new-fund", "mid-range") */
  pickReason: string;
}

export interface PickRandomEtfsResponse {
  assetClasses: Record<string, PickedEtf[]>;
  totalPicked: number;
}

export type EtfAssetClass = 'Equity' | 'Fixed Income' | 'Alternatives' | 'Commodity' | 'Asset Allocation' | 'Currency';

const ALL_ASSET_CLASSES: EtfAssetClass[] = ['Equity', 'Fixed Income', 'Alternatives', 'Commodity', 'Asset Allocation', 'Currency'];

function isValidAssetClass(v: string): v is EtfAssetClass {
  return ALL_ASSET_CLASSES.some((ac) => ac.toLowerCase() === v.toLowerCase());
}

/** Parse AUM strings like "$190.08M", "$1.4T", "$500K" into a numeric value for sorting. */
function parseAum(aum: string | null | undefined): number {
  if (!aum) return 0;
  const cleaned = aum.replace(/[$,\s]/g, '');
  const match = cleaned.match(/^([\d.]+)\s*([KMBT])?$/i);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const suffix = (match[2] || '').toUpperCase();
  switch (suffix) {
    case 'K':
      return num * 1_000;
    case 'M':
      return num * 1_000_000;
    case 'B':
      return num * 1_000_000_000;
    case 'T':
      return num * 1_000_000_000_000;
    default:
      return num;
  }
}

/** Parse inception date string to a Date for sorting by fund age. */
function parseInception(inception: string | null | undefined): Date | null {
  if (!inception) return null;
  const d = new Date(inception);
  return isNaN(d.getTime()) ? null : d;
}

interface EtfWithFinancials {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  inception: string | null;
  financialInfo: { aum: string | null; expenseRatio: number | null } | null;
}

/**
 * Pick 4 diverse ETFs from a list:
 * 1. Highest AUM (famous/well-known)
 * 2. Lowest AUM (small/niche)
 * 3. Newest fund (by inception date)
 * 4. Random from remaining (mid-range diversity)
 */
function pickDiverse(etfs: EtfWithFinancials[]): PickedEtf[] {
  if (etfs.length === 0) return [];
  if (etfs.length <= 4) {
    return etfs.map((e) => toPickedEtf(e, 'only-available'));
  }

  const picked: Map<string, string> = new Map(); // id -> reason

  // 1. Highest AUM
  const byAumDesc = [...etfs].sort((a, b) => parseAum(b.financialInfo?.aum) - parseAum(a.financialInfo?.aum));
  picked.set(byAumDesc[0].id, 'high-aum');

  // 2. Lowest AUM (non-zero preferred)
  const byAumAsc = [...etfs]
    .filter((e) => !picked.has(e.id))
    .sort((a, b) => {
      const aVal = parseAum(a.financialInfo?.aum);
      const bVal = parseAum(b.financialInfo?.aum);
      // Prefer non-zero AUM at the bottom
      if (aVal === 0 && bVal !== 0) return 1;
      if (bVal === 0 && aVal !== 0) return -1;
      return aVal - bVal;
    });
  if (byAumAsc.length > 0) {
    picked.set(byAumAsc[0].id, 'low-aum');
  }

  // 3. Newest fund by inception
  const byInceptionDesc = [...etfs]
    .filter((e) => !picked.has(e.id) && parseInception(e.inception) !== null)
    .sort((a, b) => {
      const aDate = parseInception(a.inception)!.getTime();
      const bDate = parseInception(b.inception)!.getTime();
      return bDate - aDate; // newest first
    });
  if (byInceptionDesc.length > 0) {
    picked.set(byInceptionDesc[0].id, 'new-fund');
  }

  // 4. Random from remaining
  const remaining = etfs.filter((e) => !picked.has(e.id));
  if (remaining.length > 0) {
    const randomIndex = Math.floor(Math.random() * remaining.length);
    picked.set(remaining[randomIndex].id, 'random-mid-range');
  }

  const results: PickedEtf[] = [];
  for (const [id, reason] of picked) {
    const etf = etfs.find((e) => e.id === id)!;
    results.push(toPickedEtf(etf, reason));
  }
  return results;
}

function toPickedEtf(e: EtfWithFinancials, reason: string): PickedEtf {
  return {
    id: e.id,
    symbol: e.symbol,
    name: e.name,
    exchange: e.exchange,
    inception: e.inception,
    aum: e.financialInfo?.aum ?? null,
    expenseRatio: e.financialInfo?.expenseRatio ?? null,
    pickReason: reason,
  };
}

async function getHandler(
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload | null,
  { params }: { params: Promise<{ spaceId: string }> }
): Promise<PickRandomEtfsResponse> {
  const { spaceId } = await params;
  const assetClassParam = req.nextUrl.searchParams.get('assetClass');

  // If a specific asset class is requested, only pick from that one
  const targetClasses: EtfAssetClass[] =
    assetClassParam && isValidAssetClass(assetClassParam)
      ? [ALL_ASSET_CLASSES.find((ac) => ac.toLowerCase() === assetClassParam.toLowerCase())!]
      : ALL_ASSET_CLASSES;

  const result: Record<string, PickedEtf[]> = {};
  let totalPicked = 0;

  for (const assetClass of targetClasses) {
    const etfs = await prisma.etf.findMany({
      where: {
        spaceId,
        stockAnalyzerInfo: {
          assetClass: { equals: assetClass, mode: 'insensitive' },
        },
      },
      select: {
        id: true,
        symbol: true,
        name: true,
        exchange: true,
        inception: true,
        financialInfo: { select: { aum: true, expenseRatio: true } },
      },
      orderBy: { symbol: 'asc' },
    });

    const picked = pickDiverse(etfs);
    result[assetClass] = picked;
    totalPicked += picked.length;
  }

  return { assetClasses: result, totalPicked };
}

export const GET = withAdminOrToken<PickRandomEtfsResponse>(getHandler);
