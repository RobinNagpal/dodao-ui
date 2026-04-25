import { prisma } from '@/prisma';
import { revalidateEtfScenarioBySlugTag, revalidateEtfScenarioListingTag } from '@/utils/etf-scenario-cache-utils';
import { slugifyScenarioTitle } from '@/utils/etf-scenario-slug';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { EtfScenario } from '@prisma/client';
import { EtfScenarioDirection, EtfScenarioPricedInBucket, EtfScenarioProbabilityBucket, EtfScenarioRole, EtfScenarioTimeframe } from '@/types/etfScenarioEnums';
import { isExchange, SupportedCountries } from '@/utils/countryExchangeUtils';
import { scenarioLinkCountryMismatch, serializeLinkMismatches } from '@/utils/scenario-country-validation';
import { NextRequest } from 'next/server';
import { withAdminOrToken } from '../helpers/withAdminOrToken';
import { z } from 'zod';

const createEtfScenarioSchema = z.object({
  scenarioNumber: z.number().int().positive(),
  title: z.string().min(3),
  slug: z.string().min(3).optional(),
  underlyingCause: z.string().min(1),
  historicalAnalog: z.string().min(1),
  winnersMarkdown: z.string().min(1),
  losersMarkdown: z.string().min(1),
  outlookMarkdown: z.string().min(1),
  direction: z.nativeEnum(EtfScenarioDirection),
  timeframe: z.nativeEnum(EtfScenarioTimeframe),
  probabilityBucket: z.nativeEnum(EtfScenarioProbabilityBucket),
  probabilityPercentage: z.number().int().min(0).max(100).nullable().optional(),
  pricedInBucket: z.nativeEnum(EtfScenarioPricedInBucket).optional(),
  expectedPriceChange: z.number().int().min(-100).max(100).nullable().optional(),
  expectedPriceChangeExplanation: z.string().nullable().optional(),
  priceChangeTimeframeExplanation: z.string().nullable().optional(),
  countries: z.array(z.nativeEnum(SupportedCountries)).min(1, 'countries[] must list at least one supported country'),
  outlookAsOfDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'outlookAsOfDate must be an ISO date'),
  metaDescription: z.string().nullable().optional(),
  archived: z.boolean().optional(),
  links: z
    .array(
      z.object({
        symbol: z.string().min(1),
        // Exchange is required so that we can map every link to a country and
        // verify it falls inside scenario.countries[]. The same enum is used
        // for stock-scenario links (see countryExchangeUtils.EXCHANGES).
        exchange: z
          .string()
          .min(1, 'exchange is required on ETF scenario links')
          .refine((v) => isExchange(v.toUpperCase()), 'exchange must be one of the supported exchanges'),
        role: z.nativeEnum(EtfScenarioRole),
        sortOrder: z.number().int().nonnegative().optional(),
        roleExplanation: z.string().nullable().optional(),
        expectedPriceChange: z.number().int().min(-100).max(100).nullable().optional(),
        expectedPriceChangeExplanation: z.string().nullable().optional(),
      })
    )
    .optional(),
});

export type CreateEtfScenarioRequest = z.infer<typeof createEtfScenarioSchema>;

async function getHandler(): Promise<EtfScenario[]> {
  return prisma.etfScenario.findMany({
    where: { spaceId: KoalaGainsSpaceId },
    orderBy: [{ scenarioNumber: 'asc' }],
  });
}

async function postHandler(request: NextRequest, _userContext: KoalaGainsJwtTokenPayload | null, _dynamic: { params: Promise<any> }): Promise<EtfScenario> {
  const body = createEtfScenarioSchema.parse(await request.json());

  const slug = body.slug?.trim() || slugifyScenarioTitle(body.title);

  // Validate every link's exchange resolves to a country in scenario.countries[].
  // Mirrors the stock-scenario flow: aggregate all mismatches into one error
  // so admins can fix the whole scenario in one pass.
  const normalizedLinks = (body.links ?? []).map((l) => ({
    ...l,
    symbol: l.symbol.toUpperCase(),
    exchange: l.exchange.toUpperCase(),
  }));
  const mismatches = scenarioLinkCountryMismatch(normalizedLinks, body.countries);
  if (mismatches.length) {
    throw new Error(`Link country mismatch: ${serializeLinkMismatches(mismatches)}. Fix the scenario's countries[] or the link's exchange, then retry.`);
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
    pricedInBucket: body.pricedInBucket ?? EtfScenarioPricedInBucket.PARTIALLY_PRICED_IN,
    expectedPriceChange: body.expectedPriceChange ?? null,
    expectedPriceChangeExplanation: body.expectedPriceChangeExplanation ?? null,
    priceChangeTimeframeExplanation: body.priceChangeTimeframeExplanation ?? null,
    countries: body.countries,
    outlookAsOfDate: new Date(body.outlookAsOfDate),
    metaDescription: body.metaDescription ?? null,
    archived: body.archived ?? false,
  };

  const knownEtfs = normalizedLinks.length
    ? await prisma.etf.findMany({
        where: {
          spaceId: KoalaGainsSpaceId,
          OR: normalizedLinks.map((l) => ({ symbol: l.symbol, exchange: l.exchange })),
        },
        select: { id: true, symbol: true, exchange: true },
      })
    : [];
  const knownEtfByKey = new Map<string, { id: string; symbol: string; exchange: string }>();
  for (const etf of knownEtfs) {
    knownEtfByKey.set(`${etf.symbol.toUpperCase()}|${etf.exchange.toUpperCase()}`, etf);
  }

  const saved = await prisma.$transaction(async (tx) => {
    const scenario = await tx.etfScenario.upsert({
      where: { spaceId_slug: { spaceId: KoalaGainsSpaceId, slug } },
      create: {
        id: slug,
        slug,
        spaceId: KoalaGainsSpaceId,
        ...commonData,
      },
      update: commonData,
    });

    await tx.etfScenarioEtfLink.deleteMany({ where: { scenarioId: scenario.id } });

    if (normalizedLinks.length) {
      await tx.etfScenarioEtfLink.createMany({
        data: normalizedLinks.map((link, idx) => {
          const knownEtf = knownEtfByKey.get(`${link.symbol}|${link.exchange}`);
          return {
            scenarioId: scenario.id,
            symbol: link.symbol,
            exchange: link.exchange,
            etfId: knownEtf?.id ?? null,
            role: link.role,
            sortOrder: link.sortOrder ?? idx,
            roleExplanation: link.roleExplanation ?? null,
            expectedPriceChange: link.expectedPriceChange ?? null,
            expectedPriceChangeExplanation: link.expectedPriceChangeExplanation ?? null,
            spaceId: KoalaGainsSpaceId,
          };
        }),
        skipDuplicates: true,
      });
    }

    return scenario;
  });

  revalidateEtfScenarioListingTag();
  revalidateEtfScenarioBySlugTag(saved.slug);
  return saved;
}

export const GET = withErrorHandlingV2<EtfScenario[]>(getHandler);
export const POST = withAdminOrToken<EtfScenario>(postHandler);
