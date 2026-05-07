import {
  formatChapterLabel,
  getChapterPromptContext,
  readIndustryHeadings,
  readTariffUpdates,
  writeTariffUpdates,
  type ChapterPromptContext,
} from '@/scripts/industry-tariff-reports/tariff-report-repository';
import { CountrySpecificTariff, IndustryAreasWrapper, TariffUpdatesForIndustry } from '@/scripts/industry-tariff-reports/tariff-types';
import { getDateAsMonthDDYYYYFormat } from '@/util/get-date';
import { z } from 'zod';
import { getLlmResponse, outputInstructions } from '../llm‑utils‑gemini';
import { GeminiModel, LLMProvider } from '@/types/llmConstants';

const CountrySpecificTariffSchema = z.object({
  countryName: z.string().describe('Name of the country.'),
  tariffDetails: z
    .string()
    .describe(
      'Description of the new tariffs added as of the mentioned date for the given HTS chapter. Add 4-5 lines' +
        'Include hyperlinks/citations in the content where ever possible. ' +
        'Every definition, and number, company name etc should have a hyperlink. '
    ),
  existingTradeAmountAndAgreement: z
    .string()
    .describe(
      'Description and the amount of trade that is conducted with the US for the given HTS chapter. Add 4-5 lines' +
        'Include hyperlinks/citations in the content where ever possible. ' +
        'Every definition, and number, company name etc should have a hyperlink. '
    ),
  newChanges: z
    .string()
    .describe(
      'Description of the changes in the tariff policy as compared to the previous policy for the given HTS chapter. Add 4-5 lines' +
        'Include hyperlinks/citations in the content where ever possible. ' +
        'Every definition, and number, company name etc should have a hyperlink. '
    ),
  tradeExemptedByNewTariff: z
    .string()
    .describe(
      'Description of the subcategories and the amount of trade exempted by the new tariff for the given HTS chapter.' +
        'Include hyperlinks/citations in the content where ever possible. '
    ),
  tradeImpactedByNewTariff: z
    .string()
    .describe(
      'Description of the subcategories and the amount of trade impacted by the new tariff for the given HTS chapter.' +
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

const TopCountriesSchema = z.object({
  topCountries: z.array(z.string()).describe('Array of exactly 5 country names whose trading volume with the US is highest for the given HTS chapter.'),
});

function getTopTradingCountriesPrompt(chapterLabel: string, date: string) {
  return `
Identify the top 5 countries by trading volume with the U.S. for ${chapterLabel} as of ${date}.
Output a JSON object with a single key \`topCountries\`, whose value is an array of exactly five ISO-style country names (strings).
Example:
\`\`\`
{
  "topCountries": ["China", "Canada", "Mexico", "Germany", "Japan"]
}
\`\`\`
No extra keys or commentary.

Fetch the countries in descending order of trading volume with the US for the provided HTS chapter.
`;
}

async function getTopTradingCountries(chapterLabel: string, date: string): Promise<string[]> {
  const prompt = getTopTradingCountriesPrompt(chapterLabel, date);
  const response = await getLlmResponse<{ topCountries: string[] }>(
    prompt,
    TopCountriesSchema,
    LLMProvider.GEMINI_WITH_GROUNDING,
    GeminiModel.GEMINI_3_PRO_PREVIEW
  );
  return response.topCountries;
}

function getTariffUpdatesForIndustryPrompt(chapterLabel: string, date: string, headings: IndustryAreasWrapper, country: string) {
  const prompt = `
  As of today (${getDateAsMonthDDYYYYFormat(date)}), I want to know about the new or recent tariffs added for ${chapterLabel} for ${country}.
  Make sure to verify all the new tariffs added for ${chapterLabel} as of ${getDateAsMonthDDYYYYFormat(
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
  - Amount of trade that is conducted with the US for ${chapterLabel}
  - Description of the new tariffs added as of the mentioned date for ${chapterLabel}. Add 6-8 lines of description.
  - Verify if the tariffs have actually been added for ${chapterLabel} and ${country}.
  - Many of the articles share that the tariffs might be applied, don't consider articles which are not 100% sure that the tariffs have been added.
  - Description of the changes in the tariff policy as compared to the previous policy for ${chapterLabel}. Add 6-8 lines for this as well.
  - For Canada and Mexico, make sure to consider only the tariffs that are added in excess of the USMCA agreement.
  - For other countries, make sure to consider only the tariffs that are added in excess of the existing agreement.
  - Include the real date when the tariffs were added.
  - We are interested in the tariffs that US has added
  - You can also include the tariffs that the other country has added, but stress more on the tariffs that US has added.

  Also many or most of the products or subcategories can be exempted from the new tariffs. Calculate and mention the
  amount of trade that is impacted by the new tariff and the amount of trade that is exempted by the new tariff for
  ${chapterLabel}.

  For each of the Chapter Areas & Subareas below, I want to
  1. Know the changes to the tariffs for that area and sub-area and ${country} by the Trump Government.
  2. I want to know the exact change. Mention the numerical figures as much as possible.

  Make sure to follow the output instructions below and include all the details in the output.


  # Chapter Areas
  ${JSON.stringify(headings, null, 2)}

  # Output Instructions
  ${outputInstructions}
  `;

  return prompt;
}

async function getTariffUpdatesForIndustry(
  ctx: ChapterPromptContext,
  date: string,
  headings: IndustryAreasWrapper,
  countryName?: string
): Promise<TariffUpdatesForIndustry> {
  const existingTariffUpdates = await readTariffUpdates(ctx.slug);
  const existingCountryNames = existingTariffUpdates?.countryNames || [];
  const chapterLabel = formatChapterLabel(ctx);

  let countriesToProcess: string[];
  if (countryName) {
    countriesToProcess = [countryName];
  } else {
    console.log(`Fetching top 5 trading partners for ${ctx.slug}…`);
    countriesToProcess = await getTopTradingCountries(chapterLabel, date);
  }

  console.log(`Invoking LLM for tariffs for each of:`, countriesToProcess);
  const countrySpecificTariffs: CountrySpecificTariff[] = [];

  for (const country of countriesToProcess) {
    const prompt = getTariffUpdatesForIndustryPrompt(chapterLabel, date, headings, country);
    console.log(`Fetching tariffs for ${country}…`);
    const countryTariff = await getLlmResponse<CountrySpecificTariff>(prompt, CountrySpecificTariffSchema, LLMProvider.GEMINI_WITH_GROUNDING);
    countrySpecificTariffs.push(countryTariff);
  }

  if (!countryName) {
    return {
      countryNames: countriesToProcess,
      countrySpecificTariffs,
      lastUpdated: new Date().toISOString(),
    };
  }

  if (existingTariffUpdates && existingTariffUpdates.countrySpecificTariffs.length > 0) {
    const newTariffsMap = new Map<string, CountrySpecificTariff>();
    countrySpecificTariffs.forEach((tariff) => {
      newTariffsMap.set(tariff.countryName.toLowerCase(), tariff);
    });

    const orderedTariffs = existingCountryNames.map((country) => {
      if (country.toLowerCase() === countryName.toLowerCase()) {
        let newTariff = newTariffsMap.get(country) || newTariffsMap.get(country.toLowerCase());
        if (!newTariff) {
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

      const existingTariff = existingTariffUpdates.countrySpecificTariffs.find((t) => t.countryName === country);
      if (!existingTariff) {
        console.error(`Failed to find existing tariff data for ${country}`);
        throw new Error(`No data available for country: ${country}`);
      }
      return existingTariff;
    });

    return {
      countryNames: existingCountryNames,
      countrySpecificTariffs: orderedTariffs,
      lastUpdated: new Date().toISOString(),
    };
  }

  return {
    countryNames: countriesToProcess,
    countrySpecificTariffs,
    lastUpdated: new Date().toISOString(),
  };
}

export async function getTariffUpdatesForIndustryAndSaveToFile(slug: string, date: string, countryName?: string): Promise<void> {
  console.log(`Starting tariff update generation for ${slug}${countryName ? ` (${countryName})` : ''}`);
  const ctx = await getChapterPromptContext(slug);
  const headings = await readIndustryHeadings(slug);
  if (!headings) throw new Error(`Headings not found for slug "${slug}"`);

  const tariffUpdates = await getTariffUpdatesForIndustry(ctx, date, headings, countryName);

  if (!tariffUpdates.countrySpecificTariffs || tariffUpdates.countrySpecificTariffs.length === 0) {
    throw new Error('No tariff data generated');
  }

  await writeTariffUpdates(slug, tariffUpdates);
}
