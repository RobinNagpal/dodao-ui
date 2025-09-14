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
}

async function getHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<TickerV1SubIndustry> {
  const { id } = await params;
  return prisma.tickerV1SubIndustry.findUniqueOrThrow({
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

  const updated = await prisma.tickerV1SubIndustry.update({
    where: { subIndustryKey: id },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.summary && { summary: body.summary }),
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

  await prisma.tickerV1SubIndustry.delete({
    where: { subIndustryKey: id },
  });

  return { success: true };
}

export const GET = withErrorHandlingV2<TickerV1SubIndustry>(getHandler);
export const PUT = withLoggedInAdmin<TickerV1SubIndustry>(putHandler);
export const DELETE = withLoggedInAdmin<{ success: boolean }>(deleteHandler);
