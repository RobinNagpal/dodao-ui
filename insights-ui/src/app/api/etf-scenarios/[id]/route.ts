import { prisma } from '@/prisma';
import { revalidateEtfScenarioBySlugTag, revalidateEtfScenarioListingTag } from '@/utils/etf-scenario-cache-utils';
import { slugifyScenarioTitle } from '@/utils/etf-scenario-slug';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { EtfScenario } from '@prisma/client';
import { EtfScenarioDirection, EtfScenarioPricedInBucket, EtfScenarioProbabilityBucket, EtfScenarioTimeframe } from '@/types/etfScenarioEnums';
import { isEtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { NextRequest } from 'next/server';
import { withAdminOrToken } from '../../helpers/withAdminOrToken';
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
  pricedInBucket: z.nativeEnum(EtfScenarioPricedInBucket).optional(),
  expectedPriceChange: z.number().int().min(-100).max(100).nullable().optional(),
  expectedPriceChangeExplanation: z.string().nullable().optional(),
  priceChangeTimeframeExplanation: z.string().nullable().optional(),
  outlookAsOfDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'outlookAsOfDate must be an ISO date')
    .optional(),
  metaDescription: z.string().nullable().optional(),
  archived: z.boolean().optional(),
  // Updating countries does not re-validate existing links here — the link
  // mismatch check is enforced on link create/update routes. Admins narrowing
  // the scope (e.g. dropping US) should expect existing US links to start
  // throwing on subsequent edits until they're cleaned up.
  countries: z
    .array(z.string().refine((v) => isEtfSupportedCountry(v), 'country must be one of the supported ETF countries (US / Canada)'))
    .min(1)
    .optional(),
});

export type UpdateEtfScenarioRequest = z.infer<typeof updateEtfScenarioSchema>;

async function getHandler(_req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<EtfScenario | null> {
  const { id } = await params;
  return prisma.etfScenario.findUnique({ where: { id } });
}

async function putHandler(
  request: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload | null,
  { params }: { params: Promise<{ id: string }> }
): Promise<EtfScenario> {
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
      ...(body.pricedInBucket !== undefined && { pricedInBucket: body.pricedInBucket }),
      ...(body.expectedPriceChange !== undefined && { expectedPriceChange: body.expectedPriceChange }),
      ...(body.expectedPriceChangeExplanation !== undefined && { expectedPriceChangeExplanation: body.expectedPriceChangeExplanation }),
      ...(body.priceChangeTimeframeExplanation !== undefined && { priceChangeTimeframeExplanation: body.priceChangeTimeframeExplanation }),
      ...(body.outlookAsOfDate !== undefined && { outlookAsOfDate: new Date(body.outlookAsOfDate) }),
      ...(body.metaDescription !== undefined && { metaDescription: body.metaDescription }),
      ...(body.archived !== undefined && { archived: body.archived }),
      ...(body.countries !== undefined && { countries: body.countries }),
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
  _userContext: KoalaGainsJwtTokenPayload | null,
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
export const PUT = withAdminOrToken<EtfScenario>(putHandler);
export const DELETE = withAdminOrToken<{ success: boolean }>(deleteHandler);
