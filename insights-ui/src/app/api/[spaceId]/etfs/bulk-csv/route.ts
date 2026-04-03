import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';

/** ---------- Types ---------- */

interface EtfCsvRow {
  symbol: string;
  name: string;
  exchange: string;
  provider?: string;
  segment?: string;
}

interface BulkEtfCsvResponse {
  success: boolean;
  addedCount: number;
  skippedCount: number;
  errorRows: Array<{ symbol: string; exchange: string; reason: string }>;
}

/** ---------- POST ---------- */

async function postHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<BulkEtfCsvResponse> {
  const { spaceId } = await context.params;
  const body = await req.json();

  const rows: EtfCsvRow[] = body?.etfs;

  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('Invalid request: expected { etfs: [...] }');
  }

  const errorRows: Array<{ symbol: string; exchange: string; reason: string }> = [];

  // Validate each row
  const validRows: EtfCsvRow[] = [];
  for (const row of rows) {
    const symbol = (row.symbol ?? '').toUpperCase().trim();
    const exchange = (row.exchange ?? '').trim();
    const name = (row.name ?? '').trim();

    if (!symbol || !exchange || !name) {
      errorRows.push({
        symbol: symbol || '?',
        exchange: exchange || '?',
        reason: 'Missing required fields: symbol, name, exchange',
      });
      continue;
    }

    validRows.push({
      symbol,
      exchange,
      name,
      provider: row.provider?.trim() || undefined,
      segment: row.segment?.trim() || undefined,
    });
  }

  if (validRows.length === 0) {
    return { success: false, addedCount: 0, skippedCount: errorRows.length, errorRows };
  }

  // Find already-existing ETFs to exclude from createMany
  const symbolExchangePairs = validRows.map((r) => ({ symbol: r.symbol, exchange: r.exchange }));

  const existing = await prisma.etf.findMany({
    where: {
      spaceId,
      OR: symbolExchangePairs.map(({ symbol, exchange }) => ({ symbol, exchange })),
    },
    select: { symbol: true, exchange: true },
  });

  const existingSet = new Set(existing.map((e) => `${e.symbol}|${e.exchange}`));

  const toInsert: Prisma.EtfCreateManyInput[] = [];
  for (const row of validRows) {
    const key = `${row.symbol}|${row.exchange}`;
    if (existingSet.has(key)) {
      errorRows.push({
        symbol: row.symbol,
        exchange: row.exchange,
        reason: `ETF ${row.symbol} already exists on ${row.exchange}`,
      });
    } else {
      toInsert.push({
        spaceId,
        symbol: row.symbol,
        name: row.name,
        exchange: row.exchange,
        provider: row.provider || '',
        segment: row.segment || undefined,
        createdBy: 'ui-user',
        updatedBy: 'ui-user',
      });
    }
  }

  let addedCount = 0;
  if (toInsert.length > 0) {
    const result = await prisma.etf.createMany({
      data: toInsert,
      skipDuplicates: true,
    });
    addedCount = result.count;
  }

  return {
    success: addedCount > 0,
    addedCount,
    skippedCount: errorRows.length,
    errorRows,
  };
}

export const POST = withErrorHandlingV2<BulkEtfCsvResponse>(postHandler);
