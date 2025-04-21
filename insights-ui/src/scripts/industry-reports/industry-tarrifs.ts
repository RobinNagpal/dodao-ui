import { IndustryHeadings } from '@/scripts/industry-reports/industry-main-headings';
import { getLlmResponse } from '@/scripts/industry-reports/llm-utils';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { addDirectoryIfNotPresent, reportsOutDir } from '../reportFileUtils';

const CountrySpecificTariffSchema = z.object({
  countryName: z.string().describe('Name of the country.'),
  tariffDetails: z
    .string()
    .describe(
      'Description of the new tariffs added as of the mentioned date for the given industry.' +
        'Include hyperlinks/citations in the content where ever possible. ' +
        'Every definition, and number, company name etc should have a hyperlink. '
    ),
  changes: z
    .string()
    .describe(
      'Description of the changes in the tariff policy as compared to the previous policy for the given industry.' +
        'Include hyperlinks/citations in the content where ever possible. ' +
        'Every definition, and number, company name etc should have a hyperlink. '
    ),
});

const TariffUpdatesForIndustrySchema = z.object({
  countrySpecificTariffs: z
    .array(CountrySpecificTariffSchema)
    .describe('Details of the new tariffs added for the top 5 countries who has the maximum trading volume with the US for the given industry.'),
});

export interface CountrySpecificTariff {
  countryName: string;
  tariffDetails: string;
  changes: string;
}

export interface TariffUpdatesForIndustry {
  countrySpecificTariffs: CountrySpecificTariff[];
}

function getTariffUpdatesForIndustryPrompt(industry: string, date: string, headings: IndustryHeadings) {
  const prompt = `
  I want to know about the new tariffs added for the ${industry} industry as of ${date}.
  Make sure to verify all the new tariffs added for ${industry} industry and as of ${date} because they have been changing almost everyday.
  Please give me the details of the new tariffs added for the top 5 countries who has the maximum trading volume with the US for the given industry. 
  The details should include 
  - Name of the country
  - Description of the new tariffs added as of the mentioned date for the given industry
  - Description of the changes in the tariff policy as compared to the previous policy for the given industry
  
  
  Include hyperlinks/citations in the content where ever possible.
  Every definition, and number should have a hyperlink.
  
  Here are more details about the areas of the industry that I want to know about:
  
  ${JSON.stringify(headings, null, 2)}
  `;

  return prompt;
}

async function getTariffUpdatesForIndustry(industry: string, date: string, headings: IndustryHeadings): Promise<TariffUpdatesForIndustry> {
  const prompt = getTariffUpdatesForIndustryPrompt(industry, date, headings);

  const tariffUpdatesResponse: TariffUpdatesForIndustry = await getLlmResponse<TariffUpdatesForIndustry>(prompt, TariffUpdatesForIndustrySchema);
  console.log('LLM analysis response:\n', JSON.stringify(tariffUpdatesResponse, null, 2));

  return tariffUpdatesResponse;
}

export async function getTariffUpdatesForIndustryAndSaveToFile(industry: string, date: string, headings: IndustryHeadings) {
  const tariffUpdates = await getTariffUpdatesForIndustry(industry, date, headings);

  const dirPath = path.join(reportsOutDir, industry.toLowerCase(), 'tariff-updates');
  const filePath = path.join(dirPath, 'tariff-updates.json');
  addDirectoryIfNotPresent(dirPath);
  fs.writeFileSync(filePath, JSON.stringify(tariffUpdates, null, 2), {
    encoding: 'utf-8',
  });
}

export async function readTariffUpdatesFromFile(industry: string) {
  const dirPath = path.join(reportsOutDir, industry.toLowerCase(), 'tariff-updates');
  const filePath = path.join(dirPath, 'tariff-updates.json');
  addDirectoryIfNotPresent(dirPath);
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data) as TariffUpdatesForIndustry;
}

export function writeTariffUpdatesToMarkdownFile(industry: string, tariffUpdates: TariffUpdatesForIndustry) {
  const dirPath = path.join(reportsOutDir, industry.toLowerCase(), 'tariff-updates');
  const filePath = path.join(dirPath, 'tariff-updates.md');
  addDirectoryIfNotPresent(dirPath);

  const markdownContent =
    `# Tariff Updates for ${industry}\n\n` +
    `${tariffUpdates.countrySpecificTariffs.map((country) => `## ${country.countryName}\n\n${country.tariffDetails}\n\n${country.changes}`).join('\n\n')}\n`;

  fs.writeFileSync(filePath, markdownContent, {
    encoding: 'utf-8',
  });
}
