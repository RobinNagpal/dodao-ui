import { DailyMoverType } from '@/types/daily-mover-constants';
import { getDailyMoverAvailableDates } from '@/utils/daily-movers-data';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

interface AvailableDatesResponse {
  dates: string[];
}

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<AvailableDatesResponse> {
  const { spaceId } = await context.params;
  const url = new URL(req.url);
  const country = url.searchParams.get('country');
  const type = url.searchParams.get('type') as DailyMoverType | null;

  const dates = await getDailyMoverAvailableDates(spaceId, country, type ?? DailyMoverType.GAINER);

  return { dates };
}

export const GET = withErrorHandlingV2<AvailableDatesResponse>(getHandler);
