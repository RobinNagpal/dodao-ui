import {
  getAndWriteIndustryHeadings,
  readIndustryHeadingsFromFile,
  writeIndustryHeadingsToMarkdownFile,
} from '@/scripts/industry-tariff-reports/00-industry-main-headings';
import {
  getExecutiveSummaryAndSaveToFile,
  readExecutiveSummaryFromFile,
  writeExecutiveSummaryToMarkdownFile,
} from '@/scripts/industry-tariff-reports/01-executive-summary';
import { getAndWriteIntroductionsJson, readIntroductionJsonFromFile, writeIntroductionToMarkdownFile } from '@/scripts/industry-tariff-reports/02-introduction';
import {
  getTariffUpdatesForIndustryAndSaveToFile,
  readTariffUpdatesFromFile,
  writeTariffUpdatesToMarkdownFile,
} from '@/scripts/industry-tariff-reports/03-industry-tariffs';
import {
  getAndWriteUnderstandIndustryJson,
  readUnderstandIndustryJsonFromFile,
  writeUnderstandIndustryToMarkdownFile,
} from '@/scripts/industry-tariff-reports/04-understand-industry';
import {
  getAndWriteIndustryAreaSectionToJsonFile,
  readIndustryAreaSectionFromFile,
  writeIndustryAreaSectionToMarkdownFile,
} from '@/scripts/industry-tariff-reports/05-industry-areas';
import {
  getAndWriteEvaluateIndustryAreaJson,
  readEvaluateIndustryAreaJsonFromFile,
  writeEvaluateIndustryAreaToMarkdownFile,
} from '@/scripts/industry-tariff-reports/06-evaluate-industry-area';
import {
  getFinalConclusionAndSaveToFile,
  readFinalConclusionFromFile,
  writeFinalConclusionToMarkdownFile,
} from '@/scripts/industry-tariff-reports/07-final-conclusion';
import {
  getNegativeImpactsOfEvaluatedAreas,
  getPositiveImpactsOfEvaluatedAreas,
  getSummariesOfEvaluatedAreas,
} from '@/scripts/industry-tariff-reports/industry-tariff-report-utils';
import { TariffReportIndustry } from '@/scripts/industry-tariff-reports/tariff-types';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Types of report sections supported by this script.
 */
export enum ReportType {
  HEADINGS = 'HEADINGS',
  INTRODUCTION = 'INTRODUCTION',
  UNDERSTAND_INDUSTRY = 'UNDERSTAND_INDUSTRY',
  TARIFF_UPDATES = 'TARIFF_UPDATES',
  INDUSTRY_AREA_SECTION = 'INDUSTRY_AREA_SECTION',
  EVALUATE_INDUSTRY_AREA = 'EVALUATE_INDUSTRY_AREA',
  EXECUTIVE_SUMMARY = 'EXECUTIVE_SUMMARY',
  FINAL_CONCLUSION = 'FINAL_CONCLUSION',
  ALL = 'ALL',
}

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
  const industry = tariffIndustry.name;
  const date = tariffIndustry.asOfDate;
  // Pre-read common dependencies

  await getAndWriteIndustryHeadings(industry);
  const headings = await readIndustryHeadingsFromFile(industry);
  if (!headings) throw new Error('Headings not found');

  switch (reportType) {
    case ReportType.HEADINGS:
      await getAndWriteIndustryHeadings(industry);
      await writeIndustryHeadingsToMarkdownFile(industry, headings);
      break;

    case ReportType.INTRODUCTION:
      await getAndWriteIntroductionsJson(industry, date, headings);
      const introductions = await readIntroductionJsonFromFile(industry);
      if (!introductions) throw new Error('Introductions not found');
      await writeIntroductionToMarkdownFile(industry, introductions);
      break;

    case ReportType.UNDERSTAND_INDUSTRY:
      await getAndWriteUnderstandIndustryJson(industry, headings);
      const understandIndustry = await readUnderstandIndustryJsonFromFile(industry);
      if (!understandIndustry) throw new Error('Understand industry section not found');
      await writeUnderstandIndustryToMarkdownFile(industry, understandIndustry);
      break;

    case ReportType.TARIFF_UPDATES:
      await getTariffUpdatesForIndustryAndSaveToFile(industry, date, headings);
      const tariffUpdatesForIndustry = await readTariffUpdatesFromFile(industry);
      if (!tariffUpdatesForIndustry) throw new Error('Tariff updates not found');
      await writeTariffUpdatesToMarkdownFile(industry, tariffUpdatesForIndustry);
      break;

    case ReportType.INDUSTRY_AREA_SECTION:
      await getAndWriteIndustryAreaSectionToJsonFile(industry, headings);
      const industryAreaSection = await readIndustryAreaSectionFromFile(industry);
      if (!industryAreaSection) throw new Error('Industry area section not found');
      await writeIndustryAreaSectionToMarkdownFile(industry, industryAreaSection);
      break;

    case ReportType.EVALUATE_INDUSTRY_AREA:
      const tariff = await readTariffUpdatesFromFile(industry);
      const { headingIndex, subHeadingIndex } = evaluationReportToGenerate;
      const firstArea = headings.areas[headingIndex].subAreas[subHeadingIndex];
      await getAndWriteEvaluateIndustryAreaJson(tariffIndustry, firstArea, headings, tariff!, date);
      const evaluated = await readEvaluateIndustryAreaJsonFromFile(industry, firstArea, headings);
      if (evaluated) {
        await writeEvaluateIndustryAreaToMarkdownFile(industry, firstArea, headings, evaluated);
      }
      break;

    case ReportType.EXECUTIVE_SUMMARY:
      const tariffUpdates = await readTariffUpdatesFromFile(industry);
      const summaries = await getSummariesOfEvaluatedAreas(industry, headings);
      if (!tariffUpdates) throw new Error('Tariff updates not found');
      await getExecutiveSummaryAndSaveToFile(industry, headings, tariffUpdates, summaries);
      const execSummary = await readExecutiveSummaryFromFile(industry);
      if (!execSummary) throw new Error('Executive summary not found');
      await writeExecutiveSummaryToMarkdownFile(industry, execSummary);
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
      await writeFinalConclusionToMarkdownFile(industry, conclusion);
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
  name: 'Plastic',
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
