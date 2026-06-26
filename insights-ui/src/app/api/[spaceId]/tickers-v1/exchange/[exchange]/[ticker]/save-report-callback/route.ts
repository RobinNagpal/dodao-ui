import { saveTickerReportAndAdvanceGeneration } from '@/utils/analysis-reports/save-report-callback-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function postHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string; exchange: string; ticker: string }> }) {
  const { spaceId, exchange, ticker } = await params;

  const { llmResponse, additionalData } = await req.json();
  const { reportType, generationRequestId } = additionalData;
  console.log('Got request to save report with the following info', {
    llmResponse,
    additionalData,
    spaceId,
    exchange,
    ticker,
  });

  // All the save + generation-request advancement logic lives in a shared util
  // so the in-process background path (processStockReportLLMResponseInBackground)
  // runs the exact same code without going back over HTTP.
  await saveTickerReportAndAdvanceGeneration({
    exchange,
    ticker,
    reportType,
    llmResponse,
    generationRequestId,
  });

  return {
    success: true,
  };
}

export const POST = withErrorHandlingV2<{ success: boolean }>(postHandler);
