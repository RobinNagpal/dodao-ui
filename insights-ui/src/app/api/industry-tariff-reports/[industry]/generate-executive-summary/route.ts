import { getExecutiveSummaryAndSaveToFile } from '@/scripts/industry-tariff-reports/02-executive-summary';
import { getIndustryTariffReport, getSummariesOfEvaluatedAreas } from '@/scripts/industry-tariff-reports/industry-tariff-report-utils';
import { TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';
import {
  readExecutiveSummaryFromFile,
  readIndustryHeadingsFromFile,
  readTariffUpdatesFromFile,
} from '@/scripts/industry-tariff-reports/tariff-report-read-write';
import { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function postHandler(req: NextRequest, { params }: { params: Promise<{ industry: TariffIndustryId }> }): Promise<IndustryTariffReport> {
  const { industry } = await params;

  if (!industry) {
    throw new Error('Industry is required');
  }

  // Get dependencies
  const headings = await readIndustryHeadingsFromFile(industry);
  if (!headings) throw new Error(`Headings not found for industry: ${industry}`);

  const tariffUpdates = await readTariffUpdatesFromFile(industry);

  // Get summaries from evaluated areas
  const summaries = await getSummariesOfEvaluatedAreas(industry, headings);

  // Generate the executive summary
  if (!tariffUpdates) {
    throw new Error('Tariff updates not found');
  }

  await getExecutiveSummaryAndSaveToFile(industry, headings, tariffUpdates, summaries);
  const execSummary = await readExecutiveSummaryFromFile(industry);
  if (!execSummary) {
    throw new Error('Executive summary not found');
  }

  return getIndustryTariffReport(industry);
}

export const POST = withErrorHandlingV2<IndustryTariffReport>(postHandler);
