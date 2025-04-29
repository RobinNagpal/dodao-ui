import { readIndustryHeadingsFromFile } from '@/scripts/industry-tariff-reports/00-industry-main-headings';
import {
  getExecutiveSummaryAndSaveToFile,
  readExecutiveSummaryFromFile,
  writeExecutiveSummaryToMarkdownFile,
} from '@/scripts/industry-tariff-reports/01-executive-summary';
import { readTariffUpdatesFromFile } from '@/scripts/industry-tariff-reports/03-industry-tariffs';
import { getIndustryTariffReport, getSummariesOfEvaluatedAreas } from '@/scripts/industry-tariff-reports/industry-tariff-report-utils';
import { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function postHandler(req: NextRequest, { params }: { params: Promise<{ industry: string }> }): Promise<IndustryTariffReport> {
  const { industry } = await params;

  if (!industry) {
    throw new Error('Industry is required');
  }

  // Get dependencies
  const headings = await readIndustryHeadingsFromFile(industry);
  const tariffUpdates = await readTariffUpdatesFromFile(industry);

  // Get summaries from evaluated areas
  const summaries = await getSummariesOfEvaluatedAreas(industry, headings);

  // Generate the executive summary
  await getExecutiveSummaryAndSaveToFile(industry, headings, tariffUpdates, summaries);
  const execSummary = readExecutiveSummaryFromFile(industry);
  writeExecutiveSummaryToMarkdownFile(industry, execSummary);

  return getIndustryTariffReport(industry);
}

export const POST = withErrorHandlingV2<IndustryTariffReport>(postHandler);
