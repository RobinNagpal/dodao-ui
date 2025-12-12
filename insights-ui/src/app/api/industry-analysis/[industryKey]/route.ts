import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { TickerV1IndustryAnalysis } from '@prisma/client';
import { NextRequest } from 'next/server';
import { withLoggedInAdmin } from '../../helpers/withLoggedInAdmin';
import type { IndustryAnalysisWithRelations } from '@/types/ticker-typesv1';

export interface IndustryAnalysisUpdateRequest {
  name?: string;
  industryKey?: string;
  metaDescription?: string;
  details?: string;
}

async function getHandler(request: NextRequest, { params }: { params: Promise<{ industryKey: string }> }): Promise<IndustryAnalysisWithRelations> {
  const { industryKey } = await params;
  return prisma.tickerV1IndustryAnalysis.findUniqueOrThrow({
    where: {
      industryKey,
    },
    include: {
      subIndustryAnalyses: true,
      industry: true,
    },
  });
}

async function putHandler(
  request: NextRequest,
  _userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ industryKey: string }> }
): Promise<TickerV1IndustryAnalysis> {
  const { industryKey } = await params;
  const body: IndustryAnalysisUpdateRequest = await request.json();

  const updated = await prisma.tickerV1IndustryAnalysis.update({
    where: { industryKey },
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
  { params }: { params: Promise<{ industryKey: string }> }
): Promise<{ success: boolean }> {
  const { industryKey } = await params;

  await prisma.tickerV1IndustryAnalysis.delete({
    where: { industryKey },
  });

  return { success: true };
}

export const GET = withErrorHandlingV2<IndustryAnalysisWithRelations>(getHandler);
export const PUT = withLoggedInAdmin<TickerV1IndustryAnalysis>(putHandler);
export const DELETE = withLoggedInAdmin<{ success: boolean }>(deleteHandler);
