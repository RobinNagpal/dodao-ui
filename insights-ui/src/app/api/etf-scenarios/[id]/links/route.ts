import { prisma } from '@/prisma';
import { revalidateEtfScenarioBySlugTag, revalidateEtfScenarioListingTag } from '@/utils/etf-scenario-cache-utils';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { EtfScenarioEtfLink } from '@prisma/client';
import { EtfScenarioRole } from '@/types/etfScenarioEnums';
import { NextRequest } from 'next/server';
import { withLoggedInAdmin } from '../../../helpers/withLoggedInAdmin';
import { z } from 'zod';

const addLinkSchema = z.object({
  symbol: z.string().min(1),
  exchange: z.string().nullable().optional(),
  etfId: z.string().nullable().optional(),
  role: z.nativeEnum(EtfScenarioRole),
  sortOrder: z.number().int().nonnegative().optional(),
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

  const link = await prisma.etfScenarioEtfLink.upsert({
    where: {
      scenarioId_symbol_role: {
        scenarioId,
        symbol: body.symbol.toUpperCase(),
        role: body.role,
      },
    },
    create: {
      scenarioId,
      symbol: body.symbol.toUpperCase(),
      exchange: body.exchange ?? null,
      etfId: body.etfId ?? null,
      role: body.role,
      sortOrder: body.sortOrder ?? 0,
      spaceId: KoalaGainsSpaceId,
    },
    update: {
      exchange: body.exchange ?? null,
      etfId: body.etfId ?? null,
      sortOrder: body.sortOrder ?? 0,
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
