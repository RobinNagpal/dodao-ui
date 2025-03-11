import { getCriteria } from '@/lib/industryGroupCriteria';
import { getTickerReport, saveTickerReport } from '@/lib/publicEquity';
import { CriterionEvaluation, ProcessingStatus } from '@/types/public-equity/ticker-report-types';
import { CreateSingleCriterionReportsRequest } from '@/types/public-equity/ticker-request-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

// app/api/public-equity/single-criterion-report/route.ts
import { NextRequest } from 'next/server';

// You should define this environment variable in your project.
const PE_US_REITS_WEBHOOK_URL = process.env.PE_US_REITS_WEBHOOK_URL!;

const triggerSingleCriterionReport = async (
  req: NextRequest,
  { params }: { params: Promise<{ tickerKey: string; criterionKey: string }> }
): Promise<CriterionEvaluation> => {
  const { tickerKey, criterionKey } = await params;
  const body = (await req.json()) as CreateSingleCriterionReportsRequest;

  const tickerReport = await getTickerReport(tickerKey);
  const industryGroupCriteria = await getCriteria(tickerReport.selectedSector.name, tickerReport.selectedIndustryGroup.name);
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
  const response = await fetch(body.langflowWebhookUrl || PE_US_REITS_WEBHOOK_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  await response.json();
  let updatedCriterionEvaluation: CriterionEvaluation | undefined = tickerReport.evaluationsOfLatest10Q?.find((e) => e.criterionKey === criterionKey);
  if (!updatedCriterionEvaluation) {
    updatedCriterionEvaluation = {
      criterionKey,
      importantMetrics: {
        status: ProcessingStatus.NotStarted,
      },
      performanceChecklistEvaluation: {
        status: ProcessingStatus.NotStarted,
      },
      reports: industryGroupCriteria.criteria
        .flatMap((c) => c.reports)
        .map((r) => ({
          reportKey: r.key,
          status: ProcessingStatus.NotStarted,
        })),
    };
  }
  if (reportKey === 'importantMetrics') {
    updatedCriterionEvaluation.importantMetrics = {
      status: ProcessingStatus.InProgress,
    };
  } else if (reportKey === 'performanceChecklist') {
    updatedCriterionEvaluation.performanceChecklistEvaluation = {
      status: ProcessingStatus.InProgress,
    };
  } else {
    const report = updatedCriterionEvaluation.reports?.find((r) => r.reportKey === reportKey);
    if (report) {
      report.status = ProcessingStatus.InProgress;
    } else {
      updatedCriterionEvaluation.reports?.push({
        reportKey,
        status: ProcessingStatus.InProgress,
      });
    }
  }

  await saveTickerReport(tickerKey, {
    ...tickerReport,
    evaluationsOfLatest10Q: [...(tickerReport.evaluationsOfLatest10Q || []).map((e) => (e.criterionKey === criterionKey ? updatedCriterionEvaluation! : e))],
  });

  return updatedCriterionEvaluation;
};
export const POST = withErrorHandlingV2<CriterionEvaluation>(triggerSingleCriterionReport);
