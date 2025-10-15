// industries/[id]/route.ts
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';
import { withLoggedInAdmin } from '../../helpers/withLoggedInAdmin';
import { TickerV1SubIndustry } from '@prisma/client';

export interface IndustryUpdateRequest {
  name?: string;
  summary?: string;
  industryKey?: string;
  archived?: boolean;
}

async function getHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<TickerV1SubIndustry> {
  const { id } = await params;
  return prisma.tickerV1SubIndustry.findFirstOrThrow({
    where: {
      subIndustryKey: id,
    },
  });
}

async function putHandler(
  request: NextRequest,
  _userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ id: string }> }
): Promise<TickerV1SubIndustry> {
  const { id } = await params;
  const body: IndustryUpdateRequest = await request.json();
  const subIndustry = await prisma.tickerV1SubIndustry.findFirstOrThrow({
    where: {
      subIndustryKey: id,
    },
  });
  const updated = await prisma.tickerV1SubIndustry.update({
    where: { industryKey_subIndustryKey: { industryKey: subIndustry.industryKey, subIndustryKey: subIndustry.subIndustryKey } },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.summary && { summary: body.summary }),
      ...(body.industryKey && { industryKey: body.industryKey }),
      ...(typeof body.archived === 'boolean' && { archived: body.archived }),
    },
  });

  return updated;
}

async function deleteHandler(
  _request: NextRequest,
  _userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ id: string }> }
): Promise<{ success: boolean }> {
  const { id } = await params;

  const subIndustry = await prisma.tickerV1SubIndustry.findFirstOrThrow({
    where: {
      subIndustryKey: id,
    },
  });
  await prisma.tickerV1SubIndustry.delete({
    where: { industryKey_subIndustryKey: { industryKey: subIndustry.industryKey, subIndustryKey: subIndustry.subIndustryKey } },
  });

  return { success: true };
}

export const GET = withErrorHandlingV2<TickerV1SubIndustry>(getHandler);
export const PUT = withLoggedInAdmin<TickerV1SubIndustry>(putHandler);
export const DELETE = withLoggedInAdmin<{ success: boolean }>(deleteHandler);
