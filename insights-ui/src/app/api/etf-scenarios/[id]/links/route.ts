import { prisma } from '@/prisma';
import { revalidateEtfScenarioBySlugTag, revalidateEtfScenarioListingTag } from '@/utils/etf-scenario-cache-utils';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { isExchange, SupportedCountries } from '@/utils/countryExchangeUtils';
import { scenarioLinkCountryMismatch, serializeLinkMismatches } from '@/utils/scenario-country-validation';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { EtfScenarioEtfLink } from '@prisma/client';
import { EtfScenarioRole } from '@/types/etfScenarioEnums';
import { NextRequest } from 'next/server';
import { withLoggedInAdmin } from '../../../helpers/withLoggedInAdmin';
import { z } from 'zod';

const addLinkSchema = z.object({
  symbol: z.string().min(1),
  // Exchange is required so every link maps to a country we can validate
  // against the scenario's countries[]. Same enum the stock-scenario links use.
  exchange: z
    .string()
    .min(1, 'exchange is required on ETF scenario links')
    .refine((v) => isExchange(v.toUpperCase()), 'exchange must be one of the supported exchanges'),
  etfId: z.string().nullable().optional(),
  role: z.nativeEnum(EtfScenarioRole),
  sortOrder: z.number().int().nonnegative().optional(),
  roleExplanation: z.string().nullable().optional(),
  expectedPriceChange: z.number().int().min(-100).max(100).nullable().optional(),
  expectedPriceChangeExplanation: z.string().nullable().optional(),
});

export type AddEtfScenarioLinkRequest = z.infer<typeof addLinkSchema>;

async function postHandler(
  request: NextRequest,
  _userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ id: string }> }
): Promise<EtfScenarioEtfLink> {
  const { id: scenarioId } = await params;
  const body = addLinkSchema.parse(await request.json());

  const scenario = await prisma.etfScenario.findUnique({ where: { id: scenarioId } });
  if (!scenario) throw new Error(`Scenario not found: ${scenarioId}`);

  const symbol = body.symbol.toUpperCase();
  const exchange = body.exchange.toUpperCase();

  const mismatches = scenarioLinkCountryMismatch([{ symbol, exchange }], scenario.countries as SupportedCountries[]);
  if (mismatches.length) {
    throw new Error(`Link country mismatch: ${serializeLinkMismatches(mismatches)}.`);
  }

  // Resolve etfId via (symbol, exchange) so dual-listed ETFs map to the
  // correct row. Unresolved links still save (etfId=null) — the public
  // detail view renders them as plain pills.
  let resolvedEtfId: string | null = body.etfId ?? null;
  if (!resolvedEtfId) {
    const etf = await prisma.etf.findFirst({
      where: { spaceId: KoalaGainsSpaceId, symbol, exchange },
      select: { id: true },
    });
    resolvedEtfId = etf?.id ?? null;
  }

  const link = await prisma.etfScenarioEtfLink.upsert({
    where: {
      scenarioId_symbol_role: {
        scenarioId,
        symbol,
        role: body.role,
      },
    },
    create: {
      scenarioId,
      symbol,
      exchange,
      etfId: resolvedEtfId,
      role: body.role,
      sortOrder: body.sortOrder ?? 0,
      roleExplanation: body.roleExplanation ?? null,
      expectedPriceChange: body.expectedPriceChange ?? null,
      expectedPriceChangeExplanation: body.expectedPriceChangeExplanation ?? null,
      spaceId: KoalaGainsSpaceId,
    },
    update: {
      exchange,
      etfId: resolvedEtfId,
      sortOrder: body.sortOrder ?? 0,
      roleExplanation: body.roleExplanation ?? null,
      expectedPriceChange: body.expectedPriceChange ?? null,
      expectedPriceChangeExplanation: body.expectedPriceChangeExplanation ?? null,
    },
  });

  revalidateEtfScenarioBySlugTag(scenario.slug);
  revalidateEtfScenarioListingTag();

  return link;
}

async function deleteHandler(
  request: NextRequest,
  _userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ id: string }> }
): Promise<{ success: boolean }> {
  const { id: scenarioId } = await params;
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const role = searchParams.get('role') as EtfScenarioRole | null;

  if (!symbol || !role) {
    throw new Error('symbol and role query params are required');
  }

  const scenario = await prisma.etfScenario.findUnique({ where: { id: scenarioId } });
  if (!scenario) throw new Error(`Scenario not found: ${scenarioId}`);

  await prisma.etfScenarioEtfLink.delete({
    where: {
      scenarioId_symbol_role: {
        scenarioId,
        symbol: symbol.toUpperCase(),
        role,
      },
    },
  });

  revalidateEtfScenarioBySlugTag(scenario.slug);
  revalidateEtfScenarioListingTag();

  return { success: true };
}

export const POST = withLoggedInAdmin<EtfScenarioEtfLink>(postHandler);
export const DELETE = withLoggedInAdmin<{ success: boolean }>(deleteHandler);
