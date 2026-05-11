import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';

export interface EtfSearchResult {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  cachedScoreEntry: {
    finalScore: number;
  } | null;
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
  const limit = parseInt(url.searchParams.get('limit') || '10');

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
      cachedScore: {
        select: { finalScore: true },
      },
    },
    take: fetchLimit,
  });

  const results: EtfSearchResult[] = etfs
    .sort((a, b) => {
      const searchUpper = searchTerm.toUpperCase();
      const searchLower = searchTerm.toLowerCase();

      const aSymbolExact = a.symbol.toUpperCase() === searchUpper;
      const bSymbolExact = b.symbol.toUpperCase() === searchUpper;
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
    }));

  return { results, totalCount: results.length, query: searchTerm };
}

export const GET = withErrorHandlingV2<EtfSearchResponse>(getHandler);
