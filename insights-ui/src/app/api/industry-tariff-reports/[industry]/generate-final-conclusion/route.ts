import {
  getIndustryTariffReport,
  getNegativeImpactsOfEvaluatedAreas,
  getPositiveImpactsOfEvaluatedAreas,
  getSummariesOfEvaluatedAreas,
} from '@/scripts/industry-tariff-reports/industry-tariff-report-utils';
import {
  readEvaluateSubIndustryAreaJsonFromFile,
  readFinalConclusionFromFile,
  readIndustryHeadingsFromFile,
  readTariffUpdatesFromFile,
  writeMarkdownFileForFinalConclusion,
} from '@/scripts/industry-tariff-reports/tariff-report-read-write';
import { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { NextRequest } from 'next/server';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { getFinalConclusionAndSaveToFile } from '@/scripts/industry-tariff-reports/07-final-conclusion';

async function postHandler(req: NextRequest, { params }: { params: Promise<{ industry: string }> }): Promise<IndustryTariffReport> {
  const { industry } = await params;

  if (!industry) {
    throw new Error('Industry is required');
  }

  // Get dependencies
  const headings = await readIndustryHeadingsFromFile(industry);
  if (!headings) throw new Error(`Headings not found for industry: ${industry}`);

  const tariffs = await readTariffUpdatesFromFile(industry);

  // Get summaries and impacts from evaluated areas
  const summariesAll = await getSummariesOfEvaluatedAreas(industry, headings);

  const positiveImpacts = await getPositiveImpactsOfEvaluatedAreas(industry, headings);

  const negativeImpacts = await getNegativeImpactsOfEvaluatedAreas(industry, headings);

  // Generate the final conclusion
  if (!tariffs) {
    throw new Error('Tariff updates not found');
  }
  await getFinalConclusionAndSaveToFile(industry, headings, tariffs, summariesAll, positiveImpacts, negativeImpacts);
  const conclusion = await readFinalConclusionFromFile(industry);
  if (!conclusion) {
    throw new Error('Final conclusion not found');
  }

  return getIndustryTariffReport(industry);
}

export const POST = withErrorHandlingV2<IndustryTariffReport>(postHandler);
