import { prisma } from '@/prisma';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { ScenarioDirection, ScenarioPricedInBucket, ScenarioProbabilityBucket, ScenarioTimeframe } from '@/types/scenarioEnums';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { revalidateStockScenarioBySlugTag, revalidateStockScenarioListingTag } from '@/utils/stock-scenario-cache-utils';
import { slugifyScenarioTitle } from '@/utils/scenario-slug';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { StockScenario } from '@prisma/client';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withAdminOrToken } from '../../helpers/withAdminOrToken';

const updateStockScenarioSchema = z.object({
  scenarioNumber: z.number().int().positive().optional(),
  title: z.string().min(3).optional(),
  slug: z.string().min(3).optional(),
  underlyingCause: z.string().min(1).optional(),
  historicalAnalog: z.string().min(1).optional(),
  winnersMarkdown: z.string().min(1).optional(),
  losersMarkdown: z.string().min(1).optional(),
  outlookMarkdown: z.string().min(1).optional(),
  direction: z.nativeEnum(ScenarioDirection).optional(),
  timeframe: z.nativeEnum(ScenarioTimeframe).optional(),
  probabilityBucket: z.nativeEnum(ScenarioProbabilityBucket).optional(),
  probabilityPercentage: z.number().int().min(0).max(100).nullable().optional(),
  pricedInBucket: z.nativeEnum(ScenarioPricedInBucket).optional(),
  expectedPriceChange: z.number().int().min(-100).max(100).nullable().optional(),
  expectedPriceChangeExplanation: z.string().nullable().optional(),
  priceChangeTimeframeExplanation: z.string().nullable().optional(),
  countries: z.array(z.nativeEnum(SupportedCountries)).min(1).optional(),
  outlookAsOfDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'outlookAsOfDate must be an ISO date')
    .optional(),
  metaDescription: z.string().nullable().optional(),
  archived: z.boolean().optional(),
});

export type UpdateStockScenarioRequest = z.infer<typeof updateStockScenarioSchema>;

async function getHandler(_req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<StockScenario | null> {
  const { id } = await params;
  return prisma.stockScenario.findUnique({ where: { id } });
}

async function putHandler(
  request: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload | null,
  { params }: { params: Promise<{ id: string }> }
): Promise<StockScenario> {
  const { id } = await params;
  const body = updateStockScenarioSchema.parse(await request.json());

  const existing = await prisma.stockScenario.findUnique({ where: { id } });
  if (!existing) {
    throw new Error(`Scenario not found: ${id}`);
  }

  // Partial update: only touch fields that the caller actually sent.
  const updated = await prisma.stockScenario.update({
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
      ...(body.countries !== undefined && { countries: body.countries }),
      ...(body.outlookAsOfDate !== undefined && { outlookAsOfDate: new Date(body.outlookAsOfDate) }),
      ...(body.metaDescription !== undefined && { metaDescription: body.metaDescription }),
      ...(body.archived !== undefined && { archived: body.archived }),
    },
  });

  revalidateStockScenarioListingTag();
  revalidateStockScenarioBySlugTag(existing.slug);
  if (updated.slug !== existing.slug) {
    revalidateStockScenarioBySlugTag(updated.slug);
  }

  return updated;
}

async function deleteHandler(
  _request: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload | null,
  { params }: { params: Promise<{ id: string }> }
): Promise<{ success: boolean }> {
  const { id } = await params;

  const existing = await prisma.stockScenario.findUnique({ where: { id } });
  if (!existing) {
    throw new Error(`Scenario not found: ${id}`);
  }

  await prisma.stockScenario.delete({ where: { id } });

  revalidateStockScenarioListingTag();
  revalidateStockScenarioBySlugTag(existing.slug);

  return { success: true };
}

export const GET = withErrorHandlingV2<StockScenario | null>(getHandler);
export const PUT = withAdminOrToken<StockScenario>(putHandler);
export const DELETE = withAdminOrToken<{ success: boolean }>(deleteHandler);
