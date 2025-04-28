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

  switch (reportType) {
    case ReportType.HEADINGS:
      await getAndWriteIndustryHeadings(industry);
      await writeIndustryHeadingsToMarkdownFile(industry, headings);
      break;

    case ReportType.INTRODUCTION:
      await getAndWriteIntroductionsJson(industry, date, headings);
      const introductions = readIntroductionJsonFromFile(industry);
      writeIntroductionToMarkdownFile(industry, introductions);
      break;

    case ReportType.UNDERSTAND_INDUSTRY:
      await getAndWriteUnderstandIndustryJson(industry, headings);
      const understandIndustry = readUnderstandIndustryJsonFromFile(industry);
      writeUnderstandIndustryToMarkdownFile(industry, understandIndustry);
      break;

    case ReportType.TARIFF_UPDATES:
      await getTariffUpdatesForIndustryAndSaveToFile(industry, date, headings);
      const tariffUpdatesForIndustry = readTariffUpdatesFromFile(industry);
      writeTariffUpdatesToMarkdownFile(industry, tariffUpdatesForIndustry);
      break;

    case ReportType.INDUSTRY_AREA_SECTION:
      await getAndWriteIndustryAreaSectionToJsonFile(industry, headings);
      const industryAreaSection = readIndustryAreaSectionFromFile(industry);
      writeIndustryAreaSectionToMarkdownFile(industry, industryAreaSection);
      break;

    case ReportType.EVALUATE_INDUSTRY_AREA:
      const tariff = readTariffUpdatesFromFile(industry);
      const { headingIndex, subHeadingIndex } = evaluationReportToGenerate;
      const firstArea = headings.headings[headingIndex].subHeadings[subHeadingIndex];
      await getAndWriteEvaluateIndustryAreaJson(tariffIndustry, firstArea, headings, tariff!, date);
      const evaluated = readEvaluateIndustryAreaJsonFromFile(industry, firstArea, headings);
      writeEvaluateIndustryAreaToMarkdownFile(industry, firstArea, headings, evaluated);
      break;

    case ReportType.EXECUTIVE_SUMMARY:
      const tariffUpdates = readTariffUpdatesFromFile(industry);
      const summaries = headings.headings.flatMap((h) =>
        h.subHeadings.map((sh) => {
          const evalArea = readEvaluateIndustryAreaJsonFromFile(industry, sh, headings);
          return evalArea.tariffImpactSummary;
        })
      );
      await getExecutiveSummaryAndSaveToFile(industry, headings, tariffUpdates, summaries);
      const execSummary = await readExecutiveSummaryFromFile(industry);
      writeExecutiveSummaryToMarkdownFile(industry, execSummary);
      break;

    case ReportType.FINAL_CONCLUSION:
      const tariffs = readTariffUpdatesFromFile(industry);
      const summariesAll = headings.headings.flatMap((h) =>
        h.subHeadings.map((sh) => readEvaluateIndustryAreaJsonFromFile(industry, sh, headings).tariffImpactSummary)
      );
      const positiveImpacts = headings.headings.flatMap((h) =>
        h.subHeadings.flatMap((sh) => readEvaluateIndustryAreaJsonFromFile(industry, sh, headings).positiveTariffImpactOnCompanyType)
      );
      const negativeImpacts = headings.headings.flatMap((h) =>
        h.subHeadings.flatMap((sh) => readEvaluateIndustryAreaJsonFromFile(industry, sh, headings).negativeTariffImpactOnCompanyType)
      );
      await getFinalConclusionAndSaveToFile(industry, headings, tariffs, summariesAll, positiveImpacts, negativeImpacts);
      const conclusion = await readFinalConclusionFromFile(industry);
      writeFinalConclusionToMarkdownFile(industry, conclusion);
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
