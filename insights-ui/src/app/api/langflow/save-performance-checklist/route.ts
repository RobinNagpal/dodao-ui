import { parseLangflowJSON } from '@/lib/langflow';
import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { PerformanceChecklistEvaluation, PerformanceChecklistItem, ProcessingStatus } from '@/types/public-equity/ticker-report-types';
import { SavePerformanceChecklistRequest } from '@/types/public-equity/ticker-request-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

const savePerformanceChecklistForCriterion = async (req: NextRequest): Promise<PerformanceChecklistEvaluation> => {
  const body = (await req.json()) as SavePerformanceChecklistRequest;
  const ticker = await prisma.ticker.findUnique({
    where: { tickerKey: body.ticker },
    include: { evaluationsOfLatest10Q: true },
  });

  if (!ticker) {
    throw new Error(`Ticker not found for key: ${body.ticker}`);
  }

  const evaluation = await prisma.criterionEvaluation.findUnique({
    where: {
      spaceId_tickerKey_criterionKey: {
        spaceId: KoalaGainsSpaceId,
        tickerKey: body.ticker,
        criterionKey: body.criterionKey,
      },
    },
  });

  if (!evaluation) {
    throw new Error(`CriterionEvaluation not found for ticker '${body.ticker}' and criterion '${body.criterionKey}'.`);
  }

  const performanceChecklistRaw = body.performanceChecklist;
  const checklistItems: PerformanceChecklistItem[] =
    typeof performanceChecklistRaw === 'string' ? parseLangflowJSON(performanceChecklistRaw) : performanceChecklistRaw;

  const updatedPerformanceChecklist = await prisma.performanceChecklistEvaluation.update({
    where: {
      spaceId_tickerKey_criterionKey: {
        spaceId: KoalaGainsSpaceId,
        tickerKey: body.ticker,
        criterionKey: body.criterionKey,
      },
    },
    data: {
      status: ProcessingStatus.Completed,
      performanceChecklistItems: {
        deleteMany: {
          criterionKey: body.criterionKey,
          tickerKey: body.ticker,
          spaceId: KoalaGainsSpaceId,
        },
        create: checklistItems.map((item) => ({
          metricKey: item.metricKey,
          checklistItem: item.checklistItem,
          oneLinerExplanation: item.oneLinerExplanation,
          informationUsed: item.informationUsed,
          detailedExplanation: item.detailedExplanation,
          evaluationLogic: item.evaluationLogic,
          score: item.score,
          tickerKey: body.ticker,
          criterionKey: body.criterionKey,
        })),
      },
    },
    include: {
      performanceChecklistItems: true,
    },
  });

  return updatedPerformanceChecklist;
};

export const POST = withErrorHandlingV2<PerformanceChecklistEvaluation>(savePerformanceChecklistForCriterion);
