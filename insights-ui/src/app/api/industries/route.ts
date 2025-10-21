// industries/route.ts
import { prisma } from '@/prisma';
import { IndustryWithSubIndustries, IndustryWithSubIndustriesAndCounts, SubIndustryWithCount } from '@/types/ticker-typesv1';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { TickerV1Industry } from '@prisma/client';
import { NextRequest } from 'next/server';
import { withLoggedInAdmin } from '../helpers/withLoggedInAdmin';

export interface CreateIndustryRequest {
  industryKey: string;
  name: string;
  summary: string;
  archived?: boolean;
}

async function getHandler(_request: NextRequest): Promise<IndustryWithSubIndustriesAndCounts[]> {
  const industries = await prisma.tickerV1Industry.findMany({
    include: {
      subIndustries: {
        include: {
          _count: { select: { tickers: true } }, // assumes SubIndustry has `tickers` relation
        },
      },
      // If you also have Industry.tickers, you can include it too; we still sum sub counts below.
      // _count: { select: { tickers: true } },
    },
    orderBy: { name: 'asc' },
  });

  const shaped: IndustryWithSubIndustriesAndCounts[] = industries.map((ind) => {
    const subWithCounts: SubIndustryWithCount[] = (ind.subIndustries ?? []).map((si) => ({
      ...si,
      tickerCount: (si as unknown as { _count?: { tickers?: number } })._count?.tickers ?? 0,
    }));

    const tickerCount = subWithCounts.reduce((sum, s) => sum + s.tickerCount, 0);

    return {
      ...ind,
      subIndustries: subWithCounts,
      tickerCount,
    };
  });

  return shaped;
}

async function postHandler(request: NextRequest, _userContext: DoDaoJwtTokenPayload): Promise<TickerV1Industry> {
  const body: CreateIndustryRequest = await request.json();
  const { industryKey, name, summary, archived } = body;

  if (!industryKey || !name || !summary) {
    throw new Error('industryKey, name, and summary are required');
  }

  const industry = await prisma.tickerV1Industry.create({
    data: {
      industryKey,
      name,
      summary,
      ...(typeof archived === 'boolean' && { archived }),
    },
  });

  return industry;
}

export const GET = withErrorHandlingV2<IndustryWithSubIndustries[]>(getHandler);
export const POST = withLoggedInAdmin<TickerV1Industry>(postHandler);
