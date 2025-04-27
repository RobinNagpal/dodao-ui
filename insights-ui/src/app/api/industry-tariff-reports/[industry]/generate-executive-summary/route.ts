import { getIndustryTariffReport } from '@/scripts/industry-tariff-reports/industry-tariff-report-utils';
import { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { NextRequest } from 'next/server';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import {
  getExecutiveSummaryAndSaveToFile,
  readExecutiveSummaryFromFile,
  writeExecutiveSummaryToMarkdownFile,
} from '@/scripts/industry-tariff-reports/01-executive-summary';
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
  const tariffUpdates = readTariffUpdatesFromFile(industry);

  // Get summaries from evaluated areas
  const summaries = headings.headings.flatMap((h) =>
    h.subHeadings.map((sh) => {
      const evalArea = readEvaluateIndustryAreaJsonFromFile(industry, sh, headings);
      return evalArea.tariffImpactSummary;
    })
  );

  // Generate the executive summary
  await getExecutiveSummaryAndSaveToFile(industry, headings, tariffUpdates, summaries);
  const execSummary = readExecutiveSummaryFromFile(industry);
  writeExecutiveSummaryToMarkdownFile(industry, execSummary);

  return getIndustryTariffReport(industry);
}

export const POST = withErrorHandlingV2<IndustryTariffReport>(postHandler);
