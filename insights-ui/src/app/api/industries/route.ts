// industries/route.ts
import { prisma } from '@/prisma';
import { IndustryWithSubIndustries } from '@/types/ticker-typesv1';
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

async function getHandler(req: NextRequest): Promise<IndustryWithSubIndustries[]> {
  const { searchParams } = new URL(req.url);
  const archivedParam = searchParams.get('archived');
  const country = searchParams.get('country');

  // Convert string parameter to boolean if it exists
  const archived = archivedParam ? archivedParam === 'true' : undefined;

  let industries: IndustryWithSubIndustries[];

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
        ...(typeof archived === 'boolean' ? { archived } : {}),
      },
      include: {
        subIndustries: true,
      },
    });
  } else {
    // Original logic for all industries
    industries = await prisma.tickerV1Industry.findMany({
      where: {
        ...(typeof archived === 'boolean' ? { archived } : {}),
      },
      include: {
        subIndustries: true,
      },
    });
  }

  return industries;
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
