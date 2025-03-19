import { getCriteriaByIds } from '@/lib/industryGroupCriteria';
import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { CriterionEvaluation, ProcessingStatus } from '@/types/public-equity/ticker-report-types';
import { CreateAllCriterionReportsRequest } from '@/types/public-equity/ticker-request-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { CriterionReportItem } from '@prisma/client';

import { NextRequest } from 'next/server';

const triggerAllCriterionReports = async (
  req: NextRequest,
  { params }: { params: Promise<{ tickerKey: string; criterionKey: string }> }
): Promise<CriterionEvaluation> => {
  const { tickerKey, criterionKey } = await params;
  const body = (await req.json()) as CreateAllCriterionReportsRequest;

  if (!body.langflowWebhookUrl) {
    throw new Error('langflowWebhookUrl is required in the request body.');
  }

  const tickerReport = await prisma.ticker.findUniqueOrThrow({ where: { tickerKey }, include: { evaluationsOfLatest10Q: true } });
  const industryGroupCriteria = await getCriteriaByIds(tickerReport.sectorId, tickerReport.industryGroupId);
  const matchingCriterion = industryGroupCriteria.criteria.find((crit) => crit.key === criterionKey);
  if (!matchingCriterion) {
    throw new Error(`Criterion with key '${criterionKey}' not found.`);
  }
  const payload = {
    ticker: tickerKey,
    shouldTriggerNext: false,
    reportKey: [...matchingCriterion.reports.map((r) => r.key), 'performanceChecklist', 'importantMetrics'].join(','),
    criterion: JSON.stringify(matchingCriterion),
  };
  const headers = { 'Content-Type': 'application/json' };
  const response = await fetch(body.langflowWebhookUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const jsonResponse = await response.json();
  console.log(jsonResponse);
  const criterionEvaluation = await prisma.criterionEvaluation.upsert({
    where: {
      spaceId_tickerKey_criterionKey: {
        spaceId: KoalaGainsSpaceId,
        criterionKey,
        tickerKey,
      },
    },
    create: {
      criterionKey,
      tickerKey,
      importantMetricsEvaluation: {
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
      reports: {
        createMany: {
          data: [
            ...industryGroupCriteria.criteria
              .flatMap((c) => c.reports)
              .map(
                (r): Omit<CriterionReportItem, 'id' | 'criterionEvaluationId' | 'jsonData'> => ({
                  reportKey: r.key,
                  spaceId: KoalaGainsSpaceId,
                  status: ProcessingStatus.InProgress,
                  createdBy: 'system',
                  createdAt: new Date(),
                  tickerKey: tickerKey,
                  criterionKey: criterionKey,
                  textData: null,
                  updatedAt: new Date(),
                  updatedBy: 'system',
                })
              ),
          ],
        },
      },
    },
    update: {
      importantMetricsEvaluation: {
        update: {
          status: ProcessingStatus.InProgress,
        },
      },
      performanceChecklistEvaluation: {
        update: {
          status: ProcessingStatus.InProgress,
        },
      },
      reports: {
        updateMany: {
          where: {
            criterionKey,
            tickerKey,
          },
          data: {
            status: ProcessingStatus.InProgress,
          },
        },
      },
    },
  });
  return criterionEvaluation;
};
export const POST = withErrorHandlingV2<CriterionEvaluation>(triggerAllCriterionReports);
