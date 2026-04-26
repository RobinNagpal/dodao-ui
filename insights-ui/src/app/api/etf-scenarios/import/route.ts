import { prisma } from '@/prisma';
import { revalidateEtfScenarioBySlugTag, revalidateEtfScenarioListingTag } from '@/utils/etf-scenario-cache-utils';
import { parseScenariosMarkdown } from '@/utils/etf-scenario-markdown-parser';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';
import { withLoggedInAdmin } from '../../helpers/withLoggedInAdmin';
import { z } from 'zod';

const importScenariosSchema = z.object({
  markdown: z.string().min(10),
  fallbackOutlookDate: z.string().optional(),
});

export type ImportEtfScenariosRequest = z.infer<typeof importScenariosSchema>;

export interface ImportEtfScenariosResponse {
  totalParsed: number;
  created: number;
  updated: number;
  resolvedTickers: number;
  unresolvedTickers: string[];
  scenarios: Array<{ scenarioNumber: number; title: string; slug: string; action: 'created' | 'updated' }>;
}

async function postHandler(request: NextRequest, _userContext: DoDaoJwtTokenPayload): Promise<ImportEtfScenariosResponse> {
  const body = importScenariosSchema.parse(await request.json());
  const fallbackDate = body.fallbackOutlookDate ? new Date(body.fallbackOutlookDate) : new Date();

  const parsed = parseScenariosMarkdown(body.markdown, fallbackDate);

  if (parsed.length === 0) {
    throw new Error('No scenarios could be parsed from the provided markdown');
  }

  // Collect all symbols we will try to resolve
  const allSymbols = Array.from(new Set(parsed.flatMap((s) => s.links.map((l) => l.symbol.toUpperCase()))));

  // Look up which of these symbols actually exist as ETFs we know about (any exchange)
  const knownEtfs = await prisma.etf.findMany({
    where: { spaceId: KoalaGainsSpaceId, symbol: { in: allSymbols } },
    select: { id: true, symbol: true, exchange: true },
  });

  const knownEtfBySymbol = new Map<string, { id: string; symbol: string; exchange: string }>();
  for (const etf of knownEtfs) {
    if (!knownEtfBySymbol.has(etf.symbol)) {
      knownEtfBySymbol.set(etf.symbol, etf);
    }
  }

  const unresolvedTickers = new Set<string>();
  const results: Array<{ scenarioNumber: number; title: string; slug: string; action: 'created' | 'updated' }> = [];
  let created = 0;
  let updated = 0;

  for (const scenario of parsed) {
    const existing = await prisma.etfScenario.findUnique({
      where: { spaceId_scenarioNumber: { spaceId: KoalaGainsSpaceId, scenarioNumber: scenario.scenarioNumber } },
    });

    const scenarioData = {
      scenarioNumber: scenario.scenarioNumber,
      title: scenario.title,
      slug: scenario.slug,
      underlyingCause: scenario.underlyingCause,
      historicalAnalog: scenario.historicalAnalog,
      winnersMarkdown: scenario.winnersMarkdown,
      losersMarkdown: scenario.losersMarkdown,
      outlookMarkdown: scenario.outlookMarkdown,
      direction: scenario.direction,
      timeframe: scenario.timeframe,
      probabilityBucket: scenario.probabilityBucket,
      probabilityPercentage: scenario.probabilityPercentage,
      outlookAsOfDate: scenario.outlookAsOfDate,
      countries: scenario.countries,
      spaceId: KoalaGainsSpaceId,
    };

    const saved = await prisma.$transaction(async (tx) => {
      const row = existing
        ? await tx.etfScenario.update({ where: { id: existing.id }, data: scenarioData })
        : await tx.etfScenario.create({ data: scenarioData });

      if (existing) {
        await tx.etfScenarioEtfLink.deleteMany({ where: { scenarioId: row.id } });
      }

      if (scenario.links.length) {
        await tx.etfScenarioEtfLink.createMany({
          data: scenario.links.map((link) => {
            const symbol = link.symbol.toUpperCase();
            const knownEtf = knownEtfBySymbol.get(symbol);
            if (!knownEtf) unresolvedTickers.add(symbol);
            // Prefer the exchange the markdown qualified (e.g. `TSX:HXQ`),
            // otherwise fall back to whatever exchange the known ETF lives on.
            const exchange = link.exchange?.toUpperCase() ?? knownEtf?.exchange ?? null;
            return {
              scenarioId: row.id,
              symbol,
              exchange,
              etfId: knownEtf?.id ?? null,
              role: link.role,
              sortOrder: link.sortOrder,
              spaceId: KoalaGainsSpaceId,
            };
          }),
          skipDuplicates: true,
        });
      }

      return row;
    });

    results.push({
      scenarioNumber: saved.scenarioNumber,
      title: saved.title,
      slug: saved.slug,
      action: existing ? 'updated' : 'created',
    });
    if (existing) updated++;
    else created++;

    revalidateEtfScenarioBySlugTag(saved.slug);
    if (existing && existing.slug !== saved.slug) {
      revalidateEtfScenarioBySlugTag(existing.slug);
    }
  }

  revalidateEtfScenarioListingTag();

  const resolvedTickers = allSymbols.filter((s) => knownEtfBySymbol.has(s)).length;

  return {
    totalParsed: parsed.length,
    created,
    updated,
    resolvedTickers,
    unresolvedTickers: Array.from(unresolvedTickers).sort(),
    scenarios: results,
  };
}

export const POST = withLoggedInAdmin<ImportEtfScenariosResponse>(postHandler);
