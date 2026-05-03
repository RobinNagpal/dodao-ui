import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { ScenarioPricedInBucket, ScenarioRole } from '@/types/scenarioEnums';
import { isExchange, SupportedCountries } from '@/utils/countryExchangeUtils';
import { scenarioLinkCountryMismatch, serializeLinkMismatches } from '@/utils/scenario-country-validation';
import { revalidateStockScenarioBySlugTag, revalidateStockScenarioListingTag } from '@/utils/stock-scenario-cache-utils';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { StockScenarioStockLink } from '@prisma/client';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withLoggedInAdmin } from '../../../helpers/withLoggedInAdmin';

const addLinkSchema = z.object({
  symbol: z.string().min(1),
  // Symbol can be anything non-empty so admins can tag tickers that aren't
  // in TickerV1 yet (those save with `tickerId: null` and render as plain
  // text). Exchange must be one of the supported exchanges.
  exchange: z
    .string()
    .min(1)
    .refine((v) => isExchange(v.toUpperCase()), 'exchange must be one of the supported exchanges'),
  role: z.nativeEnum(ScenarioRole),
  sortOrder: z.number().int().nonnegative().optional(),
  roleExplanation: z.string().nullable().optional(),
  expectedPriceChange: z.number().int().min(-100).max(2000).nullable().optional(),
  expectedPriceChangeExplanation: z.string().nullable().optional(),
  pricedInBucket: z.nativeEnum(ScenarioPricedInBucket).nullable().optional(),
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
      pricedInBucket: body.pricedInBucket ?? ScenarioPricedInBucket.PARTIALLY_PRICED_IN,
      spaceId: KoalaGainsSpaceId,
    },
    update: {
      tickerId: ticker?.id ?? null,
      sortOrder: body.sortOrder ?? 0,
      roleExplanation: body.roleExplanation ?? null,
      expectedPriceChange: body.expectedPriceChange ?? null,
      expectedPriceChangeExplanation: body.expectedPriceChangeExplanation ?? null,
      pricedInBucket: body.pricedInBucket ?? ScenarioPricedInBucket.PARTIALLY_PRICED_IN,
    },
  });

  revalidateStockScenarioBySlugTag(scenario.slug);
  revalidateStockScenarioListingTag();

  return link;
}

function isScenarioRole(value: string | null): value is ScenarioRole {
  return value === 'WINNER' || value === 'LOSER' || value === 'TEN_BAGGER';
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
    throw new Error('symbol, exchange, and role (WINNER|LOSER|TEN_BAGGER) query params are required');
  }
  if (!isExchange(exchangeParam.toUpperCase())) {
    throw new Error(`exchange "${exchangeParam}" is not one of the supported exchanges`);
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
