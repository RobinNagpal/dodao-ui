import { industryHeadingsFileName } from '@/scripts/industry-tariff-reports/00-industry-main-headings';
import { generateMarkdownContent } from '@/scripts/industry-tariff-reports/render-tariff-markdown';
import { IndustryAreasWrapper } from '@/scripts/industry-tariff-reports/tariff-types';
import { getJsonFromS3, uploadFileToS3 } from '@/scripts/report-file-utils';

function getS3KeyForIndustryAreas(industry: string, fileName: string): string {
  return `koalagains-reports/tariff-reports/${industry.toLowerCase()}/${fileName}`;
}

async function writeJsonFileForIndustryAreas(industry: string, headings: IndustryAreasWrapper) {
  const jsonKey = getS3KeyForIndustryAreas(industry, industryHeadingsFileName);
  await uploadFileToS3(new TextEncoder().encode(JSON.stringify(headings, null, 2)), jsonKey, 'application/json');
}

export async function writeJsonAndMarkdownFilesForIndustryAreas(industry: string, headings: IndustryAreasWrapper) {
  await writeJsonFileForIndustryAreas(industry, headings);
  // Generate and upload markdown
  const fileName = industryHeadingsFileName.replace('.json', '.md');
  const markdownContent = generateMarkdownContent(industry, headings);
  const markdownKey = getS3KeyForIndustryAreas(industry, fileName);
  await uploadFileToS3(new TextEncoder().encode(markdownContent), markdownKey, 'text/markdown');
}

export async function readIndustryHeadingsFromFile(industry: string): Promise<IndustryAreasWrapper | undefined> {
  const key = getS3KeyForIndustryAreas(industry, industryHeadingsFileName);
  return await getJsonFromS3<IndustryAreasWrapper>(key);
}

export async function writeIndustryHeadingsToMarkdownFile(industry: string, headings: IndustryAreasWrapper) {
  const markdownContent = generateMarkdownContent(industry, headings);
  const key = getS3KeyForIndustryAreas(industry, industryHeadingsFileName.replace('.json', '.md'));
  await uploadFileToS3(new TextEncoder().encode(markdownContent), key, 'text/markdown');
}
