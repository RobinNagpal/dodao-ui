import { TopLoserWithTicker } from '@/types/daily-stock-movers';
import { getDailyTopLosers } from '@/utils/daily-movers-data';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<TopLoserWithTicker[]> {
  const { spaceId } = await context.params;
  const url = new URL(req.url);
  const country = url.searchParams.get('country');
  const date = url.searchParams.get('date');

  return getDailyTopLosers(spaceId, country, date);
}

export const GET = withErrorHandlingV2<TopLoserWithTicker[]>(getHandler);
