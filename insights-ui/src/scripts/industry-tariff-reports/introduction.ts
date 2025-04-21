import { IndustryHeadings } from '@/scripts/industry-tariff-reports/industry-main-headings';
import { getLlmResponse } from '@/scripts/industry-tariff-reports/llm-utils';
import fs from 'fs';
import path from 'path';
import { z, ZodObject } from 'zod';
import { addDirectoryIfNotPresent, reportsOutDir } from '../reportFileUtils';

export const AboutSectorSchema = z.object({
  title: z.string().describe('Title of the section which discusses specific industry.'),
  aboutSector: z
    .string()
    .describe(
      '6-8 lines about the sector. Make sure there are no redundant information. ' +
        'Be very specific. ' +
        'Include hyperlinks in the content where ever possible. ' +
        'Share the latest sate as of the date passed'
    ),
});

export const USConsumptionSchema = z.object({
  title: z.string().describe('Title of the section which discusses US consumption of the particular .'),
  aboutConsumption: z
    .string()
    .describe(
      '6-8 lines about the US consumption. ' +
        'Make sure there are no redundant information. ' +
        'Be very specific. Include hyperlinks in the content where ever possible. ' +
        'Share very specific information about the end use of the products in the industry being discussed. ' +
        'Share overall consumption information of raw or processed materials/product. ' +
        'Share information both in terms of volume/amound and the dollar value. ' +
        'Include hyperlinks in the content where ever possible. ' +
        'Share the latest sate as of the date passed'
    ),
});

export const PastGrowthSchema = z.object({
  title: z.string().describe('Title of the section which discusses past growth of the industry.'),
  aboutGrowth: z
    .string()
    .describe(
      '6-8 lines about the past 5 years growth rate. Make sure there are no redundant information. ' +
        'Be very specific. ' +
        'Include hyperlinks in the content where ever possible. ' +
        'Share the latest sate as of the date passed'
    ),
});

export const FutureGrowthSchema = z.object({
  title: z.string().describe('Title of the section which discusses future growth of the industry.'),
  aboutGrowth: z
    .string()
    .describe(
      '6-8 lines about the future growth rate. Make sure there are no redundant information. ' +
        'Be very specific. ' +
        'Include hyperlinks in the content where ever possible. ' +
        'Share the latest sate as of the date passed'
    ),
});

export const CountrySpecificImportSchema = z.object({
  title: z.string().describe('Title of the section which discusses country specific import.'),
  aboutImport: z
    .string()
    .describe(
      '4-6 lines about the country specific import. ' +
        'Include the amount of import and the country of origin. ' +
        'Portion of total consumption. ' +
        'Exact type of product being imported. ' +
        'Share information both in terms of volume/amound and the dollar value. ' +
        'Make sure there are no redundant information. ' +
        'Be very specific. ' +
        'Include hyperlinks in the content where ever possible. ' +
        'Share the latest sate as of the date passed'
    ),
});

export const USProductionSchema = z.object({
  title: z.string().describe('Title of the section which discusses US production of the particular .'),
  aboutProduction: z
    .string()
    .describe(
      '6-8 lines about the US production. ' +
        'Make sure there are no redundant information. ' +
        'Share information both in terms of volume/amound and the dollar value. ' +
        'Include the amount of what type of product is being produced and the portion of total consumption within the US and how does it compare to overall import.' +
        'Include hyperlinks in the content where ever possible. ' +
        'Share the latest sate as of the date passed'
    ),
});

export const IntroductionSchema = z.object({
  aboutSector: AboutSectorSchema,
  aboutConsumption: USConsumptionSchema,
  pastGrowth: PastGrowthSchema,
  futureGrowth: FutureGrowthSchema,
  usProduction: USProductionSchema,
  countrySpecificImports: z.array(CountrySpecificImportSchema).describe('Country specific import information'),
});

export interface AboutSector {
  title: string;
  aboutSector: string;
}

export interface USConsumption {
  title: string;
  aboutConsumption: string;
}
export interface PastGrowth {
  title: string;
  aboutGrowth: string;
}
export interface FutureGrowth {
  title: string;
  aboutGrowth: string;
}

export interface CountrySpecificImport {
  title: string;
  aboutImport: string;
}

export interface USProduction {
  title: string;
  aboutProduction: string;
}

export interface Introduction {
  aboutSector: AboutSector;
  aboutConsumption: USConsumption;
  pastGrowth: PastGrowth;
  futureGrowth: FutureGrowth;
  usProduction: USProduction;
  countrySpecificImports: CountrySpecificImport[];
}

function getIntroductionPrompt(industry: string, date: string, industryHeadings: IndustryHeadings) {
  const prompt: string = `
  As an investor I want to learn everything about ${industry} sub-industry(GICS). 
  
  I want to know about the consumption, production, import and growth of the industry as of the date ${date}.
  
  Here are the main type of products and companies that fall under the industry:
  
  Total length of the output should be at least 2000 words and make sure to include upto date information.
  
  Share information both in terms of volume/amound and the dollar value.
  
  Include hyperlinks in the content where ever possible.
  
  Dont use any Katex or Latex or italics formatting in the response.
  
  Dont use any Katex or Latex or italics formatting in the response.
  
  ${JSON.stringify(industryHeadings, null, 2)}
  `;

  return prompt;
}

export async function getIntroduction(industry: string, date: string, industryHeadings: IndustryHeadings) {
  return await getLlmResponse<Introduction>(getIntroductionPrompt(industry, date, industryHeadings), IntroductionSchema);
}

export async function readIntroductionJsonFromFile(industry: string) {
  const dirPath = path.join(reportsOutDir, industry.toLowerCase(), 'introduction');
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

export async function getAndWriteIntroductionsJson(industry: string, date: string, headings: IndustryHeadings) {
  const introduction = await getIntroduction(industry, date, headings);
  console.log('Introduction:', introduction);
  const dirPath = path.join(reportsOutDir, industry.toLowerCase(), 'introduction');
  const filePath = path.join(dirPath, 'introduction.json');
  fs.writeFileSync(filePath, JSON.stringify(introduction, null, 2), {
    encoding: 'utf-8',
  });
}

export function writeIntroductionToMarkdownFile(industry: string, introduction: Introduction) {
  const dirPath = path.join(reportsOutDir, industry.toLowerCase(), 'introduction');
  const filePath = path.join(dirPath, 'introduction.md');
  addDirectoryIfNotPresent(dirPath);

  const markdownContent =
    `# Introduction\n\n` +
    `## ${introduction.aboutSector.title}\n${introduction.aboutSector.aboutSector}\n\n` +
    `## ${introduction.aboutConsumption.title}\n${introduction.aboutConsumption.aboutConsumption}\n\n` +
    `## ${introduction.pastGrowth.title}\n${introduction.pastGrowth.aboutGrowth}\n\n` +
    `## ${introduction.futureGrowth.title}\n${introduction.futureGrowth.aboutGrowth}\n\n` +
    `## ${introduction.usProduction.title}\n${introduction.usProduction.aboutProduction}\n\n` +
    `## Country Specific Imports\n` +
    `${introduction.countrySpecificImports.map((importInfo) => `### ${importInfo.title}\n${importInfo.aboutImport}`).join('\n\n')}\n`;
  addDirectoryIfNotPresent(dirPath);

  fs.writeFileSync(filePath, markdownContent, {
    encoding: 'utf-8',
  });
}
