import { CompetitionResponse } from '@/types/ticker-typesv1';
import { getTickerCompetition } from '@/utils/ticker-v1-page-data';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<CompetitionResponse> {
  const { spaceId, ticker } = await context.params;
  // Any exchange (no exchange filter).
  return getTickerCompetition(spaceId, null, ticker);
}

export const GET = withErrorHandlingV2<CompetitionResponse>(getHandler);
