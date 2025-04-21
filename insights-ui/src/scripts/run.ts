import {
  getAndWriteEvaluateIndustryAreaJson,
  readEvaluateIndustryAreaJsonFromFile,
  writeEvaluateIndustryAreaToMarkdownFile,
} from '@/scripts/industry-reports/evaluate-industry-area';
import {
  getAndWriteIndustryHeadings,
  readIndustryHeadingsFromFile,
  writeIndustryHeadingsToMarkdownFile,
} from '@/scripts/industry-reports/industry-main-headings';
import { getAndWriteIntroductionsJson, readIntroductionJsonFromFile, writeIntroductionToMarkdownFile } from '@/scripts/industry-reports/introduction';
import {
  getAndWriteUnderstandIndustryJson,
  readUnderstandIndustryJsonFromFile,
  writeUnderstandIndustryToMarkdownFile,
} from '@/scripts/industry-reports/understand-industry';
import * as dotenv from 'dotenv';
import {
  getTariffUpdatesForIndustryAndSaveToFile,
  readTariffUpdatesFromFile,
  TariffUpdatesForIndustry,
  writeTariffUpdatesToMarkdownFile,
} from './industry-reports/industry-tarrifs';

dotenv.config();

async function doIt() {
  const industry = 'Plastic';
  // await getAndWriteIndustryHeadings(industry);
  const headings = await readIndustryHeadingsFromFile(industry);
  // await writeIndustryHeadingsToMarkdownFile(industry, headings);
  const date = 'April 20, 2025';

  // ##### Introduction #####
  // await getAndWriteIntroductionsJson(industry, date, headings);
  // const introductions = await readIntroductionJsonFromFile(industry);
  // writeIntroductionToMarkdownFile(industry, introductions);

  // ##### Understand Industry #####
  // await getAndWriteUnderstandIndustryJson(industry, headings);
  // const understandIndustry = await readUnderstandIndustryJsonFromFile(industry);
  // writeUnderstandIndustryToMarkdownFile(industry, understandIndustry);

  // ##### Tariff Updates #####
  // await getTariffUpdatesForIndustryAndSaveToFile(industry, date, headings);
  const tariffUpdates: TariffUpdatesForIndustry = await readTariffUpdatesFromFile(industry);
  // writeTariffUpdatesToMarkdownFile(industry, tariffUpdates);

  const firstIndustryArea = headings.headings[0].subHeadings[1];
  // ##### Evaluate Industry Area #####
  await getAndWriteEvaluateIndustryAreaJson(industry, firstIndustryArea, headings, tariffUpdates, date);
  const evaluateIndustryArea = await readEvaluateIndustryAreaJsonFromFile(industry, firstIndustryArea, headings);
  console.log('Evaluate Industry Area:', evaluateIndustryArea);
  writeEvaluateIndustryAreaToMarkdownFile(industry, firstIndustryArea, headings, evaluateIndustryArea);
}

doIt().catch((err) => {
  console.error(err);
});
