import { CommodityReportType } from '@/types/commodity/commodity-analysis-types';
import { saveCommodityReportAndAdvanceGeneration } from '@/utils/commodity-analysis-reports/save-commodity-report-callback-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

/**
 * HTTP callback for the (optional) AWS Lambda LLM path. The default commodity
 * path runs the LLM in-process and calls `saveCommodityReportAndAdvanceGeneration`
 * directly, so this route only matters if the lambda path is wired up. It mirrors
 * the ETF `save-report-callback` route: read the LLM JSON off the body and run the
 * same shared save + advance logic.
 */
async function postHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string; slug: string }> }): Promise<{ success: boolean }> {
  const { slug } = await params;

  const { llmResponse, additionalData } = await req.json();
  const { reportType, generationRequestId } = additionalData as { reportType: CommodityReportType; generationRequestId?: string };

  await saveCommodityReportAndAdvanceGeneration({ slug, reportType, llmResponse, generationRequestId });

  return { success: true };
}

export const POST = withErrorHandlingV2<{ success: boolean }>(postHandler);
