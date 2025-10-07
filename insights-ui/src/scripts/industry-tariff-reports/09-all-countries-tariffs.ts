import {
  readTariffUpdatesFromFile,
  writeJsonFileForAllCountriesTariffUpdates,
  writeMarkdownFileForAllCountriesTariffUpdates,
  writeLastModifiedDatesToFile,
  readLastModifiedDatesFromFile,
} from '@/scripts/industry-tariff-reports/tariff-report-read-write';
import { IndustryAreasWrapper, AllCountriesTariffUpdatesForIndustry, AllCountriesTariffInfo } from '@/scripts/industry-tariff-reports/tariff-types';
import { getDateAsMonthDDYYYYFormat } from '@/util/get-date';
import { z } from 'zod';
import { getTariffIndustryDefinitionById, TariffIndustryId } from './tariff-industries';
import { getLlmResponse, outputInstructions } from '../llm‑utils‑gemini';

const CountrySpecificTariffSchema = z.object({
  countryName: z.string().describe('Name of the country.'),
  tariffInfo: z.string().describe('Tariff information for the given country. Include all the details in the markdown format.'),
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
Example Format:
\`\`\`
{
  "allCountries": ["China", "Mexico", "Canada", "India"]
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
  const response = await getLlmResponse<{ allCountries: string[] }>(prompt, AllCountriesSchema, 'gemini-2.5-pro-with-google-search');
  return response.allCountries;
}

function getAllCountriesTariffUpdatesPrompt(industry: TariffIndustryId, date: string, headings: IndustryAreasWrapper, countries: string[]) {
  const definition = getTariffIndustryDefinitionById(industry);
  const currentDate = getDateAsMonthDDYYYYFormat(date);
  const prompt = `
  As of today (${currentDate}), I want to know about the CURRENT and RECENT tariffs for the ${definition.name} industry for multiple countries.

  CRITICAL: Provide tariff data for ALL of these countries in a single response: ${countries.join(', ')}

  IMPORTANT: Focus on CURRENT tariffs as of ${currentDate}. DO NOT provide historical data from 2018-2019 unless it is still in effect today. We want current, up-to-date information that reflects the current trade situation.


  Make sure to verify the tariff information on official government websites or trade websites for tariff information, and also make sure that you have referred to all the information as of ${currentDate}.

  Don't use or refer to koalagains.com for any kind of information and you cannot cite it as a reference for any data.
  
  Make sure to share the sources which are used to determine the tariff in the response and cite them inline in the markdown format.

# Countries to Cover
${countries.join(', ')}

# Industry Areas
${JSON.stringify(headings, null, 2)}

# Details to return for each country
  For EACH country, provide the following details:
  - Name of the country
  - Total trade volume between this country and the US for the given industry in USD (e.g., $X.X billion annually)
  - Tariff rates that were in effect before any recent changes (focus on current baseline)
  - Current/new tariff rates that are in effect as of ${currentDate}, with the date when they were declared and when they became effective
  - Description of the current tariff situation (3-4 concise sentences focusing on current status)
  - Primary sources used (2-3 key sources with URLs that are current and relevant)
  - Don't include any disclaimers
  - All the markdown headings you use use h4 or h5 i.e. ### or ####

# Example of Expected Format for One Country:
### Overview of U.S. Tariffs
Current U.S. tariff landscape for [Country] in the [Industry] sector as of ${currentDate}.

*   **U.S. Trade Volume**: Total U.S. imports of [relevant HS codes] from [Country] were approximately $X.X billion in [recent year].
*   **Impacted vs. Exempted Trade**: [Calculate and mention current impact vs exemptions if applicable].

#### Tariff Rate Changes

##### Pre-Recent Changes Rates
[Current baseline rates, not historical Trump-era rates unless still in effect].

#### Current Tariff Implementation
*   **Action**: [Current tariff measures in effect].
*   **Declared Date**: [Recent date].
*   **Effective Date**: [Current effective date].
*   **Rates**: [Current rates].

#### Description of Current Tariffs
[3-4 sentences describing the current tariff situation, focusing on recent developments and current status].

#### Primary Sources
*   [Specific government document/page with exact URL that contains the tariff rates and dates mentioned if exists]
*   [Specific trade publication article with exact URL that contains the trade volume figures cited if exists]
*   [Specific official announcement/document with exact URL that contains the implementation details if exists]

#  Guidelines for each country:
  - Verify if the tariffs have actually been added for the given industry and country.
  - Many articles share that tariffs might be applied, don't consider those articles which are not 100% sure that the tariffs have been added.
  - For Canada and Mexico, make sure to consider only the tariffs that are added in excess of the USMCA agreement or other existing agreements.
  - For other countries, make sure to consider only the tariffs that are added in excess of the existing agreement.
  - Include the real date when the tariffs were added.
  - Include the date when the tariffs were implemented.
  - We are interested in the tariffs that US has added
  - You can also include the tariff that the other country has added, but stress more on the tariffs that US has added.
  - Many products or subcategories can be exempted from the new tariffs. Calculate and mention the amount of trade that is impacted vs exempted.
    - CRITICAL FOR SOURCES: Provide SPECIFIC URLs to the exact pages, documents, press releases, or reports that contain the information you're citing.
    * Each source URL should directly lead to the specific information being referenced (tariff rates, trade volumes, implementation dates, etc.)
  - Verify that each source URL actually contains the specific data points you're citing (tariff percentages, dollar amounts, dates)
 
  # Output Instructions
  ${outputInstructions}

  IMPORTANT: Return a JSON object with a single key "countries" containing the array of objects of type {countryName: string, tariffInfo: string} with tariffInfo formatted in the markdown format. 
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

  console.log(`Total countries to process: ${additionalCountries.length}`);

  // Create a single prompt for all countries
  const prompt = getAllCountriesTariffUpdatesPrompt(industry, date, headings, additionalCountries);

  console.log(`Invoking single LLM call for tariffs for all countries:`, additionalCountries);
  const allCountriesTariffData = await getLlmResponse<{ countries: AllCountriesTariffInfo[] }>(
    prompt,
    AllCountriesTariffDataSchema,
    'gemini-2.5-pro-with-google-search'
  );

  // Clean the response data to remove any URL parameters that might affect country names
  // const countrySpecificTariffs = allCountriesTariffData.countries.map((countryTariff) => recursivelyCleanOpenAiUrls(countryTariff));

  const result = {
    countryNames: additionalCountries,
    countrySpecificTariffs: allCountriesTariffData.countries,
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
