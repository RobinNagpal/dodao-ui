import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';

export interface SearchResult {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  industryKey: string;
  subIndustryKey: string;
  websiteUrl?: string | null;
  summary?: string | null;
  cachedScore: number;
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  query: string;
}

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<SearchResponse> {
  const { spaceId } = await context.params;
  const url = new URL(req.url);
  const query = url.searchParams.get('q');
  const limit = parseInt(url.searchParams.get('limit') || '10');

  if (!query || query.trim().length < 1) {
    return {
      results: [],
      totalCount: 0,
      query: query || '',
    };
  }

  const searchTerm = query.trim();

  // Search by symbol (exact match first, then partial) and company name (partial match)
  const whereClause: Prisma.TickerV1WhereInput = {
    spaceId,
    OR: [
      // Exact symbol match (highest priority)
      {
        symbol: {
          equals: searchTerm.toUpperCase(),
          mode: 'insensitive',
        },
      },
      // Symbol starts with search term (high priority)
      {
        symbol: {
          startsWith: searchTerm.toUpperCase(),
          mode: 'insensitive',
        },
      },
      // Company name starts with search term (medium priority)
      {
        name: {
          startsWith: searchTerm,
          mode: 'insensitive',
        },
      },
      // Partial symbol match (lower priority)
      {
        symbol: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      // Company name contains search term (lowest priority)
      {
        name: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
    ],
  };

  // Get matching tickers with a reasonable limit
  // For short searches, get more results to ensure proper prioritization
  const fetchLimit = searchTerm.length <= 2 ? Math.min(limit * 4, 200) : Math.min(limit * 2, 100);

  const tickers = await prisma.tickerV1.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      symbol: true,
      exchange: true,
      industryKey: true,
      subIndustryKey: true,
      websiteUrl: true,
      summary: true,
      cachedScore: true,
    },
    take: fetchLimit, // Get more results to sort properly
  });

  // Sort results with proper priority
  const results = tickers
    .sort((a, b) => {
      const searchUpper = searchTerm.toUpperCase();
      const searchLower = searchTerm.toLowerCase();

      // Priority 1: Exact symbol match
      const aSymbolExact = a.symbol.toUpperCase() === searchUpper;
      const bSymbolExact = b.symbol.toUpperCase() === searchUpper;
      if (aSymbolExact && !bSymbolExact) return -1;
      if (!aSymbolExact && bSymbolExact) return 1;

      // Priority 2: Symbol starts with search term
      const aSymbolStarts = a.symbol.toUpperCase().startsWith(searchUpper);
      const bSymbolStarts = b.symbol.toUpperCase().startsWith(searchUpper);
      if (aSymbolStarts && !bSymbolStarts) return -1;
      if (!aSymbolStarts && bSymbolStarts) return 1;

      // If both symbols start with search term, prefer shorter symbols (more specific match)
      if (aSymbolStarts && bSymbolStarts) {
        if (a.symbol.length !== b.symbol.length) {
          return a.symbol.length - b.symbol.length;
        }
      }

      // Priority 3: Company name starts with search term
      const aNameStarts = a.name.toLowerCase().startsWith(searchLower);
      const bNameStarts = b.name.toLowerCase().startsWith(searchLower);
      if (aNameStarts && !bNameStarts) return -1;
      if (!aNameStarts && bNameStarts) return 1;

      // Priority 4: For symbol contains matches, prefer earlier positions
      const aSymbolContains = a.symbol.toUpperCase().includes(searchUpper);
      const bSymbolContains = b.symbol.toUpperCase().includes(searchUpper);
      if (aSymbolContains && !bSymbolContains) return -1;
      if (!aSymbolContains && bSymbolContains) return 1;

      // If both contain the search term, prefer earlier position in symbol
      if (aSymbolContains && bSymbolContains) {
        const aSymbolIndex = a.symbol.toUpperCase().indexOf(searchUpper);
        const bSymbolIndex = b.symbol.toUpperCase().indexOf(searchUpper);
        if (aSymbolIndex !== bSymbolIndex) {
          return aSymbolIndex - bSymbolIndex;
        }
      }

      // Priority 5: Company name contains matches
      const aNameContains = a.name.toLowerCase().includes(searchLower);
      const bNameContains = b.name.toLowerCase().includes(searchLower);
      if (aNameContains && !bNameContains) return -1;
      if (!aNameContains && bNameContains) return 1;

      // Priority 6: Higher cached score
      if (b.cachedScore !== a.cachedScore) {
        return b.cachedScore - a.cachedScore;
      }

      // Priority 7: Alphabetical by symbol
      return a.symbol.localeCompare(b.symbol);
    })
    .slice(0, limit); // Take only the requested number of results

  return {
    results,
    totalCount: results.length,
    query: searchTerm,
  };
}

export const GET = withErrorHandlingV2<SearchResponse>(getHandler);
