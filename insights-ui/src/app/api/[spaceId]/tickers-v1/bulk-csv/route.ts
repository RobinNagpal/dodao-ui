import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';
import { validateStockAnalyzeUrl } from '@/utils/stockAnalyzeUrlValidation';
import { AllExchanges } from '@/utils/countryExchangeUtils';

/** ---------- Types ---------- */

interface CsvTickerRow {
  exchange: string;
  name: string;
  symbol: string;
  websiteUrl?: string;
  stockAnalyzeUrl?: string;
  industryKey: string;
  subIndustryKey: string;
}

interface BulkCsvResponse {
  success: boolean;
  addedCount: number;
  skippedCount: number;
  errorRows: Array<{ symbol: string; exchange: string; reason: string }>;
}

/** ---------- POST ---------- */

async function postHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<BulkCsvResponse> {
  const { spaceId } = await context.params;
  const body = await req.json();

  const rows: CsvTickerRow[] = body?.tickers;

  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('Invalid request: expected { tickers: [...] }');
  }

  const errorRows: Array<{ symbol: string; exchange: string; reason: string }> = [];

  // Validate stockAnalyzeUrl for each row upfront
  const validRows: CsvTickerRow[] = [];
  for (const row of rows) {
    const symbol = (row.symbol ?? '').toUpperCase().trim();
    const exchange = (row.exchange ?? '').trim();

    if (!row.name || !symbol || !exchange || !row.industryKey || !row.subIndustryKey) {
      errorRows.push({
        symbol: symbol || '?',
        exchange: exchange || '?',
        reason: 'Missing required fields: name, symbol, exchange, industryKey, subIndustryKey',
      });
      continue;
    }

    if (row.stockAnalyzeUrl && row.stockAnalyzeUrl.trim()) {
      const validationError = validateStockAnalyzeUrl(symbol, exchange.toUpperCase() as AllExchanges, row.stockAnalyzeUrl.trim());
      if (validationError) {
        errorRows.push({ symbol, exchange, reason: `Invalid stockAnalyzeUrl: ${validationError}` });
        continue;
      }
    }

    validRows.push({ ...row, symbol, exchange });
  }

  if (validRows.length === 0) {
    return { success: false, addedCount: 0, skippedCount: errorRows.length, errorRows };
  }

  // Validate that all referenced industryKey / subIndustryKey pairs actually exist
  const uniqueIndustryKeys = [...new Set(validRows.map((r) => r.industryKey))];
  const uniqueSubIndustryPairs = [...new Set(validRows.map((r) => `${r.industryKey}|${r.subIndustryKey}`))];

  const [existingIndustries, existingSubIndustries] = await Promise.all([
    prisma.tickerV1Industry.findMany({
      where: { industryKey: { in: uniqueIndustryKeys } },
      select: { industryKey: true },
    }),
    prisma.tickerV1SubIndustry.findMany({
      where: {
        OR: uniqueSubIndustryPairs.map((pair) => {
          const [industryKey, subIndustryKey] = pair.split('|');
          return { industryKey, subIndustryKey };
        }),
      },
      select: { industryKey: true, subIndustryKey: true },
    }),
  ]);

  const validIndustryKeys = new Set(existingIndustries.map((i) => i.industryKey));
  const validSubIndustryPairs = new Set(existingSubIndustries.map((s) => `${s.industryKey}|${s.subIndustryKey}`));

  const relationCheckedRows: CsvTickerRow[] = [];
  for (const row of validRows) {
    if (!validIndustryKeys.has(row.industryKey)) {
      errorRows.push({ symbol: row.symbol, exchange: row.exchange, reason: `Industry key "${row.industryKey}" does not exist` });
      continue;
    }
    const subPair = `${row.industryKey}|${row.subIndustryKey}`;
    if (!validSubIndustryPairs.has(subPair)) {
      errorRows.push({
        symbol: row.symbol,
        exchange: row.exchange,
        reason: `Sub-industry key "${row.subIndustryKey}" does not exist under industry "${row.industryKey}"`,
      });
      continue;
    }
    relationCheckedRows.push(row);
  }

  if (relationCheckedRows.length === 0) {
    return { success: false, addedCount: 0, skippedCount: errorRows.length, errorRows };
  }

  // Find already-existing tickers to exclude from createMany
  const symbolExchangePairs = relationCheckedRows.map((r) => ({ symbol: r.symbol, exchange: r.exchange }));

  const existing = await prisma.tickerV1.findMany({
    where: {
      spaceId,
      OR: symbolExchangePairs.map(({ symbol, exchange }) => ({ symbol, exchange })),
    },
    select: { symbol: true, exchange: true },
  });

  const existingSet = new Set(existing.map((e) => `${e.symbol}|${e.exchange}`));

  const toInsert: Prisma.TickerV1CreateManyInput[] = [];
  for (const row of relationCheckedRows) {
    const key = `${row.symbol}|${row.exchange}`;
    if (existingSet.has(key)) {
      errorRows.push({ symbol: row.symbol, exchange: row.exchange, reason: `Ticker ${row.symbol} already exists on ${row.exchange}` });
    } else {
      toInsert.push({
        spaceId,
        name: row.name.trim(),
        symbol: row.symbol,
        exchange: row.exchange,
        industryKey: row.industryKey.trim(),
        subIndustryKey: row.subIndustryKey.trim(),
        websiteUrl: row.websiteUrl?.trim() || undefined,
        stockAnalyzeUrl: row.stockAnalyzeUrl?.trim() || '',
        createdBy: 'ui-user',
        updatedBy: 'ui-user',
      });
    }
  }

  let addedCount = 0;
  if (toInsert.length > 0) {
    const result = await prisma.tickerV1.createMany({
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

export const POST = withErrorHandlingV2<BulkCsvResponse>(postHandler);
