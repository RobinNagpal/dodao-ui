// industries/[id]/route.ts
import { prisma } from '@/prisma';
import { IndustryWithSubIndustries } from '@/types/ticker-typesv1';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';
import { withLoggedInAdmin } from '../../helpers/withLoggedInAdmin';
import { TickerV1Industry, TickerV1SubIndustry } from '@prisma/client';

export interface IndustryUpdateRequest {
  name?: string;
  summary?: string;
  archived?: boolean;
}

async function getHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<IndustryWithSubIndustries> {
  const { id } = await params;
  return prisma.tickerV1Industry.findUniqueOrThrow({
    where: {
      industryKey: id,
    },
    include: {
      subIndustries: true,
    },
  });
}

async function putHandler(
  request: NextRequest,
  _userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ id: string }> }
): Promise<TickerV1Industry> {
  const { id } = await params;
  const body: IndustryUpdateRequest = await request.json();

  const updated = await prisma.tickerV1Industry.update({
    where: { industryKey: id },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.summary && { summary: body.summary }),
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

  await prisma.tickerV1Industry.delete({
    where: { industryKey: id },
  });

  return { success: true };
}

export const GET = withErrorHandlingV2<IndustryWithSubIndustries>(getHandler);
export const PUT = withLoggedInAdmin<TickerV1Industry>(putHandler);
export const DELETE = withLoggedInAdmin<{ success: boolean }>(deleteHandler);
