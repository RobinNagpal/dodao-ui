import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';
import { parseLimitParam } from '@/utils/pagination-param-utils';
import { toEtfAlternativeListings } from '@/utils/etf-alternative-listing-utils';
import type { EtfAlternativeListing } from '@/types/prismaTypes';

/** Upper bound for the `limit` param; the query fetches up to 4× this before ranking. */
const MAX_SEARCH_LIMIT = 50;

export interface EtfSearchResult {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  cachedScoreEntry: {
    finalScore: number;
  } | null;
  /** Set when the query is one of this fund's alternative tickers (e.g. "SXR8" finds LSE:CSPX). */
  matchedAlternativeListing?: EtfAlternativeListing;
}

export interface EtfSearchResponse {
  results: EtfSearchResult[];
  totalCount: number;
  query: string;
}

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<EtfSearchResponse> {
  const { spaceId } = await context.params;
  const url = new URL(req.url);
  const query = url.searchParams.get('q');
  // Non-numeric junk (e.g. `limit=JJJ`) → 400; numeric values are clamped to [1, MAX_SEARCH_LIMIT].
  const limit = parseLimitParam(url.searchParams.get('limit'), { default: 10, max: MAX_SEARCH_LIMIT });

  if (!query || query.trim().length < 1) {
    return { results: [], totalCount: 0, query: query || '' };
  }

  const searchTerm = query.trim();

  const whereClause: Prisma.EtfWhereInput = {
    spaceId,
    OR: [
      { symbol: { equals: searchTerm.toUpperCase(), mode: 'insensitive' } },
      { symbol: { startsWith: searchTerm.toUpperCase(), mode: 'insensitive' } },
      { name: { startsWith: searchTerm, mode: 'insensitive' } },
      { symbol: { contains: searchTerm, mode: 'insensitive' } },
      { name: { contains: searchTerm, mode: 'insensitive' } },
      // Exact alternative ticker: the same share class listed elsewhere (e.g. XETRA:SXR8 → LSE:CSPX).
      { alternativeListings: { array_contains: [{ symbol: searchTerm.toUpperCase() }] } },
    ],
  };

  // For short queries, fetch more rows so the priority sort has room to surface
  // the best matches before slicing to `limit`.
  const fetchLimit = searchTerm.length <= 2 ? Math.min(limit * 4, 200) : Math.min(limit * 2, 100);

  const etfs = await prisma.etf.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      symbol: true,
      exchange: true,
      alternativeListings: true,
      cachedScore: {
        select: { finalScore: true },
      },
    },
    take: fetchLimit,
  });

  const searchUpperTerm = searchTerm.toUpperCase();
  const matchedAlternative = (etf: (typeof etfs)[number]): EtfAlternativeListing | undefined =>
    toEtfAlternativeListings(etf.alternativeListings).find((l) => l.symbol.toUpperCase() === searchUpperTerm);

  const results: EtfSearchResult[] = etfs
    .sort((a, b) => {
      const searchUpper = searchTerm.toUpperCase();
      const searchLower = searchTerm.toLowerCase();

      // An exact alternative ticker ranks with exact symbol matches.
      const aSymbolExact = a.symbol.toUpperCase() === searchUpper || !!matchedAlternative(a);
      const bSymbolExact = b.symbol.toUpperCase() === searchUpper || !!matchedAlternative(b);
      if (aSymbolExact && !bSymbolExact) return -1;
      if (!aSymbolExact && bSymbolExact) return 1;

      const aSymbolStarts = a.symbol.toUpperCase().startsWith(searchUpper);
      const bSymbolStarts = b.symbol.toUpperCase().startsWith(searchUpper);
      if (aSymbolStarts && !bSymbolStarts) return -1;
      if (!aSymbolStarts && bSymbolStarts) return 1;
      if (aSymbolStarts && bSymbolStarts && a.symbol.length !== b.symbol.length) {
        return a.symbol.length - b.symbol.length;
      }

      const aSymbolContains = a.symbol.toUpperCase().includes(searchUpper);
      const bSymbolContains = b.symbol.toUpperCase().includes(searchUpper);
      if (aSymbolContains && !bSymbolContains) return -1;
      if (!aSymbolContains && bSymbolContains) return 1;
      if (aSymbolContains && bSymbolContains) {
        const aSymbolIndex = a.symbol.toUpperCase().indexOf(searchUpper);
        const bSymbolIndex = b.symbol.toUpperCase().indexOf(searchUpper);
        if (aSymbolIndex !== bSymbolIndex) return aSymbolIndex - bSymbolIndex;
      }

      const aNameStarts = a.name.toLowerCase().startsWith(searchLower);
      const bNameStarts = b.name.toLowerCase().startsWith(searchLower);
      if (aNameStarts && !bNameStarts) return -1;
      if (!aNameStarts && bNameStarts) return 1;

      const aNameContains = a.name.toLowerCase().includes(searchLower);
      const bNameContains = b.name.toLowerCase().includes(searchLower);
      if (aNameContains && !bNameContains) return -1;
      if (!aNameContains && bNameContains) return 1;

      const aScore = a.cachedScore?.finalScore ?? 0;
      const bScore = b.cachedScore?.finalScore ?? 0;
      if (bScore !== aScore) return bScore - aScore;

      return a.symbol.localeCompare(b.symbol);
    })
    .slice(0, limit)
    .map((etf) => ({
      id: etf.id,
      name: etf.name,
      symbol: etf.symbol,
      exchange: etf.exchange,
      cachedScoreEntry: etf.cachedScore ? { finalScore: etf.cachedScore.finalScore } : null,
      ...(matchedAlternative(etf) ? { matchedAlternativeListing: matchedAlternative(etf) } : {}),
    }));

  return { results, totalCount: results.length, query: searchTerm };
}

export const GET = withErrorHandlingV2<EtfSearchResponse>(getHandler);
