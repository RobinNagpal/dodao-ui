import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';

// Search HTSUS rows by description and return each match as a hierarchy
// chain: indent-0 root -> ... -> matched leaf row. The chain lets the UI
// render the result the way an HTSUS table reads on paper, so the user
// can see *why* a 10-digit code matched their product description.

export interface HtsSearchHierarchyNode {
  id: string;
  htsNumber: string | null;
  htsCode10: string | null;
  indent: number;
  description: string;
}

export interface HtsSearchResult {
  id: string;
  htsCode10: string;
  htsNumber: string;
  description: string;
  chapterNumber: number;
  chapterTitle: string;
  hierarchy: HtsSearchHierarchyNode[];
}

export interface HtsSearchResponse {
  query: string;
  results: HtsSearchResult[];
}

const MIN_QUERY_LENGTH = 2;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 25;

interface AncestorRow {
  id: string;
  htsNumber: string | null;
  htsCode10: string | null;
  indent: number;
  description: string;
  parentId: string | null;
}

function parseLimit(raw: string | null): number {
  const n = raw ? parseInt(raw, 10) : DEFAULT_LIMIT;
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_LIMIT;
  return Math.min(n, MAX_LIMIT);
}

// Load every ancestor we'll need in batched level-by-level queries. CSV
// indents max out at 6, so this loop runs at most six times regardless of
// how many leaf rows matched.
async function loadAncestors(rootIds: (string | null)[]): Promise<Map<string, AncestorRow>> {
  const byId = new Map<string, AncestorRow>();
  let toFetch = new Set<string>(rootIds.filter((x): x is string => x !== null));
  while (toFetch.size > 0) {
    const rows = await prisma.htsCode.findMany({
      where: { id: { in: Array.from(toFetch) } },
      select: { id: true, htsNumber: true, htsCode10: true, indent: true, description: true, parentId: true },
    });
    const next = new Set<string>();
    for (const r of rows) {
      byId.set(r.id, r);
      if (r.parentId && !byId.has(r.parentId)) next.add(r.parentId);
    }
    toFetch = next;
  }
  return byId;
}

function buildChain(parentId: string | null, ancestors: Map<string, AncestorRow>): HtsSearchHierarchyNode[] {
  const chain: HtsSearchHierarchyNode[] = [];
  let id = parentId;
  while (id) {
    const node = ancestors.get(id);
    if (!node) break;
    chain.unshift({
      id: node.id,
      htsNumber: node.htsNumber,
      htsCode10: node.htsCode10,
      indent: node.indent,
      description: node.description,
    });
    id = node.parentId;
  }
  return chain;
}

async function getHandler(req: NextRequest): Promise<HtsSearchResponse> {
  const url = new URL(req.url);
  const rawQuery = url.searchParams.get('q')?.trim() ?? '';
  const limit = parseLimit(url.searchParams.get('limit'));

  if (rawQuery.length < MIN_QUERY_LENGTH) {
    return { query: rawQuery, results: [] };
  }

  // Prefer leaf rows (htsCode10 set) — those are the only rows the
  // calculator can actually price. We look at description + htsNumber so
  // the user can paste either "frozen shrimp" or "0306.17".
  const looksLikeCode = /^\d{2}\.?\d{0,2}\.?\d{0,2}\.?\d{0,2}$/.test(rawQuery);
  const codeQuery = rawQuery.replace(/[.\s]/g, '');

  const where: Prisma.HtsCodeWhereInput = {
    spaceId: KoalaGainsSpaceId,
    htsCode10: { not: null },
    OR: looksLikeCode
      ? [{ htsCode10: { startsWith: codeQuery } }, { htsNumber: { contains: rawQuery, mode: 'insensitive' } }]
      : [{ description: { contains: rawQuery, mode: 'insensitive' } }],
  };

  const candidates = await prisma.htsCode.findMany({
    where,
    orderBy: [{ chapterId: 'asc' }, { sortOrder: 'asc' }],
    select: {
      id: true,
      htsCode10: true,
      htsNumber: true,
      description: true,
      indent: true,
      parentId: true,
      chapter: { select: { number: true, title: true } },
    },
    // Over-fetch so we can rank shorter/earlier matches above the limit.
    take: limit * 4,
  });

  const queryLower = rawQuery.toLowerCase();
  const ranked = candidates
    .map((row) => {
      const descIndex = row.description.toLowerCase().indexOf(queryLower);
      const codeMatchScore = looksLikeCode && row.htsCode10?.startsWith(codeQuery) ? -100 : 0;
      const descMatchScore = descIndex >= 0 ? descIndex : 9999;
      return { row, score: codeMatchScore + descMatchScore + row.description.length / 1000 };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((x) => x.row);

  const ancestors = await loadAncestors(ranked.map((r) => r.parentId));

  const results: HtsSearchResult[] = ranked.map((row) => ({
    id: row.id,
    htsCode10: row.htsCode10!,
    htsNumber: row.htsNumber ?? row.htsCode10!,
    description: row.description,
    chapterNumber: row.chapter.number,
    chapterTitle: row.chapter.title,
    hierarchy: [
      ...buildChain(row.parentId, ancestors),
      { id: row.id, htsNumber: row.htsNumber, htsCode10: row.htsCode10, indent: row.indent, description: row.description },
    ],
  }));

  return { query: rawQuery, results };
}

export const GET = withErrorHandlingV2<HtsSearchResponse>(getHandler);
