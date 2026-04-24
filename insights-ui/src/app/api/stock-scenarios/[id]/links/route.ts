import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { ScenarioRole } from '@/types/scenarioEnums';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { scenarioLinkCountryMismatch, serializeLinkMismatches } from '@/utils/scenario-country-validation';
import { revalidateStockScenarioBySlugTag, revalidateStockScenarioListingTag } from '@/utils/stock-scenario-cache-utils';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { StockScenarioStockLink } from '@prisma/client';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withLoggedInAdmin } from '../../../helpers/withLoggedInAdmin';

const addLinkSchema = z.object({
  symbol: z.string().min(1),
  exchange: z.string().min(1),
  role: z.nativeEnum(ScenarioRole),
  sortOrder: z.number().int().nonnegative().optional(),
  roleExplanation: z.string().nullable().optional(),
  expectedPriceChange: z.number().int().min(-100).max(100).nullable().optional(),
  expectedPriceChangeExplanation: z.string().nullable().optional(),
});

export type AddStockScenarioLinkRequest = z.infer<typeof addLinkSchema>;

async function postHandler(
  request: NextRequest,
  _userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ id: string }> }
): Promise<StockScenarioStockLink> {
  const { id: scenarioId } = await params;
  const body = addLinkSchema.parse(await request.json());

  const scenario = await prisma.stockScenario.findUnique({ where: { id: scenarioId } });
  if (!scenario) throw new Error(`Scenario not found: ${scenarioId}`);

  const symbol = body.symbol.toUpperCase();
  const exchange = body.exchange.toUpperCase();

  const mismatches = scenarioLinkCountryMismatch([{ symbol, exchange }], scenario.countries as SupportedCountries[]);
  if (mismatches.length) {
    throw new Error(`Link country mismatch: ${serializeLinkMismatches(mismatches)}.`);
  }

  // Resolve `tickerId` via the `@@unique([spaceId, symbol, exchange])` key on
  // `TickerV1`. Unresolved links still save (tickerId=null) — the UI renders
  // them as plain text, same pattern as ETF scenarios.
  const ticker = await prisma.tickerV1.findUnique({
    where: { spaceId_symbol_exchange: { spaceId: KoalaGainsSpaceId, symbol, exchange } },
    select: { id: true },
  });

  const link = await prisma.stockScenarioStockLink.upsert({
    where: {
      scenarioId_symbol_exchange_role: {
        scenarioId,
        symbol,
        exchange,
        role: body.role,
      },
    },
    create: {
      scenarioId,
      tickerId: ticker?.id ?? null,
      symbol,
      exchange,
      role: body.role,
      sortOrder: body.sortOrder ?? 0,
      roleExplanation: body.roleExplanation ?? null,
      expectedPriceChange: body.expectedPriceChange ?? null,
      expectedPriceChangeExplanation: body.expectedPriceChangeExplanation ?? null,
      spaceId: KoalaGainsSpaceId,
    },
    update: {
      tickerId: ticker?.id ?? null,
      sortOrder: body.sortOrder ?? 0,
      roleExplanation: body.roleExplanation ?? null,
      expectedPriceChange: body.expectedPriceChange ?? null,
      expectedPriceChangeExplanation: body.expectedPriceChangeExplanation ?? null,
    },
  });

  revalidateStockScenarioBySlugTag(scenario.slug);
  revalidateStockScenarioListingTag();

  return link;
}

function isScenarioRole(value: string | null): value is ScenarioRole {
  return value === 'WINNER' || value === 'LOSER' || value === 'MOST_EXPOSED';
}

async function deleteHandler(
  request: NextRequest,
  _userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ id: string }> }
): Promise<{ success: boolean }> {
  const { id: scenarioId } = await params;
  const { searchParams } = new URL(request.url);
  const symbolParam = searchParams.get('symbol');
  const exchangeParam = searchParams.get('exchange');
  const roleParam = searchParams.get('role');

  if (!symbolParam || !exchangeParam || !isScenarioRole(roleParam)) {
    throw new Error('symbol, exchange, and role (WINNER|LOSER|MOST_EXPOSED) query params are required');
  }

  const scenario = await prisma.stockScenario.findUnique({ where: { id: scenarioId } });
  if (!scenario) throw new Error(`Scenario not found: ${scenarioId}`);

  await prisma.stockScenarioStockLink.delete({
    where: {
      scenarioId_symbol_exchange_role: {
        scenarioId,
        symbol: symbolParam.toUpperCase(),
        exchange: exchangeParam.toUpperCase(),
        role: roleParam,
      },
    },
  });

  revalidateStockScenarioBySlugTag(scenario.slug);
  revalidateStockScenarioListingTag();

  return { success: true };
}

export const POST = withLoggedInAdmin<StockScenarioStockLink>(postHandler);
export const DELETE = withLoggedInAdmin<{ success: boolean }>(deleteHandler);
