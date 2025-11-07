// industries/route.ts
import { prisma } from '@/prisma';
import { IndustryWithSubIndustries, IndustryWithSubIndustriesAndCounts, SubIndustryWithCount } from '@/types/ticker-typesv1';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { TickerV1Industry } from '@prisma/client';
import { NextRequest } from 'next/server';
import { withLoggedInAdmin } from '../helpers/withLoggedInAdmin';
import { getExchangesByCountry } from '@/utils/countryUtils';

export interface CreateIndustryRequest {
  industryKey: string;
  name: string;
  summary: string;
  archived?: boolean;
}

async function getHandler(request: NextRequest): Promise<IndustryWithSubIndustriesAndCounts[]> {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');

  let industries: any[];

  if (country) {
    // Get exchanges for the country
    const exchanges = getExchangesByCountry(country);

    if (exchanges.length === 0) {
      return []; // No exchanges for this country
    }

    // Get distinct industryKeys from tickers in those exchanges
    const industryKeys = await prisma.tickerV1
      .findMany({
        where: {
          exchange: { in: exchanges as string[] },
        },
        select: { industryKey: true },
        distinct: ['industryKey'],
      })
      .then((results) => results.map((r) => r.industryKey));

    // Fetch industries with those keys
    industries = await prisma.tickerV1Industry.findMany({
      where: {
        industryKey: { in: industryKeys },
      },
      include: {
        subIndustries: {
          include: {
            _count: { select: { tickers: true } }, // assumes SubIndustry has `tickers` relation
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  } else {
    // Original logic for all industries
    industries = await prisma.tickerV1Industry.findMany({
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
  }

  const shaped: IndustryWithSubIndustriesAndCounts[] = industries.map((ind) => {
    const subWithCounts: SubIndustryWithCount[] = (ind.subIndustries ?? []).map((si: SubIndustryWithCount) => ({
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
