import { getCriteriaByIds } from '@/lib/industryGroupCriteria';
import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { CriterionEvaluation, PredefinedReports, ProcessingStatus } from '@/types/public-equity/ticker-report-types';
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
    reportKey: reportKey,
    criterion: matchingCriterion,
  };
  console.log('payload: ', payload);
  const headers = { 'Content-Type': 'application/json' };
  const response = await fetch(body.langflowWebhookUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const responseJson = await response.json();
  console.log('Response from langflow:', responseJson);

  if (reportKey === PredefinedReports.performanceChecklistAndMetricsCombined) {
    const updatedCriterionEvaluation = await prisma.criterionEvaluation.upsert({
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
        performanceChecklistEvaluation: {
          create: {
            criterionKey,
            tickerKey,
            status: ProcessingStatus.InProgress,
            spaceId: KoalaGainsSpaceId,
          },
        },
        importantMetricsEvaluation: {
          create: {
            criterionKey,
            tickerKey,
            status: ProcessingStatus.InProgress,
            spaceId: KoalaGainsSpaceId,
          },
        },
      },
      update: {
        performanceChecklistEvaluation: {
          upsert: {
            create: {
              criterionKey,
              tickerKey,
              status: ProcessingStatus.InProgress,
              spaceId: KoalaGainsSpaceId,
            },
            update: {
              status: ProcessingStatus.InProgress,
              performanceChecklistItems: {
                deleteMany: {
                  tickerKey,
                  criterionKey,
                  spaceId: KoalaGainsSpaceId,
                },
              },
            },
          },
        },
        importantMetricsEvaluation: {
          upsert: {
            create: {
              criterionKey,
              tickerKey,
              status: ProcessingStatus.InProgress,
              spaceId: KoalaGainsSpaceId,
            },
            update: {
              metrics: {
                deleteMany: {
                  tickerKey,
                  criterionKey,
                  spaceId: KoalaGainsSpaceId,
                },
              },
              status: ProcessingStatus.InProgress,
            },
          },
        },
      },
    });
    return updatedCriterionEvaluation;
  } else {
    const updatedCriterionEvaluation = await prisma.criterionEvaluation.upsert({
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
        reports: {
          createMany: {
            data: [
              {
                reportKey,
                status: ProcessingStatus.InProgress,
                createdBy: 'system',
                createdAt: new Date(),
                tickerKey,
                criterionKey,
                textData: null,
                updatedAt: new Date(),
                updatedBy: 'system',
              },
            ],
          },
        },
      },
      update: {
        reports: {
          upsert: {
            create: {
              reportKey,
              status: ProcessingStatus.InProgress,
              createdBy: 'system',
              createdAt: new Date(),
              tickerKey,
              criterionKey,
              textData: null,
              updatedAt: new Date(),
              updatedBy: 'system',
            },
            update: {
              textData: null,
              updatedAt: new Date(),
              updatedBy: 'system',
              jsonData: undefined,
              status: ProcessingStatus.InProgress,
            },
            where: {
              spaceId_tickerKey_criterionKey_reportKey: {
                spaceId: KoalaGainsSpaceId,
                reportKey,
                tickerKey,
                criterionKey,
              },
            },
          },
        },
      },
    });
    return updatedCriterionEvaluation;
  }
};
export const POST = withErrorHandlingV2<CriterionEvaluation>(triggerSingleCriterionReport);
