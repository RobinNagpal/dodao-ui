import {
  getAndWriteIndustryHeadings,
  readIndustryHeadingsFromFile,
  writeIndustryHeadingsToMarkdownFile,
} from '@/scripts/industry-tariff-reports/00-industry-main-headings';
import { getAndWriteIntroductionsJson, readIntroductionJsonFromFile, writeIntroductionToMarkdownFile } from '@/scripts/industry-tariff-reports/02-introduction';
import {
  getAndWriteUnderstandIndustryJson,
  readUnderstandIndustryJsonFromFile,
  writeUnderstandIndustryToMarkdownFile,
} from '@/scripts/industry-tariff-reports/04-understand-industry';
import {
  getTariffUpdatesForIndustryAndSaveToFile,
  readTariffUpdatesFromFile,
  writeTariffUpdatesToMarkdownFile,
  TariffUpdatesForIndustry,
} from '@/scripts/industry-tariff-reports/03-industry-tariffs';
import {
  getAndWriteIndustryAreaSectionToJsonFile,
  readIndustryAreaSectionFromFile,
  writeIndustryAreaSectionToMarkdownFile,
} from '@/scripts/industry-tariff-reports/05-industry-areas';
import {
  getAndWriteEvaluateIndustryAreaJson,
  readEvaluateIndustryAreaJsonFromFile,
  writeEvaluateIndustryAreaToMarkdownFile,
  PositiveTariffImpactOnCompanyType,
} from '@/scripts/industry-tariff-reports/06-evaluate-industry-area';
import {
  getExecutiveSummaryAndSaveToFile,
  readExecutiveSummaryFromFile,
  writeExecutiveSummaryToMarkdownFile,
} from '@/scripts/industry-tariff-reports/01-executive-summary';
import {
  getFinalConclusionAndSaveToFile,
  readFinalConclusionFromFile,
  writeFinalConclusionToMarkdownFile,
} from '@/scripts/industry-tariff-reports/07-final-conclusion';
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

/**
 * Generate the specified section of the industry report.
 * @param reportType Which part of the report to produce
 * @param industry The industry name (e.g., 'Plastic')
 * @param date Report date string (e.g., 'April 21, 2025')
 */
export async function doIt(reportType: ReportType, industry: string, date: string) {
  // Pre-read common dependencies
  const headings = await readIndustryHeadingsFromFile(industry);

  switch (reportType) {
    case ReportType.HEADINGS:
      await getAndWriteIndustryHeadings(industry);
      writeIndustryHeadingsToMarkdownFile(industry, headings);
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
      const firstArea = headings.headings[0].subHeadings[0];
      await getAndWriteEvaluateIndustryAreaJson(industry, firstArea, headings, tariff!, date);
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

// Example usage:
doIt(ReportType.EVALUATE_INDUSTRY_AREA, 'Plastic', 'April 21, 2025').catch(console.error);
// doIt(ReportType.ALL, 'Plastic', 'April 21, 2025').catch(console.error);
