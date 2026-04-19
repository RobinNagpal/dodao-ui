import { prisma } from '@/prisma';
import { revalidateEtfScenarioBySlugTag, revalidateEtfScenarioListingTag } from '@/utils/etf-scenario-cache-utils';
import { slugifyScenarioTitle } from '@/utils/etf-scenario-slug';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { EtfScenario } from '@prisma/client';
import { EtfScenarioDirection, EtfScenarioProbabilityBucket, EtfScenarioTimeframe } from '@/types/etfScenarioEnums';
import { NextRequest } from 'next/server';
import { withLoggedInAdmin } from '../../helpers/withLoggedInAdmin';
import { z } from 'zod';

const updateEtfScenarioSchema = z.object({
  scenarioNumber: z.number().int().positive().optional(),
  title: z.string().min(3).optional(),
  slug: z.string().min(3).optional(),
  underlyingCause: z.string().min(1).optional(),
  historicalAnalog: z.string().min(1).optional(),
  winnersMarkdown: z.string().min(1).optional(),
  losersMarkdown: z.string().min(1).optional(),
  outlookMarkdown: z.string().min(1).optional(),
  direction: z.nativeEnum(EtfScenarioDirection).optional(),
  timeframe: z.nativeEnum(EtfScenarioTimeframe).optional(),
  probabilityBucket: z.nativeEnum(EtfScenarioProbabilityBucket).optional(),
  probabilityPercentage: z.number().int().min(0).max(100).nullable().optional(),
  outlookAsOfDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'outlookAsOfDate must be an ISO date')
    .optional(),
  metaDescription: z.string().nullable().optional(),
  archived: z.boolean().optional(),
});

export type UpdateEtfScenarioRequest = z.infer<typeof updateEtfScenarioSchema>;

async function getHandler(_req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<EtfScenario | null> {
  const { id } = await params;
  return prisma.etfScenario.findUnique({ where: { id } });
}

async function putHandler(request: NextRequest, _userContext: DoDaoJwtTokenPayload, { params }: { params: Promise<{ id: string }> }): Promise<EtfScenario> {
  const { id } = await params;
  const body = updateEtfScenarioSchema.parse(await request.json());

  const existing = await prisma.etfScenario.findUnique({ where: { id } });
  if (!existing) {
    throw new Error(`Scenario not found: ${id}`);
  }

  const updated = await prisma.etfScenario.update({
    where: { id },
    data: {
      ...(body.scenarioNumber !== undefined && { scenarioNumber: body.scenarioNumber }),
      ...(body.title !== undefined && { title: body.title }),
      ...(body.slug !== undefined && { slug: body.slug.trim() || slugifyScenarioTitle(body.title ?? existing.title) }),
      ...(body.underlyingCause !== undefined && { underlyingCause: body.underlyingCause }),
      ...(body.historicalAnalog !== undefined && { historicalAnalog: body.historicalAnalog }),
      ...(body.winnersMarkdown !== undefined && { winnersMarkdown: body.winnersMarkdown }),
      ...(body.losersMarkdown !== undefined && { losersMarkdown: body.losersMarkdown }),
      ...(body.outlookMarkdown !== undefined && { outlookMarkdown: body.outlookMarkdown }),
      ...(body.direction !== undefined && { direction: body.direction }),
      ...(body.timeframe !== undefined && { timeframe: body.timeframe }),
      ...(body.probabilityBucket !== undefined && { probabilityBucket: body.probabilityBucket }),
      ...(body.probabilityPercentage !== undefined && { probabilityPercentage: body.probabilityPercentage }),
      ...(body.outlookAsOfDate !== undefined && { outlookAsOfDate: new Date(body.outlookAsOfDate) }),
      ...(body.metaDescription !== undefined && { metaDescription: body.metaDescription }),
      ...(body.archived !== undefined && { archived: body.archived }),
    },
  });

  revalidateEtfScenarioListingTag();
  revalidateEtfScenarioBySlugTag(existing.slug);
  if (updated.slug !== existing.slug) {
    revalidateEtfScenarioBySlugTag(updated.slug);
  }

  return updated;
}

async function deleteHandler(
  _request: NextRequest,
  _userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ id: string }> }
): Promise<{ success: boolean }> {
  const { id } = await params;

  const existing = await prisma.etfScenario.findUnique({ where: { id } });
  if (!existing) {
    throw new Error(`Scenario not found: ${id}`);
  }

  await prisma.etfScenario.delete({ where: { id } });

  revalidateEtfScenarioListingTag();
  revalidateEtfScenarioBySlugTag(existing.slug);

  return { success: true };
}

export const GET = withErrorHandlingV2<EtfScenario | null>(getHandler);
export const PUT = withLoggedInAdmin<EtfScenario>(putHandler);
export const DELETE = withLoggedInAdmin<{ success: boolean }>(deleteHandler);
