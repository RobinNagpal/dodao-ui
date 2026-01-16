import { DailyMoverLLMResponse } from '@/types/daily-stock-movers';
import { DailyMoverType } from '@/types/daily-mover-constants';
import { saveDailyMoverResponse } from '@/utils/daily-movers-generation-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function postHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string; moverId: string }> }) {
  const { spaceId, moverId } = await params;

  const { llmResponse, additionalData } = await req.json();
  const { moverType } = additionalData;

  console.log('Got request to save daily mover report', {
    llmResponse,
    additionalData,
    spaceId,
    moverId,
  });

  if (!moverType || !Object.values(DailyMoverType).includes(moverType as DailyMoverType)) {
    throw new Error(`Invalid moverType in additionalData: ${moverType}`);
  }

  // Save the response
  await saveDailyMoverResponse(moverId, moverType as DailyMoverType, llmResponse as DailyMoverLLMResponse);

  return {
    success: true,
    type: moverType,
  };
}

export const POST = withErrorHandlingV2<{ success: boolean; type: string }>(postHandler);
