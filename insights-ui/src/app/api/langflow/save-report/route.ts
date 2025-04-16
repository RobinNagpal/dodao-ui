import { getCriteriaByIds } from '@/lib/industryGroupCriteria';
import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { OutputType } from '@/types/public-equity/criteria-types';
import { CriterionReportItem, ProcessingStatus } from '@/types/public-equity/ticker-report-types';
import { SaveCriterionReportRequest } from '@/types/public-equity/ticker-request-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

const saveReportForCriterion = async (req: NextRequest): Promise<CriterionReportItem> => {
  const body = (await req.json()) as SaveCriterionReportRequest;

  const tickerKey = body.ticker;
  const criterionKey = body.criterionKey;
  const reportKey = body.reportKey;
  const data = body.message;
  const tickerReport = await prisma.ticker.findUnique({ where: { tickerKey }, include: { evaluationsOfLatest10Q: true } });
  if (!tickerReport) {
    throw new Error(`Ticker not found for key: ${body.ticker}`);
  }
  const industryGroupCriteria = await getCriteriaByIds(tickerReport.sectorId, tickerReport.industryGroupId);
  const matchingCriterion = industryGroupCriteria.criteria.find((crit) => crit.key === criterionKey);
  if (!matchingCriterion) {
    throw new Error(`Criterion with key '${criterionKey}' not found.`);
  }

  const reportDefinition = matchingCriterion.reports.find((r) => r.key === reportKey);
  if (!reportDefinition) {
    throw new Error(`Report with key '${reportKey}' not found.`);
  }
  const updatedReportItem = await prisma.criterionReportItem.update({
    where: {
      spaceId_tickerKey_criterionKey_reportKey: {
        spaceId: KoalaGainsSpaceId,
        tickerKey,
        criterionKey,

        reportKey: reportKey,
      },
    },
    data: {
      textData: reportDefinition.outputType === OutputType.Text ? data : undefined,
      jsonData: reportDefinition.outputType !== OutputType.Text ? JSON.parse(data) : undefined,
      status: ProcessingStatus.Completed,
      updatedAt: new Date(),
    },
  });

  return updatedReportItem;
};

export const POST = withErrorHandlingV2<CriterionReportItem>(saveReportForCriterion);
