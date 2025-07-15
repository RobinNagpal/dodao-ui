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
import { getTariffIndustryDefinitionById, TariffIndustryDefinition, TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';
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
import { ReportType } from '@/scripts/industry-tariff-reports/tariff-types';
import * as dotenv from 'dotenv';

dotenv.config();

export async function doIt(
  reportType: ReportType,
  tariffIndustry: TariffIndustryDefinition,
  evaluationReportToGenerate: {
    headingIndex: number;
    subHeadingIndex: number;
  } = {
    headingIndex: 0,
    subHeadingIndex: 0,
  }
) {
  const industryId = tariffIndustry.industryId;
  const date = 'May 2, 2025'; // TODO: Update this to be dynamic
  // Pre-read common dependencies

  await getAndWriteIndustryHeadings(industryId);
  const headings = await readIndustryHeadingsFromFile(industryId);
  if (!headings) throw new Error('Headings not found');

  switch (reportType) {
    case ReportType.HEADINGS:
      await getAndWriteIndustryHeadings(industryId);
      await writeMarkdownFileForIndustryAreas(industryId, headings);
      break;

    case ReportType.UNDERSTAND_INDUSTRY:
      await getAndWriteUnderstandIndustryJson(industryId, headings);
      const understandIndustry = await readUnderstandIndustryJsonFromFile(industryId);
      if (!understandIndustry) throw new Error('Understand industry section not found');
      await writeMarkdownFileForUnderstandIndustry(industryId, understandIndustry);
      break;

    case ReportType.TARIFF_UPDATES:
      await getTariffUpdatesForIndustryAndSaveToFile(industryId, date, headings);
      const tariffUpdatesForIndustry = await readTariffUpdatesFromFile(industryId);
      if (!tariffUpdatesForIndustry) throw new Error('Tariff updates not found');
      await writeMarkdownFileForIndustryTariffs(industryId, tariffUpdatesForIndustry);
      break;

    case ReportType.INDUSTRY_AREA_SECTION:
      await getAndWriteIndustryAreaSectionToJsonFile(industryId, headings);
      const industryAreaSection = await readIndustryAreaSectionFromFile(industryId);
      if (!industryAreaSection) throw new Error('Industry area section not found');
      await writeMarkdownFileForIndustryAreaSections(industryId, industryAreaSection);
      break;

    case ReportType.EVALUATE_INDUSTRY_AREA:
      const tariff = await readTariffUpdatesFromFile(industryId);
      const { headingIndex, subHeadingIndex } = evaluationReportToGenerate;
      const firstArea = headings.areas[headingIndex].subAreas[subHeadingIndex];
      await getAndWriteEvaluateIndustryAreaJson(tariffIndustry, firstArea, headings, tariff!, date);
      const evaluated = await readEvaluateSubIndustryAreaJsonFromFile(industryId, firstArea, headings);
      if (evaluated) {
        await writeMarkdownFileForEvaluateSubIndustryArea(industryId, firstArea, headings, evaluated);
      }
      break;

    case ReportType.EXECUTIVE_SUMMARY:
      const tariffUpdates = await readTariffUpdatesFromFile(industryId);
      const summaries = await getSummariesOfEvaluatedAreas(industryId, headings);
      if (!tariffUpdates) throw new Error('Tariff updates not found');
      await getExecutiveSummaryAndSaveToFile(industryId, headings, tariffUpdates, summaries);
      const execSummary = await readExecutiveSummaryFromFile(industryId);
      if (!execSummary) throw new Error('Executive summary not found');
      await writeMarkdownFileForExecutiveSummary(industryId, execSummary);
      break;

    case ReportType.REPORT_COVER:
      const tariffUpd = await readTariffUpdatesFromFile(industryId);
      const summ = await getSummariesOfEvaluatedAreas(industryId, headings);
      if (!tariffUpd) throw new Error('Tariff updates not found');
      const executiveSummary = await readExecutiveSummaryFromFile(industryId);
      if (!executiveSummary) throw new Error('Executive summary not found');
      if (!tariffUpd) throw new Error('Tariff updates not found');
      await getReportCoverAndSaveToFile(industryId, headings, executiveSummary, tariffUpd, summ);
      const reportCover = await readReportCoverFromFile(industryId);
      if (!reportCover) throw new Error('Report cover not found');
      await writeMarkdownFileForReportCover(industryId, reportCover);
      break;

    case ReportType.FINAL_CONCLUSION:
      const tariffs = await readTariffUpdatesFromFile(industryId);
      if (!tariffs) throw new Error('Tariff updates not found');
      const summariesAll = await getSummariesOfEvaluatedAreas(industryId, headings);
      const positiveImpacts = await getPositiveImpactsOfEvaluatedAreas(industryId, headings);
      const negativeImpacts = await getNegativeImpactsOfEvaluatedAreas(industryId, headings);
      await getFinalConclusionAndSaveToFile(industryId, headings, tariffs, summariesAll, positiveImpacts, negativeImpacts);
      const conclusion = await readFinalConclusionFromFile(industryId);
      if (!conclusion) throw new Error('Final conclusion not found');
      await writeMarkdownFileForFinalConclusion(industryId, conclusion);
      break;

    case ReportType.ALL:
    default:
      // Run all sections in sequence
      for (const type of Object.values(ReportType)) {
        if (type === ReportType.ALL) continue;
        // @ts-ignore
        await doIt(type as ReportType, tariffIndustry);
      }
      break;
  }
}

const industry = getTariffIndustryDefinitionById(TariffIndustryId.automobiles);
const apparel = getTariffIndustryDefinitionById(TariffIndustryId.apparelandaccessories);

doIt(ReportType.ALL, apparel)
  .then(() => console.log('Apparel & Accessories report done'))
  .catch(console.error);

// Example usage:
// doIt(ReportType.HEADINGS, industry, {
//   headingIndex: 1,
//   subHeadingIndex: 0,
// })
//   .then(() => {
//     console.log('Tariff updates generated successfully.');
//   })
//   .catch(console.error);
// doIt(ReportType.ALL, 'Plastic', 'April 21, 2025').catch(console.error);
