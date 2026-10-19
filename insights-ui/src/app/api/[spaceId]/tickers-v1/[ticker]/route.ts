import { TickerV1FastResponse } from '@/utils/ticker-v1-model-utils';
import { getTickerV1WithMissingReports } from '@/utils/ticker-v1-page-data';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<TickerV1FastResponse | null> {
  const { spaceId, ticker } = await context.params;
  const allowNull = req.nextUrl.searchParams.get('allowNull') === 'true';
  // Any exchange (no exchange filter).
  return getTickerV1WithMissingReports(spaceId, null, ticker, allowNull);
}

export const GET = withErrorHandlingV2<TickerV1FastResponse | null>(getHandler);
