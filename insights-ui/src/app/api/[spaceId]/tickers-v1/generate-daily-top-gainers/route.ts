import { triggerTopGainersAsync } from '@/utils/screener-api-utils';
import { DailyMoverType } from '@/utils/daily-movers-generation-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

const KOALA_GAINS_BASE_URL = process.env.REPORT_GENERATION_CALLBACK_BASE_URL || `https://koalagains.com`;

interface TriggerResponse {
  message: string;
  status: 'triggered';
  moverType: DailyMoverType;
  callbackUrl: string;
}

async function getHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string }> }): Promise<TriggerResponse> {
  const { spaceId } = await params;

  // Build the callback URL for this space
  const callbackUrl = `${KOALA_GAINS_BASE_URL}/api/${spaceId}/tickers-v1/screener-callback`;

  console.log(`[TopGainers] Triggering async screener fetch, callback URL: ${callbackUrl}`);

  // Trigger the async screener fetch - Lambda will call back with results
  await triggerTopGainersAsync(spaceId, callbackUrl);

  return {
    message: 'Top gainers generation triggered. Lambda will process and callback with results.',
    status: 'triggered',
    moverType: DailyMoverType.GAINER,
    callbackUrl,
  };
}

export const GET = withErrorHandlingV2<TriggerResponse>(getHandler);
