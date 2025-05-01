import { getReportCoverAndSaveToFile } from '@/scripts/industry-tariff-reports/01-industry-cover';
import { getIndustryTariffReport, getSummariesOfEvaluatedAreas } from '@/scripts/industry-tariff-reports/industry-tariff-report-utils';
import {
  readIndustryHeadingsFromFile,
  readReportCoverFromFile,
  readTariffUpdatesFromFile,
  writeMarkdownFileForReportCover,
} from '@/scripts/industry-tariff-reports/tariff-report-read-write';
import { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function postHandler(req: NextRequest, { params }: { params: Promise<{ industry: string }> }): Promise<IndustryTariffReport> {
  const { industry } = await params;

  if (!industry) {
    throw new Error('Industry is required');
  }

  const headings = await readIndustryHeadingsFromFile(industry);
  if (!headings) throw new Error(`Headings not found for industry: ${industry}`);

  const tariffUpdates = await readTariffUpdatesFromFile(industry);

  // Get summaries from evaluated areas
  const summaries = await getSummariesOfEvaluatedAreas(industry, headings);

  // Generate the executive summary
  if (!tariffUpdates) {
    throw new Error('Tariff updates not found');
  }

  // Generate the report cover
  await getReportCoverAndSaveToFile(industry, headings, tariffUpdates, summaries);
  const reportCover = await readReportCoverFromFile(industry);
  if (!reportCover) {
    throw new Error('Report cover not found');
  }
  await writeMarkdownFileForReportCover(industry, reportCover);

  return getIndustryTariffReport(industry);
}

export const POST = withErrorHandlingV2<IndustryTariffReport>(postHandler);
