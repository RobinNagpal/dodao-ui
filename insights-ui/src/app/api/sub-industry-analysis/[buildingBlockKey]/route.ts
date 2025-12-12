import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { IndustryBuildingBlockAnalysis } from '@prisma/client';
import { NextRequest } from 'next/server';
import { withLoggedInAdmin } from '../../helpers/withLoggedInAdmin';
import type { SubIndustryAnalysisWithRelations } from '@/types/ticker-typesv1';

export interface SubIndustryAnalysisUpdateRequest {
  name?: string;
  buildingBlockKey?: string;
  tickerV1IndustryAnalysisId?: string;
  metaDescription?: string;
  details?: string;
}

async function getHandler(request: NextRequest, { params }: { params: Promise<{ buildingBlockKey: string }> }): Promise<SubIndustryAnalysisWithRelations> {
  const { buildingBlockKey } = await params;
  return prisma.industryBuildingBlockAnalysis.findUniqueOrThrow({
    where: {
      buildingBlockKey,
    },
    include: {
      industryAnalysis: true,
    },
  });
}

async function putHandler(
  request: NextRequest,
  _userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ buildingBlockKey: string }> }
): Promise<IndustryBuildingBlockAnalysis> {
  const { buildingBlockKey } = await params;
  const body: SubIndustryAnalysisUpdateRequest = await request.json();

  const updated = await prisma.industryBuildingBlockAnalysis.update({
    where: { buildingBlockKey },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.buildingBlockKey && { buildingBlockKey: body.buildingBlockKey }),
      ...(body.tickerV1IndustryAnalysisId && { tickerV1IndustryAnalysisId: body.tickerV1IndustryAnalysisId }),
      ...(body.metaDescription !== undefined && { metaDescription: body.metaDescription }),
      ...(body.details !== undefined && { details: body.details }),
    },
  });

  return updated;
}

async function deleteHandler(
  _request: NextRequest,
  _userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ buildingBlockKey: string }> }
): Promise<{ success: boolean }> {
  const { buildingBlockKey } = await params;

  await prisma.industryBuildingBlockAnalysis.delete({
    where: { buildingBlockKey },
  });

  return { success: true };
}

export const GET = withErrorHandlingV2<SubIndustryAnalysisWithRelations>(getHandler);
export const PUT = withLoggedInAdmin<IndustryBuildingBlockAnalysis>(putHandler);
export const DELETE = withLoggedInAdmin<{ success: boolean }>(deleteHandler);
