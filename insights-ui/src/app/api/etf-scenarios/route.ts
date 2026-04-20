import { prisma } from '@/prisma';
import { revalidateEtfScenarioListingTag } from '@/utils/etf-scenario-cache-utils';
import { slugifyScenarioTitle } from '@/utils/etf-scenario-slug';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { EtfScenario } from '@prisma/client';
import { EtfScenarioDirection, EtfScenarioProbabilityBucket, EtfScenarioRole, EtfScenarioTimeframe } from '@/types/etfScenarioEnums';
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

  const created = await prisma.$transaction(async (tx) => {
    const scenario = await tx.etfScenario.create({
      data: {
        scenarioNumber: body.scenarioNumber,
        title: body.title,
        slug,
        underlyingCause: body.underlyingCause,
        historicalAnalog: body.historicalAnalog,
        winnersMarkdown: body.winnersMarkdown,
        losersMarkdown: body.losersMarkdown,
        outlookMarkdown: body.outlookMarkdown,
        direction: body.direction,
        timeframe: body.timeframe,
        probabilityBucket: body.probabilityBucket,
        probabilityPercentage: body.probabilityPercentage ?? null,
        outlookAsOfDate: new Date(body.outlookAsOfDate),
        metaDescription: body.metaDescription ?? null,
        archived: body.archived ?? false,
        spaceId: KoalaGainsSpaceId,
      },
    });

    if (body.links?.length) {
      await tx.etfScenarioEtfLink.createMany({
        data: body.links.map((link, idx) => ({
          scenarioId: scenario.id,
          symbol: link.symbol.toUpperCase(),
          exchange: link.exchange ?? null,
          role: link.role,
          sortOrder: link.sortOrder ?? idx,
          spaceId: KoalaGainsSpaceId,
        })),
        skipDuplicates: true,
      });
    }

    return scenario;
  });

  revalidateEtfScenarioListingTag();
  return created;
}

export const GET = withErrorHandlingV2<EtfScenario[]>(getHandler);
export const POST = withAdminOrToken<EtfScenario>(postHandler);
