import { getIndustryTariffReport } from '@/scripts/industry-tariff-reports/industry-tariff-report-utils';
import { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { NextRequest } from 'next/server';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import {
  getFinalConclusionAndSaveToFile,
  readFinalConclusionFromFile,
  writeFinalConclusionToMarkdownFile,
} from '@/scripts/industry-tariff-reports/07-final-conclusion';
import { readIndustryHeadingsFromFile } from '@/scripts/industry-tariff-reports/00-industry-main-headings';
import { readTariffUpdatesFromFile } from '@/scripts/industry-tariff-reports/03-industry-tariffs';
import { readEvaluateIndustryAreaJsonFromFile } from '@/scripts/industry-tariff-reports/06-evaluate-industry-area';

async function postHandler(req: NextRequest, { params }: { params: Promise<{ industry: string }> }): Promise<IndustryTariffReport> {
  const { industry } = await params;

  if (!industry) {
    throw new Error('Industry is required');
  }

  // Get dependencies
  const headings = readIndustryHeadingsFromFile(industry);
  const tariffs = readTariffUpdatesFromFile(industry);

  // Get summaries and impacts from evaluated areas
  const summariesAll = headings.headings.flatMap((h) =>
    h.subHeadings.map((sh) => readEvaluateIndustryAreaJsonFromFile(industry, sh, headings).tariffImpactSummary)
  );
  const positiveImpacts = headings.headings.flatMap((h) =>
    h.subHeadings.flatMap((sh) => readEvaluateIndustryAreaJsonFromFile(industry, sh, headings).positiveTariffImpactOnCompanyType)
  );
  const negativeImpacts = headings.headings.flatMap((h) =>
    h.subHeadings.flatMap((sh) => readEvaluateIndustryAreaJsonFromFile(industry, sh, headings).negativeTariffImpactOnCompanyType)
  );

  // Generate the final conclusion
  await getFinalConclusionAndSaveToFile(industry, headings, tariffs, summariesAll, positiveImpacts, negativeImpacts);
  const conclusion = await readFinalConclusionFromFile(industry);
  writeFinalConclusionToMarkdownFile(industry, conclusion);

  return getIndustryTariffReport(industry);
}

export const POST = withErrorHandlingV2<IndustryTariffReport>(postHandler);
