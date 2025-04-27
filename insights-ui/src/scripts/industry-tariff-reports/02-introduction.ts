import { getLlmResponse } from '@/scripts/llm-utils';
import { IndustryAreaHeadings, Introduction } from '@/scripts/industry-tariff-reports/tariff-types';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { addDirectoryIfNotPresent, reportsOutDir } from '../reportFileUtils';

// Schemas for the Introduction section of an industry report
export const AboutSectorSchema = z.object({
  title: z.string().describe('Heading for the sector overview.'),
  aboutSector: z
    .string()
    .describe(
      'Concise overview (6–8 lines) of the industry’s scope and core segments. ' +
        'Focus on key products and market drivers; include up-to-date figures as of the given date. ' +
        'Embed hyperlinks for data sources where available.'
    ),
});

export const USConsumptionSchema = z.object({
  title: z.string().describe('Heading for US consumption analysis.'),
  aboutConsumption: z
    .string()
    .describe(
      'Detailed summary (6–8 lines) of US consumption volume and value. ' +
        'Break down by end-use categories and report both tonnage and dollar figures as of the given date. ' +
        'Include hyperlinks to authoritative sources.'
    ),
});

export const PastGrowthSchema = z.object({
  title: z.string().describe('Heading for historical growth rates.'),
  aboutGrowth: z
    .string()
    .describe(
      'Analysis (6–8 lines) of the industry’s CAGR over the past five years. ' + 'Highlight major drivers and cite up-to-date metrics with hyperlinks.'
    ),
});

export const FutureGrowthSchema = z.object({
  title: z.string().describe('Heading for projected growth outlook.'),
  aboutGrowth: z
    .string()
    .describe(
      'Forecast summary (6–8 lines) of expected growth over the next five years. ' +
        'Discuss key catalysts and market trends, including volume and value forecasts. ' +
        'Provide hyperlinks to forecast reports.'
    ),
});

export const USProductionSchema = z.object({
  title: z.string().describe('Heading for US production overview.'),
  aboutProduction: z
    .string()
    .describe(
      'Summary (6–8 lines) of US production volumes and values. ' +
        'Compare domestic output to consumption and imports, specifying product types. ' +
        'Include hyperlinks for production statistics.'
    ),
});

export const CountrySpecificImportSchema = z.object({
  title: z.string().describe('Heading for country-specific import details.'),
  aboutImport: z
    .string()
    .describe(
      'Brief report (4–6 lines) on imports from a specific country. ' +
        'State volumes, values, product grades, and share of total US consumption. ' +
        'Cite data sources via hyperlinks.'
    ),
});

export const IntroductionSchema = z.object({
  aboutSector: AboutSectorSchema,
  aboutConsumption: USConsumptionSchema,
  pastGrowth: PastGrowthSchema,
  futureGrowth: FutureGrowthSchema,
  usProduction: USProductionSchema,
  countrySpecificImports: z.array(CountrySpecificImportSchema).describe('List of country-specific import analyses.'),
});

// Build the prompt for the introduction section
function getIntroductionPrompt(industry: string, date: string, industryHeadings: IndustryAreaHeadings) {
  return `
As an investor, provide an introduction to the ${industry} sub-industry (GICS) as of ${date}. 

Structure the content into 4-6 headings.

In the subsequent sections, I will be covering the headings and subheadings of the industry. So in this Introduction section:
- Provide a brief overview of the industry, including its scope and core segments.
- Discuss the US consumption of the industry, including volume and value.
- Summarize the past growth rates of the industry over the last five years.
- Provide a forecast of the industry's growth over the next five years.
- Make sure there is no overlap between the headings and subheadings that will be explained in the later parts.
- Share useful information only and not redundant information.
- Include hyperlinks/citations in the content where ever possible in the markdown format.
- Dont forget to include hyperlinks/citations in the content where ever possible.
- Include top 5 countries that have the maximum trading volume with the US for the given industry.

For each section:
- Write 6–8 lines of content (4–6 lines for country-specific imports).
- Include both volume and dollar-value data where relevant.

For output content:
- Cite the latest figures and embed hyperlinks to sources.
- Include hyperlinks/citations in the content where ever possible in the markdown format.
- Dont forget to include hyperlinks/citations in the content where ever possible.
- Avoid LaTeX, italics, or KaTeX formatting, or   character for space
- Use only headings and subheadings, bold, bullets, points, tables for formatting the content.
- Use markdown format for output.
- All amounts, dollar values, or figures should be wrapped in backticks.


Ensure the total output is at least 2,000 words, up to date as of ${date}.

Structure your response with the following sections and headings:
${JSON.stringify(industryHeadings, null, 2)}

`;
}

export { getIntroductionPrompt };

export async function getIntroduction(industry: string, date: string, industryHeadings: IndustryAreaHeadings) {
  return await getLlmResponse<Introduction>(getIntroductionPrompt(industry, date, industryHeadings), IntroductionSchema);
}

export function readIntroductionJsonFromFile(industry: string) {
  const dirPath = path.join(reportsOutDir, industry.toLowerCase(), '02-introduction');
  const filePath = path.join(dirPath, 'introduction.json');
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  // Read the file contents and convert to string
  const contents: string = fs.readFileSync(filePath, 'utf-8').toString();
  // Parse the JSON data
  const introduction: Introduction = JSON.parse(contents);
  return introduction;
}

export async function getAndWriteIntroductionsJson(industry: string, date: string, headings: IndustryAreaHeadings) {
  const introduction = await getIntroduction(industry, date, headings);
  console.log('Introduction:', introduction);
  const dirPath = path.join(reportsOutDir, industry.toLowerCase(), '02-introduction');
  const filePath = path.join(dirPath, 'introduction.json');
  fs.writeFileSync(filePath, JSON.stringify(introduction, null, 2), {
    encoding: 'utf-8',
  });
}

export function getMarkdownContentForIntroduction(introduction: Introduction) {
  const markdownContent =
    `# Introduction\n\n` +
    `## ${introduction.aboutSector.title}\n${introduction.aboutSector.aboutSector}\n\n` +
    `## ${introduction.aboutConsumption.title}\n${introduction.aboutConsumption.aboutConsumption}\n\n` +
    `## ${introduction.pastGrowth.title}\n${introduction.pastGrowth.aboutGrowth}\n\n` +
    `## ${introduction.futureGrowth.title}\n${introduction.futureGrowth.aboutGrowth}\n\n` +
    `## ${introduction.usProduction.title}\n${introduction.usProduction.aboutProduction}\n\n` +
    `## Country Specific Imports\n` +
    `${introduction.countrySpecificImports.map((importInfo) => `### ${importInfo.title}\n${importInfo.aboutImport}`).join('\n\n')}\n`;
  return markdownContent;
}

export function writeIntroductionToMarkdownFile(industry: string, introduction: Introduction) {
  const dirPath = path.join(reportsOutDir, industry.toLowerCase(), '02-introduction');
  const filePath = path.join(dirPath, 'introduction.md');
  addDirectoryIfNotPresent(dirPath);
  const markdownContent = getMarkdownContentForIntroduction(introduction);
  addDirectoryIfNotPresent(dirPath);

  fs.writeFileSync(filePath, markdownContent, {
    encoding: 'utf-8',
  });
}
