import { TopGainerWithTicker } from '@/types/daily-stock-movers';
import { getDailyTopGainers } from '@/utils/daily-movers-data';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<TopGainerWithTicker[]> {
  const { spaceId } = await context.params;
  const url = new URL(req.url);
  const country = url.searchParams.get('country');
  const date = url.searchParams.get('date');

  return getDailyTopGainers(spaceId, country, date);
}

export const GET = withErrorHandlingV2<TopGainerWithTicker[]>(getHandler);
