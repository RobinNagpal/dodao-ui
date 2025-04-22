import {
  getAndWriteEvaluateIndustryAreaJson,
  PositiveTariffImpactOnCompanyType,
  readEvaluateIndustryAreaJsonFromFile,
  writeEvaluateIndustryAreaToMarkdownFile,
} from '@/scripts/industry-tariff-reports/06-evaluate-industry-area';
import {
  getAndWriteIndustryAreaSectionToJsonFile,
  readIndustryAreaSectionFromFile,
  writeIndustryAreaSectionToMarkdownFile,
} from '@/scripts/industry-tariff-reports/05-industry-areas';
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
import * as dotenv from 'dotenv';
import {
  getTariffUpdatesForIndustryAndSaveToFile,
  readTariffUpdatesFromFile,
  TariffUpdatesForIndustry,
  writeTariffUpdatesToMarkdownFile,
} from '@/scripts/industry-tariff-reports/03-industry-tariffs';
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

dotenv.config();

async function doIt() {
  const industry = 'Plastic';
  // await getAndWriteIndustryHeadings(industry);
  const headings = await readIndustryHeadingsFromFile(industry);
  // await writeIndustryHeadingsToMarkdownFile(industry, headings);
  const date = 'April 21, 2025';

  // ##### Introduction #####
  await getAndWriteIntroductionsJson(industry, date, headings);
  const introductions = await readIntroductionJsonFromFile(industry);
  writeIntroductionToMarkdownFile(industry, introductions);

  // ##### Understand Industry #####
  // await getAndWriteUnderstandIndustryJson(industry, headings);
  // const understandIndustry = await readUnderstandIndustryJsonFromFile(industry);
  // writeUnderstandIndustryToMarkdownFile(industry, understandIndustry);

  // ##### Tariff Updates #####
  // await getTariffUpdatesForIndustryAndSaveToFile(industry, date, headings);
  const tariffUpdates: TariffUpdatesForIndustry = await readTariffUpdatesFromFile(industry);
  // writeTariffUpdatesToMarkdownFile(industry, tariffUpdates);

  // ##### Industry Area Section #####
  // await getAndWriteIndustryAreaSectionToJsonFile(industry, headings);
  // const industryAreaSection = await readIndustryAreaSectionFromFile(industry);
  // await writeIndustryAreaSectionToMarkdownFile(industry, industryAreaSection);

  // const firstIndustryArea = headings.headings[3].subHeadings[2];
  // ##### Evaluate Industry Area #####
  // await getAndWriteEvaluateIndustryAreaJson(industry, firstIndustryArea, headings, tariffUpdates, date);
  // const evaluateIndustryArea = await readEvaluateIndustryAreaJsonFromFile(industry, firstIndustryArea, headings);
  // console.log('Evaluate Industry Area:', evaluateIndustryArea);
  // writeEvaluateIndustryAreaToMarkdownFile(industry, firstIndustryArea, headings, evaluateIndustryArea);

  const tariffSummaries = headings.headings
    .flatMap((h) =>
      h.subHeadings.map((sh) => {
        return {
          heading: h,
          subHeading: sh,
        };
      })
    )
    .map((h_and_sh) => {
      const evaluateIndustryArea = readEvaluateIndustryAreaJsonFromFile(industry, h_and_sh.subHeading, headings);
      return evaluateIndustryArea.tariffImpactSummary;
    });

  // ##### Executive Summary #####
  // await getExecutiveSummaryAndSaveToFile(industry, headings, tariffUpdates, tariffSummaries);
  // const executiveSummary = await readExecutiveSummaryFromFile(industry);
  // writeExecutiveSummaryToMarkdownFile(industry, executiveSummary);
  // console.log('Executive Summary:', executiveSummary);

  const positiveImpacts: PositiveTariffImpactOnCompanyType[] = headings.headings
    .flatMap((h) =>
      h.subHeadings.map((sh) => {
        return {
          heading: h,
          subHeading: sh,
        };
      })
    )
    .flatMap((h_and_sh) => {
      const evaluateIndustryArea = readEvaluateIndustryAreaJsonFromFile(industry, h_and_sh.subHeading, headings);
      return evaluateIndustryArea.positiveTariffImpactOnCompanyType;
    });

  const negativeImpacts = headings.headings
    .flatMap((h) =>
      h.subHeadings.map((sh) => {
        return {
          heading: h,
          subHeading: sh,
        };
      })
    )
    .flatMap((h_and_sh) => {
      const evaluateIndustryArea = readEvaluateIndustryAreaJsonFromFile(industry, h_and_sh.subHeading, headings);
      return evaluateIndustryArea.negativeTariffImpactOnCompanyType;
    });

  // ##### Final Conclusion #####
  // await getFinalConclusionAndSaveToFile(industry, headings, tariffUpdates, tariffSummaries, positiveImpacts, negativeImpacts);
  // const finalConclusion = await readFinalConclusionFromFile(industry);
  // writeFinalConclusionToMarkdownFile(industry, finalConclusion);
}

doIt().catch((err) => {
  console.error(err);
});
