import { cleanOpenAIUrls, getLlmResponse, gpt4OSearchModel, outputInstructions, recursivelyCleanOpenAiUrls } from '@/scripts/llm-utils';
import { CountrySpecificTariff, IndustryAreasWrapper, TariffUpdatesForIndustry } from '@/scripts/industry-tariff-reports/tariff-types';
import { z } from 'zod';
import { uploadFileToS3, getJsonFromS3 } from '@/scripts/report-file-utils';

const CountrySpecificTariffSchema = z.object({
  countryName: z.string().describe('Name of the country.'),
  tariffDetails: z
    .string()
    .describe(
      'Description of the new tariffs added as of the mentioned date for the given industry. Add 4-5 lines' +
        'Include hyperlinks/citations in the content where ever possible. ' +
        'Every definition, and number, company name etc should have a hyperlink. '
    ),
  existingTradeAmountAndAgreement: z
    .string()
    .describe(
      'Description and the amount of trade that is conducted with the US for the given industry. Add 4-5 lines' +
        'Include hyperlinks/citations in the content where ever possible. ' +
        'Every definition, and number, company name etc should have a hyperlink. '
    ),
  newChanges: z
    .string()
    .describe(
      'Description of the changes in the tariff policy as compared to the previous policy for the given industry. Add 4-5 lines' +
        'Include hyperlinks/citations in the content where ever possible. ' +
        'Every definition, and number, company name etc should have a hyperlink. '
    ),
  tradeExemptedByNewTariff: z
    .string()
    .describe(
      'Description of the subcategories and the amount of trade exempted by the new tariff for the given industry.' +
        'Include hyperlinks/citations in the content where ever possible. '
    ),
  tradeImpactedByNewTariff: z
    .string()
    .describe(
      'Description of the subcategories and the amount of trade impacted by the new tariff for the given industry.' +
        'Include hyperlinks/citations in the content where ever possible. '
    ),

  tariffChangesForIndustrySubArea: z
    .string()
    .array()
    .describe(
      'Change of tariff for the specific sub-area. Tell me one line for each sub-area/sub-heading' +
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

function getTariffUpdatesForIndustryPrompt(industry: string, date: string, headings: IndustryAreasWrapper, country: string) {
  const prompt = `
  I want to know about the new tariffs added for the ${industry} industry as of ${date} for ${country}.
  Make sure to verify all the new tariffs added for ${industry} industry and as of ${date} for ${country} because they have been changing almost everyday.

  Please give me the details of the new tariffs added for ${country}. 

  The details should include 
  - Name of the country
  - Amount of trade that is conducted with the US for the given industry
  - Description of the new tariffs added as of the mentioned date for the given industry. Add 6-8 lines of description.
  - Verify if the tariffs have actually been added for the given industry and country.
  - Many of the articles share that that the tariffs might be applied, don't consider those articles which are not 100% sure that the tariffs have been added.
  - Description of the changes in the tariff policy as compared to the previous policy for the given industry. Add 6-8 lines for this as well.
  - For Canada and Mexico, make sure to consider only the tariffs that are added in excess of the USMCA agreement.
  - For other countries, make sure to consider only the tariffs that are added in excess of the existing agreement.
  - Include the real date when the tariffs were added.
  - We are interested in the tariffs that US has added
  - You can also include the tariff that the other country has added, but stress more on the tariffs that US has added.
 
  Also many or most of the products or subcategories can be exempted from the new tariffs. Calculate and mention the  
  amount of trade that is impacted by the new tariff and the amount of trade that is exempted by the new tariff for 
  the given industry.
  
  For each of the Industry Areas & Subareas below, I want to 
  1. Know the changes to the tariffs for that area and sub-area and ${country} by the Trump Government.
  2. I want to know the exact change. Mention the numerical figures as much as possible. 
  
 
  # Industry Areas
  ${JSON.stringify(headings, null, 2)}
  
  # Output Instructions
  ${outputInstructions}
  `;

  return prompt;
}

// 3) Use it in your tariff-fetcher
async function getTariffUpdatesForIndustry(industry: string, date: string, headings: IndustryAreasWrapper): Promise<TariffUpdatesForIndustry> {
  console.log(`Fetching top 5 trading partners for ${industry}…`);
  const topCountries = await getTopTradingCountries(industry, date);

  console.log(`Invoking LLM for tariffs for each of:`, topCountries);
  const countrySpecificTariffs: CountrySpecificTariff[] = [];

  for (const country of topCountries) {
    const prompt = getTariffUpdatesForIndustryPrompt(industry, date, headings, country);
    console.log(`Fetching tariffs for ${country}…`);
    const countryTariff = await getLlmResponse<CountrySpecificTariff>(prompt, CountrySpecificTariffSchema, 'gpt-4o-search-preview');
    console.log(`Tariff for ${country} fetched successfully.`, JSON.stringify(countryTariff));
    countrySpecificTariffs.push(countryTariff);
  }

  return { countrySpecificTariffs };
}

function getS3Key(industry: string, fileName: string): string {
  return `koalagains-reports/tariff-reports/${industry.toLowerCase()}/03-tariff-updates/${fileName}`;
}

export async function getTariffUpdatesForIndustryAndSaveToFile(industry: string, date: string, headings: IndustryAreasWrapper) {
  const tariffUpdates = await getTariffUpdatesForIndustry(industry, date, headings);

  // Upload JSON to S3
  const jsonKey = getS3Key(industry, 'tariff-updates.json');
  await uploadFileToS3(new TextEncoder().encode(JSON.stringify(tariffUpdates, null, 2)), jsonKey, 'application/json');

  // Generate and upload markdown
  const markdownContent = getMarkdownContentForIndustryTariffs(industry, tariffUpdates);
  const markdownKey = getS3Key(industry, 'tariff-updates.md');
  await uploadFileToS3(new TextEncoder().encode(markdownContent), markdownKey, 'text/markdown');
}

export async function readTariffUpdatesFromFile(industry: string): Promise<TariffUpdatesForIndustry | undefined> {
  const key = getS3Key(industry, 'tariff-updates.json');
  return await getJsonFromS3<TariffUpdatesForIndustry>(key);
}

function getMarkdownContentForCountryTariffs(tariff: CountrySpecificTariff) {
  return (
    `## ${tariff.countryName}\n\n` +
    `${tariff.tariffDetails}\n\n` +
    `${tariff.existingTradeAmountAndAgreement}\n\n` +
    `${tariff.newChanges}\n\n` +
    `${tariff.tariffChangesForIndustrySubArea?.map((changes) => `- ${changes}`)?.join('\n\n')}\n\n` +
    `### Trade Impacted by New Tariff\n\n` +
    `${tariff.tradeImpactedByNewTariff}\n\n` +
    `### Trade Exempted by New Tariff\n\n` +
    `${tariff.tradeExemptedByNewTariff}\n`
  );
}

export function getMarkdownContentForIndustryTariffs(industry: string, tariffUpdates: TariffUpdatesForIndustry) {
  const markdownContent =
    `# Tariff Updates for ${industry}\n\n` +
    `${tariffUpdates.countrySpecificTariffs.map((country) => getMarkdownContentForCountryTariffs(country)).join('\n\n')}\n`;
  const cleanOpenAIUrls1 = recursivelyCleanOpenAiUrls(markdownContent);
  console.log(`Markdown content for ${industry}:\n`, cleanOpenAIUrls1);
  return cleanOpenAIUrls1;
}

export async function writeTariffUpdatesToMarkdownFile(industry: string, tariffUpdates: TariffUpdatesForIndustry) {
  const markdownContent = getMarkdownContentForIndustryTariffs(industry, tariffUpdates);
  const key = getS3Key(industry, 'tariff-updates.md');
  await uploadFileToS3(new TextEncoder().encode(markdownContent), key, 'text/markdown');
}
