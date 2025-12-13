import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { IndustryBuildingBlockAnalysis } from '@prisma/client';
import { NextRequest } from 'next/server';
import { withLoggedInAdmin } from '../helpers/withLoggedInAdmin';
import type { SubIndustryAnalysisWithRelations } from '@/types/ticker-typesv1';

export interface CreateSubIndustryAnalysisRequest {
  name: string;
  buildingBlockKey: string;
  tickerV1IndustryAnalysisId: string;
  metaDescription?: string;
  details?: string;
}

async function getHandler(req: NextRequest): Promise<SubIndustryAnalysisWithRelations[]> {
  const { searchParams } = new URL(req.url);
  const industryAnalysisId = searchParams.get('industryAnalysisId');

  const subIndustryAnalyses = await prisma.industryBuildingBlockAnalysis.findMany({
    where: {
      ...(industryAnalysisId ? { tickerV1IndustryAnalysisId: industryAnalysisId } : {}),
    },
    include: {
      industryAnalysis: true,
    },
  });
  return subIndustryAnalyses;
}

async function postHandler(request: NextRequest, _userContext: DoDaoJwtTokenPayload): Promise<IndustryBuildingBlockAnalysis> {
  const body: CreateSubIndustryAnalysisRequest = await request.json();
  const { name, buildingBlockKey, tickerV1IndustryAnalysisId, metaDescription, details } = body;

  if (!name || !buildingBlockKey || !tickerV1IndustryAnalysisId) {
    throw new Error('name, buildingBlockKey, and tickerV1IndustryAnalysisId are required');
  }

  const subIndustryAnalysis = await prisma.industryBuildingBlockAnalysis.create({
    data: {
      name,
      buildingBlockKey,
      tickerV1IndustryAnalysisId,
      metaDescription,
      details,
    },
  });

  return subIndustryAnalysis;
}

export const GET = withErrorHandlingV2<SubIndustryAnalysisWithRelations[]>(getHandler);
export const POST = withLoggedInAdmin<IndustryBuildingBlockAnalysis>(postHandler);
