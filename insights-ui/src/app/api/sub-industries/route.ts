import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { TickerV1SubIndustry } from '@prisma/client';
import { NextRequest } from 'next/server';
import { withLoggedInAdmin } from '../helpers/withLoggedInAdmin';

export interface CreateSubIndustryRequest {
  subIndustryKey: string;
  industryKey: string;
  name: string;
  summary: string;
}

async function getHandler(_req: NextRequest): Promise<TickerV1SubIndustry[]> {
  const subIndustries = await prisma.tickerV1SubIndustry.findMany();
  return subIndustries;
}

async function postHandler(request: NextRequest, _userContext: DoDaoJwtTokenPayload): Promise<TickerV1SubIndustry> {
  const body: CreateSubIndustryRequest = await request.json();
  const { industryKey, name, summary, subIndustryKey } = body;

  if (!industryKey || !name || !summary) {
    throw new Error('industryKey, name, and summary are required');
  }

  const subIndustry = await prisma.tickerV1SubIndustry.create({
    data: {
      subIndustryKey,
      industryKey,
      name,
      summary,
    },
  });

  return subIndustry;
}

export const GET = withErrorHandlingV2<TickerV1SubIndustry[]>(getHandler);
export const POST = withLoggedInAdmin<TickerV1SubIndustry>(postHandler);
