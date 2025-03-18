import { getCriteriaByIds } from '@/lib/industryGroupCriteria';
import { prisma } from '@/prisma';
import { CriterionEvaluation, ProcessingStatus } from '@/types/public-equity/ticker-report-types';
import { CreateSingleCriterionReportRequest } from '@/types/public-equity/ticker-request-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

import { NextRequest } from 'next/server';

const triggerSingleCriterionReport = async (
  req: NextRequest,
  { params }: { params: Promise<{ tickerKey: string; criterionKey: string }> }
): Promise<CriterionEvaluation> => {
  const { tickerKey, criterionKey } = await params;
  const body = (await req.json()) as CreateSingleCriterionReportRequest;
  if (!body.langflowWebhookUrl) {
    throw new Error('langflowWebhookUrl is required in the request body.');
  }

  const tickerReport = await prisma.ticker.findUniqueOrThrow({ where: { tickerKey }, include: { evaluationsOfLatest10Q: true } });
  const industryGroupCriteria = await getCriteriaByIds(tickerReport.sectorId, tickerReport.industryGroupId);
  const matchingCriterion = industryGroupCriteria.criteria.find((crit) => crit.key === criterionKey);
  if (!matchingCriterion) {
    throw new Error(`Criterion with key '${criterionKey}' not found.`);
  }
  const reportKey = body.reportKey;
  const payload = {
    ticker: tickerKey,
    shouldTriggerNext: false,
    reportKey: reportKey,
    criterion: JSON.stringify(matchingCriterion),
  };
  const headers = { 'Content-Type': 'application/json' };
  const response = await fetch(body.langflowWebhookUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const updatedCriterionEvaluation = await prisma.criterionEvaluation.upsert({
    where: {
      tickerKey_criterionKey: {
        criterionKey,
        tickerKey,
      },
    },
    create: {
      criterionKey,
      tickerKey,
      importantMetrics: {
        create: {
          criterionKey,
          tickerKey,
          status: ProcessingStatus.InProgress,
        },
      },
      performanceChecklistEvaluation: {
        create: {
          criterionKey,
          tickerKey,
          status: ProcessingStatus.InProgress,
        },
      },
    },
    update: {
      importantMetrics: {
        upsert: {
          create: {
            criterionKey,
            tickerKey,
            status: ProcessingStatus.InProgress,
          },
          update: {
            status: ProcessingStatus.InProgress,
          },
        },
      },
      performanceChecklistEvaluation: {
        upsert: {
          create: {
            criterionKey,
            tickerKey,
            status: ProcessingStatus.InProgress,
          },
          update: {
            status: ProcessingStatus.InProgress,
          },
        },
      },
    },
  });

  const responseJson = await response.json();
  console.log('Response from langflow:', responseJson);

  return updatedCriterionEvaluation;
};
export const POST = withErrorHandlingV2<CriterionEvaluation>(triggerSingleCriterionReport);
