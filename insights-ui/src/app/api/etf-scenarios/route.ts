import { prisma } from '@/prisma';
import { revalidateEtfScenarioBySlugTag, revalidateEtfScenarioListingTag } from '@/utils/etf-scenario-cache-utils';
import { slugifyScenarioTitle } from '@/utils/etf-scenario-slug';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { EtfScenario } from '@prisma/client';
import { EtfScenarioDirection, EtfScenarioPricedInBucket, EtfScenarioProbabilityBucket, EtfScenarioRole, EtfScenarioTimeframe } from '@/types/etfScenarioEnums';
import { EtfSupportedCountry, isEtfExchange, isEtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { etfScenarioLinkCountryMismatch, serializeEtfLinkMismatches } from '@/utils/etf-scenario-country-validation';
import { NextRequest } from 'next/server';
import { withAdminOrToken } from '../helpers/withAdminOrToken';
import { z } from 'zod';

const createEtfScenarioSchema = z.object({
  scenarioNumber: z.number().int().positive(),
  title: z.string().min(3),
  slug: z.string().min(3).optional(),
  underlyingCause: z.string().min(1),
  historicalAnalog: z.string().min(1),
  outlookMarkdown: z.string().min(1),
  detailedAnalysis: z.string().nullable().optional(),
  direction: z.nativeEnum(EtfScenarioDirection),
  timeframe: z.nativeEnum(EtfScenarioTimeframe),
  probabilityBucket: z.nativeEnum(EtfScenarioProbabilityBucket),
  probabilityPercentage: z.number().int().min(0).max(100).nullable().optional(),
  pricedInBucket: z.nativeEnum(EtfScenarioPricedInBucket).optional(),
  expectedPriceChange: z.number().int().min(-100).max(100).nullable().optional(),
  expectedPriceChangeExplanation: z.string().nullable().optional(),
  priceChangeTimeframeExplanation: z.string().nullable().optional(),
  outlookAsOfDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'outlookAsOfDate must be an ISO date'),
  metaDescription: z.string().nullable().optional(),
  archived: z.boolean().optional(),
  // Countries the scenario is scoped to. ETF coverage is currently US + Canada;
  // we validate against ETF_SUPPORTED_COUNTRIES (a subset of stock's
  // SupportedCountries) so admins can't create scenarios in markets we don't
  // ship ETF data for.
  countries: z
    .array(z.string().refine((v) => isEtfSupportedCountry(v), 'country must be one of the supported ETF countries (US / Canada)'))
    .min(1, 'at least one country must be declared'),
  links: z
    .array(
      z.object({
        symbol: z.string().min(1),
        // Exchange is required and must belong to the ETF-specific exchange
        // surface (see etfCountryExchangeUtils.ETF_EXCHANGES). The link's
        // exchange country must also be in scenario.countries — enforced
        // below via etfScenarioLinkCountryMismatch.
        exchange: z
          .string()
          .min(1, 'exchange is required on ETF scenario links')
          .refine((v) => isEtfExchange(v.toUpperCase()), 'exchange must be one of the supported ETF exchanges'),
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

  const normalizedLinks = (body.links ?? []).map((l) => ({
    ...l,
    symbol: l.symbol.toUpperCase(),
    exchange: l.exchange.toUpperCase(),
  }));

  const scenarioCountries = body.countries as EtfSupportedCountry[];
  const mismatches = etfScenarioLinkCountryMismatch(normalizedLinks, scenarioCountries);
  if (mismatches.length > 0) {
    throw new Error(`Link country mismatch: ${serializeEtfLinkMismatches(mismatches)}. Fix the scenario's countries[] or the link's exchange, then retry.`);
  }

  const commonData = {
    scenarioNumber: body.scenarioNumber,
    title: body.title,
    underlyingCause: body.underlyingCause,
    historicalAnalog: body.historicalAnalog,
    outlookMarkdown: body.outlookMarkdown,
    detailedAnalysis: body.detailedAnalysis ?? null,
    direction: body.direction,
    timeframe: body.timeframe,
    probabilityBucket: body.probabilityBucket,
    probabilityPercentage: body.probabilityPercentage ?? null,
    pricedInBucket: body.pricedInBucket ?? EtfScenarioPricedInBucket.PARTIALLY_PRICED_IN,
    expectedPriceChange: body.expectedPriceChange ?? null,
    expectedPriceChangeExplanation: body.expectedPriceChangeExplanation ?? null,
    priceChangeTimeframeExplanation: body.priceChangeTimeframeExplanation ?? null,
    outlookAsOfDate: new Date(body.outlookAsOfDate),
    metaDescription: body.metaDescription ?? null,
    archived: body.archived ?? false,
    countries: scenarioCountries,
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
