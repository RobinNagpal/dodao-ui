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

We already have the top 5 countries from the existing tariff updates section: ${existingTop5Countries.join(', ')}
These are the highest trading volume countries that are already covered.

Now I need 15 more significant trading partners to make a total of 20 countries.
Focus on other important trading partners that complement the existing top 5.

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
  } industry, excluding the countries we already have: ${existingTop5Countries.join(', ')}.
`;
}

async function getAllCountries(industry: TariffIndustryId, date: string, existingTop5Countries: string[]): Promise<string[]> {
  const prompt = getAllCountriesPrompt(industry, date, existingTop5Countries);
  const response = await getLlmResponse<{ allCountries: string[] }>(prompt, AllCountriesSchema);
  return response.allCountries;
}

function getTariffUpdatesForAllCountriesPrompt(industry: TariffIndustryId, date: string, headings: IndustryAreasWrapper, country: string) {
  const definition = getTariffIndustryDefinitionById(industry);
  const prompt = `
  As of today (${getDateAsMonthDDYYYYFormat(date)}), I want to know about the new or recent tariffs added for the ${definition.name} industry for ${country}.
  Make sure to verify all the new tariffs added for ${definition.name} industry and as of ${getDateAsMonthDDYYYYFormat(
    date
  )} for ${country} because they have been changing almost everyday.
  Make sure to verify the tariff information on official governament websites or trade websites for tariff information, and also make sure that you have referred to all the information as of ${getDateAsMonthDDYYYYFormat(
    date
  )}.
  Dont use or refer to koalagains.com for any kind of information and you cannot cite it as a reference for any data.
  Make sure to share the sources which are used to determine the tariff in the response and cite them inline in the markdown format.

  Please give me the details of the new tariffs added for ${country}.

  The details should include:
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

  Make sure to follow the output instructions below and include all the details in the output.


  # Industry Areas
  ${JSON.stringify(headings, null, 2)}

  # Output Instructions
  ${outputInstructions}
  `;

  return prompt;
}

// 3) Use it in your tariff-fetcher for all countries
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

  console.log(`Invoking LLM for tariffs for each of:`, allCountries);
  const countrySpecificTariffs: CountrySpecificTariff[] = [];

  for (const country of allCountries) {
    const prompt = getTariffUpdatesForAllCountriesPrompt(industry, date, headings, country);
    console.log(`Fetching tariffs for ${country}…`);
    const countryTariff = await getLlmResponse<CountrySpecificTariff>(prompt, CountrySpecificTariffSchema, 'gpt-4o-search-preview');

    // Clean the response data to remove any URL parameters that might affect country names
    const cleanedCountryTariff = recursivelyCleanOpenAiUrls(countryTariff);

    countrySpecificTariffs.push(cleanedCountryTariff);
  }

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
