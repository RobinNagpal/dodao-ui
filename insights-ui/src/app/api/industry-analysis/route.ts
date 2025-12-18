import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { TickerV1IndustryAnalysis } from '@prisma/client';
import { NextRequest } from 'next/server';
import { withLoggedInAdmin } from '../helpers/withLoggedInAdmin';
import type { IndustryAnalysisWithRelations } from '@/types/ticker-typesv1';
import { revalidateIndustryPageTag, revalidateIndustryAnalysisTag } from '@/utils/ticker-v1-cache-utils';
import { SupportedCountries } from '@/utils/countryExchangeUtils';

export interface CreateIndustryAnalysisRequest {
  name: string;
  industryKey: string;
  metaDescription?: string;
  details?: string;
}

async function getHandler(_request: NextRequest): Promise<IndustryAnalysisWithRelations[]> {
  const industryAnalyses = await prisma.tickerV1IndustryAnalysis.findMany({
    include: {
      subIndustryAnalyses: true,
      industry: true,
    },
    orderBy: { name: 'asc' },
  });

  return industryAnalyses;
}

async function postHandler(request: NextRequest, _userContext: DoDaoJwtTokenPayload): Promise<TickerV1IndustryAnalysis> {
  const body: CreateIndustryAnalysisRequest = await request.json();
  const { name, industryKey, metaDescription, details } = body;

  if (!name || !industryKey) {
    throw new Error('name and industryKey are required');
  }

  const industryAnalysis = await prisma.tickerV1IndustryAnalysis.create({
    data: {
      name,
      industryKey,
      metaDescription,
      details,
    },
  });

  // Revalidate industry pages for all supported countries
  Object.values(SupportedCountries).forEach((country) => {
    revalidateIndustryPageTag(country, industryKey);
  });

  // Revalidate industry analysis page
  revalidateIndustryAnalysisTag(industryKey);

  return industryAnalysis;
}

export const GET = withErrorHandlingV2<IndustryAnalysisWithRelations[]>(getHandler);
export const POST = withLoggedInAdmin<TickerV1IndustryAnalysis>(postHandler);
