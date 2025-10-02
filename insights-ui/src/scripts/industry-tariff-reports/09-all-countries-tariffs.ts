import {
  readTariffUpdatesFromFile,
  writeJsonFileForAllCountriesTariffUpdates,
  writeMarkdownFileForAllCountriesTariffUpdates,
  writeLastModifiedDatesToFile,
  readLastModifiedDatesFromFile,
} from '@/scripts/industry-tariff-reports/tariff-report-read-write';
import { CountrySpecificTariff, IndustryAreasWrapper, AllCountriesTariffUpdatesForIndustry } from '@/scripts/industry-tariff-reports/tariff-types';
import { getLlmResponse, outputInstructions, recursivelyCleanOpenAiUrls } from '@/scripts/llm-utils';
import { getDateAsMonthDDYYYYFormat } from '@/util/get-date';
import { z } from 'zod';
import { getTariffIndustryDefinitionById, TariffIndustryId } from './tariff-industries';

const CountrySpecificTariffSchema = z.object({
  countryName: z.string().describe('Name of the country.'),
  tradeVolume: z
    .string()
    .describe(
      'Total trade volume between this country and the US for the given industry in USD (e.g., $X.X billion annually). ' +
        'Include hyperlinks/citations to official trade data sources.'
    ),
  tariffBeforeTrump: z
    .string()
    .describe(
      'Tariff rates that were in effect before Trump administration changes for this industry. ' +
        'Specify percentage rates for different product categories. Include hyperlinks to pre-2017 tariff schedules.'
    ),
  newTariffUpdates: z
    .string()
    .describe(
      'Description of the new tariff rates implemented by the Trump administration for this industry and country. ' +
        'Include specific percentage increases, effective dates, and product categories affected. Add 6-8 lines of detail. ' +
        'Include hyperlinks/citations to official government announcements and trade policy documents.'
    ),
  effectiveDate: z
    .string()
    .describe(
      'Exact date when the new tariffs became effective (format: Month DD, YYYY). ' +
        'Include hyperlinks to the official Federal Register notices or presidential proclamations.'
    ),
  source: z
    .string()
    .describe(
      'Primary sources used for this information including official government websites, trade databases, and policy documents. ' +
        'List 2-3 key sources with their URLs.'
    ),
});

// Schema for all countries tariff data in a single response
const AllCountriesTariffDataSchema = z.object({
  countries: z.array(CountrySpecificTariffSchema).describe('Array of tariff data for all requested countries'),
});

// 1) Schema for exactly 15 additional country names (excluding existing top 5)
const AllCountriesSchema = z.object({
  allCountries: z
    .array(z.string())
    .describe(
      'Array of exactly 15 additional country names whose trading volume with the US is significant for the given industry, excluding the existing top 5 countries.'
    ),
});

// 2) Prompt builder + fetcher for additional 15 countries (we already have top 5)
function getAllCountriesPrompt(industry: TariffIndustryId, date: string, existingTop5Countries: string[]) {
  const definition = getTariffIndustryDefinitionById(industry);
  return `
I need to get 15 additional countries for the ${definition.name} industry analysis. Here's what I need:

CRITICAL: We already have the top 5 countries from the existing tariff updates section: ${existingTop5Countries.join(', ')}
These are the highest trading volume countries that are already covered and MUST BE EXCLUDED.

Now I need 15 more significant trading partners to make a total of 20 countries.
Focus on other important trading partners that complement the existing top 5.

IMPORTANT: Do NOT include any of these countries in your response: ${existingTop5Countries.join(', ')}

Output a JSON object with a single key \`allCountries\`, whose value is an array of exactly 15 country names.
Example:
\`\`\`
{
  "allCountries": ["Netherlands", "Belgium", "Italy", "France", "Spain", "Poland", "Czech Republic", "Hungary", "Austria", "Sweden", "Denmark", "Finland", "Ireland", "Portugal", "Greece"]
}
\`\`\`
No extra keys or commentary.

Fetch 15 additional countries in descending order of trading volume with the US for the ${
    definition.name
  } industry, ABSOLUTELY EXCLUDING these countries we already have: ${existingTop5Countries.join(', ')}.
`;
}

async function getAllCountries(industry: TariffIndustryId, date: string, existingTop5Countries: string[]): Promise<string[]> {
  const prompt = getAllCountriesPrompt(industry, date, existingTop5Countries);
  const response = await getLlmResponse<{ allCountries: string[] }>(prompt, AllCountriesSchema);
  return response.allCountries;
}

function getAllCountriesTariffUpdatesPrompt(industry: TariffIndustryId, date: string, headings: IndustryAreasWrapper, countries: string[]) {
  const definition = getTariffIndustryDefinitionById(industry);
  const prompt = `
  As of today (${getDateAsMonthDDYYYYFormat(date)}), I want to know about the new or recent tariffs added for the ${
    definition.name
  } industry for multiple countries.

  IMPORTANT: Provide tariff data for ALL of these countries in a single response: ${countries.join(', ')}

  Make sure to verify all the new tariffs added for ${definition.name} industry and as of ${getDateAsMonthDDYYYYFormat(
    date
  )} for each country because they have been changing almost everyday.

  Make sure to verify the tariff information on official government websites or trade websites for tariff information, and also make sure that you have referred to all the information as of ${getDateAsMonthDDYYYYFormat(
    date
  )}.

  Don't use or refer to koalagains.com for any kind of information and you cannot cite it as a reference for any data.
  Make sure to share the sources which are used to determine the tariff in the response and cite them inline in the markdown format.

  For EACH country, provide the following details:
  - Name of the country
  - Total trade volume between this country and the US for the given industry in USD (e.g., $X.X billion annually)
  - Tariff rates that were in effect before Trump administration changes
  - Description of the new tariff rates implemented by the Trump administration (6-8 lines of detail)
  - Exact date when the new tariffs became effective (format: Month DD, YYYY)
  - Primary sources used (2-3 key sources with URLs)

  Guidelines for each country:
  - Verify if the tariffs have actually been added for the given industry and country.
  - Many articles share that tariffs might be applied, don't consider those articles which are not 100% sure that the tariffs have been added.
  - For Canada and Mexico, make sure to consider only the tariffs that are added in excess of the USMCA agreement.
  - For other countries, make sure to consider only the tariffs that are added in excess of the existing agreement.
  - Include the real date when the tariffs were added.
  - We are interested in the tariffs that US has added
  - You can also include the tariff that the other country has added, but stress more on the tariffs that US has added.
  - Many products or subcategories can be exempted from the new tariffs. Calculate and mention the amount of trade that is impacted vs exempted.

  For each of the Industry Areas & Subareas below, I want to know the changes to the tariffs for that area and sub-area for EACH country by the Trump Government.

  # Countries to Cover
  ${countries.join(', ')}

  # Industry Areas
  ${JSON.stringify(headings, null, 2)}

  # Output Instructions
  ${outputInstructions}

  IMPORTANT: Return a JSON object with a single key "countries" containing an array of objects, one for each country in the same order as provided.
  `;

  return prompt;
}

// 3) Use it in your tariff-fetcher for all countries (single LLM call approach)
async function getTariffUpdatesForAllCountries(
  industry: TariffIndustryId,
  date: string,
  headings: IndustryAreasWrapper
): Promise<AllCountriesTariffUpdatesForIndustry> {
  // Get existing tariff data to get top 5 countries
  const existingTariffUpdates = await readTariffUpdatesFromFile(industry);
  const top5Countries = existingTariffUpdates?.countryNames || [];

  // Get 15 additional countries (LLM will exclude the top 5)
  console.log(`Fetching 15 additional trading partners for ${industry} (excluding top 5: ${top5Countries.join(', ')})`);
  const additionalCountries = await getAllCountries(industry, date, top5Countries);

  // Combine top 5 + additional 15 = 20 total countries
  const allCountries = [...top5Countries, ...additionalCountries];
  console.log(`Total countries to process: ${allCountries.length} (${top5Countries.length} existing + ${additionalCountries.length} additional)`);

  // Create a single prompt for all countries
  const prompt = getAllCountriesTariffUpdatesPrompt(industry, date, headings, allCountries);

  console.log(`Invoking single LLM call for tariffs for all countries:`, allCountries);
  const allCountriesTariffData = await getLlmResponse<{ countries: CountrySpecificTariff[] }>(prompt, AllCountriesTariffDataSchema, 'gpt-4o-search-preview');

  // Clean the response data to remove any URL parameters that might affect country names
  const countrySpecificTariffs = allCountriesTariffData.countries.map((countryTariff) => recursivelyCleanOpenAiUrls(countryTariff));

  const result = {
    countryNames: allCountries,
    countrySpecificTariffs,
    lastUpdated: new Date().toISOString(),
  };

  console.log('Generated all-countries tariff updates:', result);
  return result;
}

export async function getAllCountriesTariffUpdatesForIndustryAndSaveToFile(industry: TariffIndustryId, date: string, headings: IndustryAreasWrapper) {
  console.log(`Starting all-countries tariff update generation for ${industry}`);
  const tariffUpdates = await getTariffUpdatesForAllCountries(industry, date, headings);

  if (!tariffUpdates.countrySpecificTariffs || tariffUpdates.countrySpecificTariffs.length === 0) {
    throw new Error('No tariff data generated');
  }

  // Upload JSON to S3
  await writeJsonFileForAllCountriesTariffUpdates(industry, tariffUpdates);

  // Generate and upload markdown
  await writeMarkdownFileForAllCountriesTariffUpdates(industry, tariffUpdates);

  // Update the centralized last modified dates file
  console.log(`Updating centralized last modified dates for ${industry}...`);
  const existingLastModifiedDates = (await readLastModifiedDatesFromFile()) || {};
  existingLastModifiedDates[industry] = tariffUpdates.lastUpdated || new Date().toISOString();
  await writeLastModifiedDatesToFile(existingLastModifiedDates);
  console.log(`Updated centralized last modified dates for ${industry}`);
}
