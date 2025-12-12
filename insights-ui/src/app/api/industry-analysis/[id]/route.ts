import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { TickerV1IndustryAnalysis } from '@prisma/client';
import { NextRequest } from 'next/server';
import { withLoggedInAdmin } from '../../helpers/withLoggedInAdmin';

export interface IndustryAnalysisUpdateRequest {
  name?: string;
  industryKey?: string;
  metaDescription?: string;
  details?: string;
}

async function getHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<TickerV1IndustryAnalysis> {
  const { id } = await params;
  return prisma.tickerV1IndustryAnalysis.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      subIndustryAnalyses: true,
      industry: {
        select: {
          name: true,
          industryKey: true,
        },
      },
    },
  });
}

async function putHandler(
  request: NextRequest,
  _userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ id: string }> }
): Promise<TickerV1IndustryAnalysis> {
  const { id } = await params;
  const body: IndustryAnalysisUpdateRequest = await request.json();

  const updated = await prisma.tickerV1IndustryAnalysis.update({
    where: { id },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.industryKey && { industryKey: body.industryKey }),
      ...(body.metaDescription !== undefined && { metaDescription: body.metaDescription }),
      ...(body.details !== undefined && { details: body.details }),
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

  await prisma.tickerV1IndustryAnalysis.delete({
    where: { id },
  });

  return { success: true };
}

export const GET = withErrorHandlingV2<TickerV1IndustryAnalysis>(getHandler);
export const PUT = withLoggedInAdmin<TickerV1IndustryAnalysis>(putHandler);
export const DELETE = withLoggedInAdmin<{ success: boolean }>(deleteHandler);
