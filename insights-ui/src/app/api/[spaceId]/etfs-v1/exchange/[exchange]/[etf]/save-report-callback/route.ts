import { prisma } from '@/prisma';
import { EtfReportType, ETF_REPORT_TYPE_TO_CATEGORY } from '@/types/etf/etf-analysis-types';
import { triggerEtfGenerationOfAReport } from '@/utils/etf-analysis-reports/etf-generation-report-utils';
import { saveEtfFactorAnalysisResponse } from '@/utils/etf-analysis-reports/save-etf-report-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function postHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string; exchange: string; etf: string }> }) {
  const { spaceId, exchange, etf } = await params;

  const { llmResponse, additionalData } = await req.json();
  const { reportType, generationRequestId } = additionalData as { reportType: EtfReportType; generationRequestId: string };

  console.log('ETF save-report-callback received:', { reportType, generationRequestId, exchange, etf });

  const categoryKey = ETF_REPORT_TYPE_TO_CATEGORY[reportType];
  if (!categoryKey) {
    throw new Error(`Unsupported ETF report type: ${reportType}`);
  }

  await saveEtfFactorAnalysisResponse(etf, exchange, llmResponse, categoryKey);

  if (generationRequestId) {
    const generationRequest = await prisma.etfGenerationRequest.findUniqueOrThrow({
      where: { id: generationRequestId },
    });

    const updatedCompletedSteps = [...generationRequest.completedSteps];
    if (!updatedCompletedSteps.includes(reportType)) {
      updatedCompletedSteps.push(reportType);
    }

    await prisma.etfGenerationRequest.update({
      where: { id: generationRequestId },
      data: {
        completedSteps: updatedCompletedSteps,
        inProgressStep: null,
        lastInvocationTime: null,
      },
    });

    await triggerEtfGenerationOfAReport(etf, exchange, generationRequestId);
  }

  return { success: true };
}

export const POST = withErrorHandlingV2<{ success: boolean }>(postHandler);
