import { getLlmResponse, gpt4OSearchModel, outputInstructions } from '@/scripts/industry-tariff-reports/llm-utils';
import { CountrySpecificTariff, IndustryAreaHeadings, TariffUpdatesForIndustry } from '@/scripts/industry-tariff-reports/tariff-types';
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

// 1) Schema for exactly 5 country names
const TopCountriesSchema = z.object({
  topCountries: z.array(z.string()).describe('Array of exactly 5 country names whose trading volume with the US is highest for the given industry.'),
});

// 2) Prompt builder + fetcher
function getTopTradingCountriesPrompt(industry: string, date: string) {
  return `
Identify the top 5 countries by trading volume with the U.S. for the ${industry} industry as of ${date}.
Output a JSON object with a single key \`topCountries\`, whose value is an array of exactly five ISO-style country names (strings).
Example:
\`\`\`
{
  "topCountries": ["China", "Canada", "Mexico", "Germany", "Japan"]
}
\`\`\`
No extra keys or commentary.

Fetch the countries in the descending order of trading volume with the US for the provided industry.
`;
}

async function getTopTradingCountries(industry: string, date: string): Promise<string[]> {
  const prompt = getTopTradingCountriesPrompt(industry, date);
  const response = await getLlmResponse<{ topCountries: string[] }>(prompt, TopCountriesSchema);
  return response.topCountries;
}

function getTariffUpdatesForIndustryPrompt(industry: string, date: string, headings: IndustryAreaHeadings, country: string) {
  const prompt = `
  I want to know about the new tariffs added for the ${industry} industry as of ${date} for ${country}.
  Make sure to verify all the new tariffs added for ${industry} industry and as of ${date} for ${country} because they have been changing almost everyday.

  Please give me the details of the new tariffs added for ${country}. 

  The details should include 
  - Name of the country
  - Description of the new tariffs added as of the mentioned date for the given industry. Add 6-8 lines of description.
  - Description of the changes in the tariff policy as compared to the previous policy for the given industry. Add 6-8 lines for this as well.
  - Include the real date when the tariffs were added.
  - We are interested in the tariffs that US has added
  - You can also include the tariff that the other country has added, but stress more on the tariffs that US has added.
  
  
  ${outputInstructions}
  
  Here are more details about the areas of the industry about which I want to know the tariffs:
  
  # Industry Areas
  ${JSON.stringify(headings, null, 2)}
  `;

  return prompt;
}

// 3) Use it in your tariff-fetcher
async function getTariffUpdatesForIndustry(industry: string, date: string, headings: IndustryAreaHeadings): Promise<TariffUpdatesForIndustry> {
  console.log(`Fetching top 5 trading partners for ${industry}…`);
  const topCountries = await getTopTradingCountries(industry, date);

  console.log(`Invoking LLM for tariffs for each of:`, topCountries);
  const countrySpecificTariffs: CountrySpecificTariff[] = [];

  for (const country of topCountries) {
    const prompt = getTariffUpdatesForIndustryPrompt(industry, date, headings, country);
    const countryTariff = await getLlmResponse<CountrySpecificTariff>(prompt, CountrySpecificTariffSchema, gpt4OSearchModel);
    countrySpecificTariffs.push(countryTariff);
  }

  return { countrySpecificTariffs };
}

function getJsonFilePath(industry: string) {
  const dirPath = path.join(reportsOutDir, industry.toLowerCase(), '03-tariff-updates');
  const filePath = path.join(dirPath, 'tariff-updates.json');
  addDirectoryIfNotPresent(dirPath);
  return filePath;
}

export async function getTariffUpdatesForIndustryAndSaveToFile(industry: string, date: string, headings: IndustryAreaHeadings) {
  const tariffUpdates = await getTariffUpdatesForIndustry(industry, date, headings);
  const filePath = getJsonFilePath(industry);
  fs.writeFileSync(filePath, JSON.stringify(tariffUpdates, null, 2), {
    encoding: 'utf-8',
  });
}

export function readTariffUpdatesFromFile(industry: string) {
  const filePath = getJsonFilePath(industry);
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data) as TariffUpdatesForIndustry;
}

export function getMarkdownContentForIndustryTariffs(industry: string, tariffUpdates: TariffUpdatesForIndustry) {
  const markdownContent =
    `# Tariff Updates for ${industry}\n\n` +
    `${tariffUpdates.countrySpecificTariffs.map((country) => `## ${country.countryName}\n\n${country.tariffDetails}\n\n${country.changes}`).join('\n\n')}\n`;
  return markdownContent;
}

export function writeTariffUpdatesToMarkdownFile(industry: string, tariffUpdates: TariffUpdatesForIndustry) {
  const filePath = getJsonFilePath(industry).replace('.json', '.md');
  const markdownContent = getMarkdownContentForIndustryTariffs(industry, tariffUpdates);

  fs.writeFileSync(filePath, markdownContent, {
    encoding: 'utf-8',
  });
}
