import { prisma } from '@/prisma';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { ScenarioDirection, ScenarioPricedInBucket, ScenarioProbabilityBucket, ScenarioRole, ScenarioTimeframe } from '@/types/scenarioEnums';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { scenarioLinkCountryMismatch, serializeLinkMismatches } from '@/utils/scenario-country-validation';
import { slugifyScenarioTitle } from '@/utils/scenario-slug';
import { revalidateStockScenarioBySlugTag, revalidateStockScenarioListingTag } from '@/utils/stock-scenario-cache-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { StockScenario } from '@prisma/client';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withAdminOrToken } from '../helpers/withAdminOrToken';

const createStockScenarioSchema = z.object({
  scenarioNumber: z.number().int().positive(),
  title: z.string().min(3),
  slug: z.string().min(3).optional(),
  underlyingCause: z.string().min(1),
  historicalAnalog: z.string().min(1),
  winnersMarkdown: z.string().min(1),
  losersMarkdown: z.string().min(1),
  outlookMarkdown: z.string().min(1),
  direction: z.nativeEnum(ScenarioDirection),
  timeframe: z.nativeEnum(ScenarioTimeframe),
  probabilityBucket: z.nativeEnum(ScenarioProbabilityBucket),
  probabilityPercentage: z.number().int().min(0).max(100).nullable().optional(),
  pricedInBucket: z.nativeEnum(ScenarioPricedInBucket).optional(),
  expectedPriceChange: z.number().int().min(-100).max(100).nullable().optional(),
  expectedPriceChangeExplanation: z.string().nullable().optional(),
  priceChangeTimeframeExplanation: z.string().nullable().optional(),
  countries: z
    .array(z.nativeEnum(SupportedCountries))
    .min(1, 'countries[] must list at least one supported country'),
  outlookAsOfDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'outlookAsOfDate must be an ISO date'),
  metaDescription: z.string().nullable().optional(),
  archived: z.boolean().optional(),
  links: z
    .array(
      z.object({
        symbol: z.string().min(1),
        exchange: z.string().min(1, 'exchange is required on stock scenario links'),
        role: z.nativeEnum(ScenarioRole),
        sortOrder: z.number().int().nonnegative().optional(),
        roleExplanation: z.string().nullable().optional(),
        expectedPriceChange: z.number().int().min(-100).max(100).nullable().optional(),
        expectedPriceChangeExplanation: z.string().nullable().optional(),
      })
    )
    .optional(),
});

export type CreateStockScenarioRequest = z.infer<typeof createStockScenarioSchema>;

async function getHandler(): Promise<StockScenario[]> {
  return prisma.stockScenario.findMany({
    where: { spaceId: KoalaGainsSpaceId },
    orderBy: [{ scenarioNumber: 'asc' }],
  });
}

async function postHandler(
  request: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload | null,
  _dynamic: { params: Promise<unknown> }
): Promise<StockScenario> {
  const body = createStockScenarioSchema.parse(await request.json());

  const slug = body.slug?.trim() || slugifyScenarioTitle(body.title);

  // Validate that every link's exchange is (a) a known exchange and (b) maps
  // to a country present in scenario.countries[]. Mismatches are aggregated
  // and returned to the caller so they can fix all of them at once.
  const normalizedLinks = (body.links ?? []).map((l) => ({
    ...l,
    symbol: l.symbol.toUpperCase(),
    exchange: l.exchange.toUpperCase(),
  }));
  const mismatches = scenarioLinkCountryMismatch(normalizedLinks, body.countries);
  if (mismatches.length) {
    throw new Error(
      `Link country mismatch: ${serializeLinkMismatches(mismatches)}. Fix the scenario's countries[] or the link's exchange, then retry.`
    );
  }

  // Resolve (symbol, exchange) to a TickerV1 id when possible.
  const lookupKeys = Array.from(new Set(normalizedLinks.map((l) => `${l.symbol}|${l.exchange}`)));
  const knownTickers = lookupKeys.length
    ? await prisma.tickerV1.findMany({
        where: {
          spaceId: KoalaGainsSpaceId,
          OR: normalizedLinks.map((l) => ({ symbol: l.symbol, exchange: l.exchange })),
        },
        select: { id: true, symbol: true, exchange: true },
      })
    : [];
  const tickerIdByKey = new Map<string, string>();
  for (const t of knownTickers) {
    tickerIdByKey.set(`${t.symbol.toUpperCase()}|${t.exchange.toUpperCase()}`, t.id);
  }

  const commonData = {
    scenarioNumber: body.scenarioNumber,
    title: body.title,
    underlyingCause: body.underlyingCause,
    historicalAnalog: body.historicalAnalog,
    winnersMarkdown: body.winnersMarkdown,
    losersMarkdown: body.losersMarkdown,
    outlookMarkdown: body.outlookMarkdown,
    direction: body.direction,
    timeframe: body.timeframe,
    probabilityBucket: body.probabilityBucket,
    probabilityPercentage: body.probabilityPercentage ?? null,
    pricedInBucket: body.pricedInBucket ?? ScenarioPricedInBucket.PARTIALLY_PRICED_IN,
    expectedPriceChange: body.expectedPriceChange ?? null,
    expectedPriceChangeExplanation: body.expectedPriceChangeExplanation ?? null,
    priceChangeTimeframeExplanation: body.priceChangeTimeframeExplanation ?? null,
    countries: body.countries,
    outlookAsOfDate: new Date(body.outlookAsOfDate),
    metaDescription: body.metaDescription ?? null,
    archived: body.archived ?? false,
  };

  const saved = await prisma.$transaction(async (tx) => {
    const scenario = await tx.stockScenario.upsert({
      where: { spaceId_slug: { spaceId: KoalaGainsSpaceId, slug } },
      create: {
        id: slug,
        slug,
        spaceId: KoalaGainsSpaceId,
        ...commonData,
      },
      update: commonData,
    });

    await tx.stockScenarioStockLink.deleteMany({ where: { scenarioId: scenario.id } });

    if (normalizedLinks.length) {
      await tx.stockScenarioStockLink.createMany({
        data: normalizedLinks.map((link, idx) => ({
          scenarioId: scenario.id,
          tickerId: tickerIdByKey.get(`${link.symbol}|${link.exchange}`) ?? null,
          symbol: link.symbol,
          exchange: link.exchange,
          role: link.role,
          sortOrder: link.sortOrder ?? idx,
          roleExplanation: link.roleExplanation ?? null,
          expectedPriceChange: link.expectedPriceChange ?? null,
          expectedPriceChangeExplanation: link.expectedPriceChangeExplanation ?? null,
          spaceId: KoalaGainsSpaceId,
        })),
        skipDuplicates: true,
      });
    }

    return scenario;
  });

  revalidateStockScenarioListingTag();
  revalidateStockScenarioBySlugTag(saved.slug);
  return saved;
}

export const GET = withErrorHandlingV2<StockScenario[]>(getHandler);
export const POST = withAdminOrToken<StockScenario>(postHandler);
