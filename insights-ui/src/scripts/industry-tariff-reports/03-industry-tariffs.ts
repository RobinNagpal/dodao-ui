import { readTariffUpdatesFromFile, writeJsonFileForIndustryTariffs } from '@/scripts/industry-tariff-reports/tariff-report-read-write';
import { CountrySpecificTariff, IndustryAreasWrapper, TariffUpdatesForIndustry } from '@/scripts/industry-tariff-reports/tariff-types';
import { getDateAsMonthDDYYYYFormat } from '@/util/get-date';
import { z } from 'zod';
import { getTariffIndustryDefinitionById, TariffIndustryId } from './tariff-industries';
import { getLlmResponse, outputInstructions } from '../llm‑utils‑gemini';
import { LLMProvider, GeminiModel } from '@/types/llmConstants';

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
function getTopTradingCountriesPrompt(industry: TariffIndustryId, date: string) {
  const definition = getTariffIndustryDefinitionById(industry);
  return `
Identify the top 5 countries by trading volume with the U.S. for the ${definition.name} industry as of ${date}.
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

async function getTopTradingCountries(industry: TariffIndustryId, date: string): Promise<string[]> {
  const prompt = getTopTradingCountriesPrompt(industry, date);
  const response = await getLlmResponse<{ topCountries: string[] }>(prompt, TopCountriesSchema, LLMProvider.GEMINI_WITH_GROUNDING, GeminiModel.GEMINI_2_5_PRO);
  return response.topCountries;
}

function getTariffUpdatesForIndustryPrompt(industry: TariffIndustryId, date: string, headings: IndustryAreasWrapper, country: string) {
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

// 3) Use it in your tariff-fetcher
async function getTariffUpdatesForIndustry(
  industry: TariffIndustryId,
  date: string,
  headings: IndustryAreasWrapper,
  countryName?: string
): Promise<TariffUpdatesForIndustry> {
  // Get existing tariff data to maintain order
  const existingTariffUpdates = await readTariffUpdatesFromFile(industry);
  const existingCountryNames = existingTariffUpdates?.countryNames || [];

  // Get the list of countries to process
  let countriesToProcess: string[];
  if (countryName) {
    // If regenerating a specific country, use the existing countryNames to maintain order
    countriesToProcess = [countryName];
  } else {
    // For full regeneration, get the top trading countries
    console.log(`Fetching top 5 trading partners for ${industry}…`);
    const topCountries = await getTopTradingCountries(industry, date);
    countriesToProcess = topCountries;
  }

  console.log(`Invoking LLM for tariffs for each of:`, countriesToProcess);
  const countrySpecificTariffs: CountrySpecificTariff[] = [];

  for (const country of countriesToProcess) {
    const prompt = getTariffUpdatesForIndustryPrompt(industry, date, headings, country);
    console.log(`Fetching tariffs for ${country}…`);
    const countryTariff = await getLlmResponse<CountrySpecificTariff>(
      prompt,
      CountrySpecificTariffSchema,
      LLMProvider.GEMINI_WITH_GROUNDING,
      GeminiModel.GEMINI_2_5_PRO
    );

    countrySpecificTariffs.push(countryTariff);
  }

  // If regenerating all countries, use the new data entirely
  if (!countryName) {
    const result = {
      countryNames: countriesToProcess,
      countrySpecificTariffs,
      lastUpdated: new Date().toISOString(),
    };
    return result;
  }

  // If we have existing data and regenerating a specific country, maintain the order
  if (existingTariffUpdates && existingTariffUpdates.countrySpecificTariffs.length > 0) {
    // Create a map of new tariffs for quick lookup with case-insensitive keys
    const newTariffsMap = new Map<string, CountrySpecificTariff>();
    countrySpecificTariffs.forEach((tariff) => {
      newTariffsMap.set(tariff.countryName.toLowerCase(), tariff);
    });

    // Create a new array maintaining the existing order
    const orderedTariffs = existingCountryNames.map((country) => {
      // If this is the country being regenerated, use the new data
      if (countryName && country.toLowerCase() === countryName.toLowerCase()) {
        // Try exact match first, then case-insensitive match
        let newTariff = newTariffsMap.get(country) || newTariffsMap.get(country.toLowerCase());

        if (!newTariff) {
          // Try to find by any of the generated country names (case-insensitive)
          for (const generatedTariff of countrySpecificTariffs) {
            if (generatedTariff.countryName.toLowerCase() === country.toLowerCase()) {
              newTariff = generatedTariff;
              break;
            }
          }
        }

        if (!newTariff) {
          console.error(`Failed to get new tariff data for ${country}`);
          return existingTariffUpdates.countrySpecificTariffs.find((t) => t.countryName === country)!;
        }

        return newTariff;
      }

      // Otherwise, use existing data
      const existingTariff = existingTariffUpdates.countrySpecificTariffs.find((t) => t.countryName === country);
      if (!existingTariff) {
        console.error(`Failed to find existing tariff data for ${country}`);
        throw new Error(`No data available for country: ${country}`);
      }

      return existingTariff;
    });

    const result = {
      countryNames: existingCountryNames,
      countrySpecificTariffs: orderedTariffs,
      lastUpdated: new Date().toISOString(),
    };
    console.log('Generated tariff updates with order:', result.countryNames);
    return result;
  }

  // If no existing data, use the new data in the order it was generated
  const result = {
    countryNames: countriesToProcess,
    countrySpecificTariffs,
    lastUpdated: new Date().toISOString(),
  };
  console.log('Generated new tariff updates:', result);
  return result;
}

export async function getTariffUpdatesForIndustryAndSaveToFile(industry: TariffIndustryId, date: string, headings: IndustryAreasWrapper, countryName?: string) {
  console.log(`Starting tariff update generation for ${industry} ${countryName ? ` (${countryName})` : ''}`);
  const tariffUpdates = await getTariffUpdatesForIndustry(industry, date, headings, countryName);

  if (!tariffUpdates.countrySpecificTariffs || tariffUpdates.countrySpecificTariffs.length === 0) {
    throw new Error('No tariff data generated');
  }

  // Upload JSON to S3 (last modified dates and cache revalidation handled automatically)
  await writeJsonFileForIndustryTariffs(industry, tariffUpdates);
}
