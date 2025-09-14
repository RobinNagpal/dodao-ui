// industries/route.ts
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { TickerV1Industry } from '@prisma/client';
import { NextRequest } from 'next/server';
import { withLoggedInAdmin } from '../helpers/withLoggedInAdmin';

export interface CreateIndustryRequest {
  industryKey: string;
  name: string;
  summary: string;
}

async function getHandler(_req: NextRequest): Promise<TickerV1Industry[]> {
  const industries = await prisma.tickerV1Industry.findMany({
    include: {
      subIndustries: true,
    },
  });
  return industries;
}

async function postHandler(request: NextRequest, _userContext: DoDaoJwtTokenPayload): Promise<TickerV1Industry> {
  const body: CreateIndustryRequest = await request.json();
  const { industryKey, name, summary } = body;

  if (!industryKey || !name || !summary) {
    throw new Error('industryKey, name, and summary are required');
  }

  const industry = await prisma.tickerV1Industry.create({
    data: {
      industryKey,
      name,
      summary,
    },
  });

  return industry;
}

export const GET = withErrorHandlingV2<TickerV1Industry[]>(getHandler);
export const POST = withLoggedInAdmin<TickerV1Industry>(postHandler);
