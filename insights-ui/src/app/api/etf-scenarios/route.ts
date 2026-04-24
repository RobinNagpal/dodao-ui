import { prisma } from '@/prisma';
import { revalidateEtfScenarioBySlugTag, revalidateEtfScenarioListingTag } from '@/utils/etf-scenario-cache-utils';
import { slugifyScenarioTitle } from '@/utils/etf-scenario-slug';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { EtfScenario } from '@prisma/client';
import { EtfScenarioDirection, EtfScenarioPricedInBucket, EtfScenarioProbabilityBucket, EtfScenarioRole, EtfScenarioTimeframe } from '@/types/etfScenarioEnums';
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
  outlookAsOfDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'outlookAsOfDate must be an ISO date'),
  metaDescription: z.string().nullable().optional(),
  archived: z.boolean().optional(),
  links: z
    .array(
      z.object({
        symbol: z.string().min(1),
        exchange: z.string().nullable().optional(),
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
    outlookAsOfDate: new Date(body.outlookAsOfDate),
    metaDescription: body.metaDescription ?? null,
    archived: body.archived ?? false,
  };

  const symbols = Array.from(new Set((body.links ?? []).map((l) => l.symbol.toUpperCase())));
  const knownEtfs = symbols.length
    ? await prisma.etf.findMany({
        where: { spaceId: KoalaGainsSpaceId, symbol: { in: symbols } },
        select: { id: true, symbol: true, exchange: true },
      })
    : [];
  const knownEtfBySymbol = new Map<string, { id: string; symbol: string; exchange: string }>();
  for (const etf of knownEtfs) {
    if (!knownEtfBySymbol.has(etf.symbol)) knownEtfBySymbol.set(etf.symbol, etf);
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

    if (body.links?.length) {
      await tx.etfScenarioEtfLink.createMany({
        data: body.links.map((link, idx) => {
          const symbol = link.symbol.toUpperCase();
          const knownEtf = knownEtfBySymbol.get(symbol);
          return {
            scenarioId: scenario.id,
            symbol,
            exchange: knownEtf?.exchange ?? link.exchange ?? null,
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
