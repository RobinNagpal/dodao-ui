import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { ScenarioPricedInBucket } from '@/types/scenarioEnums';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { scenarioLinkCountryMismatch, serializeLinkMismatches } from '@/utils/scenario-country-validation';
import { parseStockScenariosMarkdown } from '@/utils/stock-scenario-markdown-parser';
import { revalidateStockScenarioBySlugTag, revalidateStockScenarioListingTag } from '@/utils/stock-scenario-cache-utils';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withLoggedInAdmin } from '../../helpers/withLoggedInAdmin';

const importScenariosSchema = z.object({
  markdown: z.string().min(10),
  fallbackOutlookDate: z.string().optional(),
});

export type ImportStockScenariosRequest = z.infer<typeof importScenariosSchema>;

export interface ImportStockScenariosResponse {
  totalParsed: number;
  created: number;
  updated: number;
  skipped: number;
  resolvedTickers: number;
  unresolvedTickers: string[];
  scenarios: Array<{
    scenarioNumber: number;
    title: string;
    slug: string;
    action: 'created' | 'updated' | 'skipped';
    countries: SupportedCountries[];
    note?: string;
  }>;
}

async function postHandler(request: NextRequest, _userContext: DoDaoJwtTokenPayload): Promise<ImportStockScenariosResponse> {
  const body = importScenariosSchema.parse(await request.json());
  const fallbackDate = body.fallbackOutlookDate ? new Date(body.fallbackOutlookDate) : new Date();

  const parsed = parseStockScenariosMarkdown(body.markdown, fallbackDate);
  if (parsed.length === 0) {
    throw new Error('No scenarios could be parsed from the provided markdown');
  }

  // Collect every (symbol, exchange) pair we'll try to resolve to a TickerV1 id.
  const pairs = Array.from(new Set(parsed.flatMap((s) => s.links.map((l) => `${l.symbol.toUpperCase()}|${l.exchange.toUpperCase()}`))));
  const knownTickers = pairs.length
    ? await prisma.tickerV1.findMany({
        where: {
          spaceId: KoalaGainsSpaceId,
          OR: pairs.map((p) => {
            const [symbol, exchange] = p.split('|');
            return { symbol, exchange };
          }),
        },
        select: { id: true, symbol: true, exchange: true },
      })
    : [];
  const tickerIdByKey = new Map<string, string>();
  for (const t of knownTickers) {
    tickerIdByKey.set(`${t.symbol.toUpperCase()}|${t.exchange.toUpperCase()}`, t.id);
  }

  const unresolved = new Set<string>();
  const results: ImportStockScenariosResponse['scenarios'] = [];
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const scenario of parsed) {
    const countries = scenario.countries;
    if (countries.length === 0) {
      skipped++;
      results.push({
        scenarioNumber: scenario.scenarioNumber,
        title: scenario.title,
        slug: scenario.slug,
        action: 'skipped',
        countries,
        note: 'No countries could be inferred — add an explicit `**Countries:** ...` line or include exchange-qualified tickers.',
      });
      continue;
    }

    const normalizedLinks = scenario.links.map((l) => ({
      symbol: l.symbol.toUpperCase(),
      exchange: l.exchange.toUpperCase(),
      role: l.role,
      sortOrder: l.sortOrder,
      roleExplanation: l.roleExplanation,
      expectedPriceChange: l.expectedPriceChange,
      expectedPriceChangeExplanation: l.expectedPriceChangeExplanation,
      pricedInBucket: l.pricedInBucket,
    }));
    const mismatches = scenarioLinkCountryMismatch(normalizedLinks, countries);
    if (mismatches.length) {
      skipped++;
      results.push({
        scenarioNumber: scenario.scenarioNumber,
        title: scenario.title,
        slug: scenario.slug,
        action: 'skipped',
        countries,
        note: `Link country mismatch: ${serializeLinkMismatches(mismatches)}`,
      });
      continue;
    }

    const existing = await prisma.stockScenario.findUnique({
      where: { spaceId_scenarioNumber: { spaceId: KoalaGainsSpaceId, scenarioNumber: scenario.scenarioNumber } },
    });

    const scenarioData = {
      scenarioNumber: scenario.scenarioNumber,
      title: scenario.title,
      slug: scenario.slug,
      underlyingCause: scenario.underlyingCause,
      historicalAnalog: scenario.historicalAnalog,
      outlookMarkdown: scenario.outlookMarkdown,
      direction: scenario.direction,
      timeframe: scenario.timeframe,
      probabilityBucket: scenario.probabilityBucket,
      probabilityPercentage: scenario.probabilityPercentage,
      countries,
      outlookAsOfDate: scenario.outlookAsOfDate,
      spaceId: KoalaGainsSpaceId,
    };

    const saved = await prisma.$transaction(async (tx) => {
      const row = existing
        ? await tx.stockScenario.update({ where: { id: existing.id }, data: scenarioData })
        : await tx.stockScenario.create({ data: scenarioData });

      if (existing) {
        await tx.stockScenarioStockLink.deleteMany({ where: { scenarioId: row.id } });
      }

      if (normalizedLinks.length) {
        await tx.stockScenarioStockLink.createMany({
          data: normalizedLinks.map((link) => {
            const key = `${link.symbol}|${link.exchange}`;
            const resolvedId = tickerIdByKey.get(key);
            if (!resolvedId) unresolved.add(key);
            return {
              scenarioId: row.id,
              tickerId: resolvedId ?? null,
              symbol: link.symbol,
              exchange: link.exchange,
              role: link.role,
              sortOrder: link.sortOrder,
              roleExplanation: link.roleExplanation,
              expectedPriceChange: link.expectedPriceChange,
              expectedPriceChangeExplanation: link.expectedPriceChangeExplanation,
              pricedInBucket: link.pricedInBucket ?? ScenarioPricedInBucket.PARTIALLY_PRICED_IN,
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
      countries,
    });
    if (existing) updated++;
    else created++;

    revalidateStockScenarioBySlugTag(saved.slug);
    if (existing && existing.slug !== saved.slug) {
      revalidateStockScenarioBySlugTag(existing.slug);
    }
  }

  revalidateStockScenarioListingTag();

  const resolvedTickers = pairs.filter((p) => tickerIdByKey.has(p)).length;

  return {
    totalParsed: parsed.length,
    created,
    updated,
    skipped,
    resolvedTickers,
    unresolvedTickers: Array.from(unresolved).sort(),
    scenarios: results,
  };
}

export const POST = withLoggedInAdmin<ImportStockScenariosResponse>(postHandler);
