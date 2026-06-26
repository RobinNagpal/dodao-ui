import { EtfReportType } from '@/types/etf/etf-analysis-types';
import { saveEtfReportAndAdvanceGeneration } from '@/utils/etf-analysis-reports/save-etf-report-callback-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function postHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string; exchange: string; etf: string }> }) {
  const { exchange, etf } = await params;

  const { llmResponse, additionalData } = await req.json();
  const { reportType, generationRequestId } = additionalData as { reportType: EtfReportType; generationRequestId: string };

  console.log('ETF save-report-callback received:', { reportType, generationRequestId, exchange, etf });

  // All the save + generation-request advancement logic lives in a shared util
  // so the in-process background path (processEtfReportLLMResponseInBackground)
  // runs the exact same code without going back over HTTP.
  await saveEtfReportAndAdvanceGeneration({
    exchange,
    etf,
    reportType,
    llmResponse,
    generationRequestId,
  });

  return { success: true };
}

export const POST = withErrorHandlingV2<{ success: boolean }>(postHandler);
