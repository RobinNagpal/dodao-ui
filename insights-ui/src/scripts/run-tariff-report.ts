import { getAndWriteIndustryHeadings } from '@/scripts/industry-tariff-reports/00-industry-main-headings';
import { getReportCoverAndSaveToFile } from '@/scripts/industry-tariff-reports/01-industry-cover';
import { getExecutiveSummaryAndSaveToFile } from '@/scripts/industry-tariff-reports/02-executive-summary';
import { getTariffUpdatesForIndustryAndSaveToFile } from '@/scripts/industry-tariff-reports/03-industry-tariffs';
import { getAndWriteUnderstandIndustryJson } from '@/scripts/industry-tariff-reports/04-understand-industry';
import { getAndWriteIndustryAreaSectionToJsonFile } from '@/scripts/industry-tariff-reports/05-industry-areas';
import { getAndWriteEvaluateIndustryAreaJson } from '@/scripts/industry-tariff-reports/06-evaluate-industry-area';
import { getFinalConclusionAndSaveToFile } from '@/scripts/industry-tariff-reports/07-final-conclusion';
import {
  getNegativeImpactsOfEvaluatedAreas,
  getPositiveImpactsOfEvaluatedAreas,
  getSummariesOfEvaluatedAreas,
} from '@/scripts/industry-tariff-reports/industry-tariff-report-utils';
import {
  readEvaluateSubIndustryAreaJsonFromFile,
  readExecutiveSummaryFromFile,
  readFinalConclusionFromFile,
  readIndustryAreaSectionFromFile,
  readIndustryHeadingsFromFile,
  readReportCoverFromFile,
  readTariffUpdatesFromFile,
  readUnderstandIndustryJsonFromFile,
  writeMarkdownFileForEvaluateSubIndustryArea,
  writeMarkdownFileForExecutiveSummary,
  writeMarkdownFileForFinalConclusion,
  writeMarkdownFileForIndustryAreas,
  writeMarkdownFileForIndustryAreaSections,
  writeMarkdownFileForIndustryTariffs,
  writeMarkdownFileForReportCover,
  writeMarkdownFileForUnderstandIndustry,
} from '@/scripts/industry-tariff-reports/tariff-report-read-write';
import { ReportType, TariffReportIndustry } from '@/scripts/industry-tariff-reports/tariff-types';
import * as dotenv from 'dotenv';

dotenv.config();

export async function doIt(
  reportType: ReportType,
  tariffIndustry: TariffReportIndustry,
  evaluationReportToGenerate: {
    headingIndex: number;
    subHeadingIndex: number;
  } = {
    headingIndex: 0,
    subHeadingIndex: 0,
  }
) {
  const industry = tariffIndustry.industryId;
  const date = tariffIndustry.asOfDate;
  // Pre-read common dependencies

  await getAndWriteIndustryHeadings(industry);
  const headings = await readIndustryHeadingsFromFile(industry);
  if (!headings) throw new Error('Headings not found');

  switch (reportType) {
    case ReportType.HEADINGS:
      await getAndWriteIndustryHeadings(industry);
      await writeMarkdownFileForIndustryAreas(industry, headings);
      break;

    case ReportType.UNDERSTAND_INDUSTRY:
      await getAndWriteUnderstandIndustryJson(industry, headings);
      const understandIndustry = await readUnderstandIndustryJsonFromFile(industry);
      if (!understandIndustry) throw new Error('Understand industry section not found');
      await writeMarkdownFileForUnderstandIndustry(industry, understandIndustry);
      break;

    case ReportType.TARIFF_UPDATES:
      await getTariffUpdatesForIndustryAndSaveToFile(industry, date, headings);
      const tariffUpdatesForIndustry = await readTariffUpdatesFromFile(industry);
      if (!tariffUpdatesForIndustry) throw new Error('Tariff updates not found');
      await writeMarkdownFileForIndustryTariffs(industry, tariffUpdatesForIndustry);
      break;

    case ReportType.INDUSTRY_AREA_SECTION:
      await getAndWriteIndustryAreaSectionToJsonFile(industry, headings);
      const industryAreaSection = await readIndustryAreaSectionFromFile(industry);
      if (!industryAreaSection) throw new Error('Industry area section not found');
      await writeMarkdownFileForIndustryAreaSections(industry, industryAreaSection);
      break;

    case ReportType.EVALUATE_INDUSTRY_AREA:
      const tariff = await readTariffUpdatesFromFile(industry);
      const { headingIndex, subHeadingIndex } = evaluationReportToGenerate;
      const firstArea = headings.areas[headingIndex].subAreas[subHeadingIndex];
      await getAndWriteEvaluateIndustryAreaJson(tariffIndustry, firstArea, headings, tariff!, date);
      const evaluated = await readEvaluateSubIndustryAreaJsonFromFile(industry, firstArea, headings);
      if (evaluated) {
        await writeMarkdownFileForEvaluateSubIndustryArea(industry, firstArea, headings, evaluated);
      }
      break;

    case ReportType.EXECUTIVE_SUMMARY:
      const tariffUpdates = await readTariffUpdatesFromFile(industry);
      const summaries = await getSummariesOfEvaluatedAreas(industry, headings);
      if (!tariffUpdates) throw new Error('Tariff updates not found');
      await getExecutiveSummaryAndSaveToFile(industry, headings, tariffUpdates, summaries);
      const execSummary = await readExecutiveSummaryFromFile(industry);
      if (!execSummary) throw new Error('Executive summary not found');
      await writeMarkdownFileForExecutiveSummary(industry, execSummary);
      break;

    case ReportType.REPORT_COVER:
      const tariffUpd = await readTariffUpdatesFromFile(industry);
      const summ = await getSummariesOfEvaluatedAreas(industry, headings);
      if (!tariffUpdates) throw new Error('Tariff updates not found');
      const executiveSummary = await readExecutiveSummaryFromFile(industry);
      if (!executiveSummary) throw new Error('Executive summary not found');
      if (!tariffUpd) throw new Error('Tariff updates not found');
      await getReportCoverAndSaveToFile(industry, headings, executiveSummary, tariffUpd, summ);
      const reportCover = await readReportCoverFromFile(industry);
      if (!reportCover) throw new Error('Report cover not found');
      await writeMarkdownFileForReportCover(industry, reportCover);
      break;

    case ReportType.FINAL_CONCLUSION:
      const tariffs = await readTariffUpdatesFromFile(industry);
      if (!tariffs) throw new Error('Tariff updates not found');
      const summariesAll = await getSummariesOfEvaluatedAreas(industry, headings);
      const positiveImpacts = await getPositiveImpactsOfEvaluatedAreas(industry, headings);
      const negativeImpacts = await getNegativeImpactsOfEvaluatedAreas(industry, headings);
      await getFinalConclusionAndSaveToFile(industry, headings, tariffs, summariesAll, positiveImpacts, negativeImpacts);
      const conclusion = await readFinalConclusionFromFile(industry);
      if (!conclusion) throw new Error('Final conclusion not found');
      await writeMarkdownFileForFinalConclusion(industry, conclusion);
      break;

    case ReportType.ALL:
    default:
      // Run all sections in sequence
      for (const type of Object.values(ReportType)) {
        if (type === ReportType.ALL) continue;
        // @ts-ignore
        await doIt(type, industry, date);
      }
      break;
  }
}

const industry: TariffReportIndustry = {
  industryId: 'Plastic',
  companiesToIgnore: ['Pactiv Evergreen Inc', 'Danimer Scientific(DNMR)', 'Zymergen Inc (ZY)', 'Amyris, Inc.'],
  asOfDate: 'April 28, 2025',
};

// Example usage:
doIt(ReportType.HEADINGS, industry, {
  headingIndex: 1,
  subHeadingIndex: 0,
})
  .then(() => {
    console.log('Tariff updates generated successfully.');
  })
  .catch(console.error);
// doIt(ReportType.ALL, 'Plastic', 'April 21, 2025').catch(console.error);
