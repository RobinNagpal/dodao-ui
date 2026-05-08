import { prisma } from '@/prisma';
import {
  formatChapterLabel,
  getChapterPromptContext,
  readIndustryHeadings,
  readTariffUpdates,
  writeTariffUpdates,
  type ChapterPromptContext,
} from '@/scripts/industry-tariff-reports/tariff-report-repository';
import { CountrySpecificTariff, IndustryAreasWrapper, TariffUpdatesForIndustry } from '@/scripts/industry-tariff-reports/tariff-types';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getDateAsMonthDDYYYYFormat } from '@/util/get-date';
import { TariffCandidateCodeType } from '@prisma/client';
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

// Top-5 trading partners come straight from the ingested trade analytics
// instead of an LLM lookup. We sum imported customs value (USD) by country
// across every COMMODITY_CODE candidate that links to any HTS line in the
// chapter. SPECIAL_CODE rows (Chapter 99 add-ons — IEEPA reciprocal,
// Section 232/301, etc.) are skipped: their analytics duplicate the
// underlying commodity-line trade rather than representing new flows.
const TOP_COUNTRY_LIMIT = 5;

async function getTopTradingCountriesFromAnalytics(chapterNumber: number): Promise<string[]> {
  const rows = await prisma.tariffTradeAnalytic.groupBy({
    by: ['countryName'],
    where: {
      spaceId: KoalaGainsSpaceId,
      candidateCode: {
        type: TariffCandidateCodeType.COMMODITY_CODE,
        htsCodeLinks: {
          some: {
            htsCode: {
              chapter: { spaceId: KoalaGainsSpaceId, number: chapterNumber },
            },
          },
        },
      },
    },
    _sum: { totalCustomsValue: true },
    orderBy: { _sum: { totalCustomsValue: 'desc' } },
    take: TOP_COUNTRY_LIMIT,
  });
  return rows.map((r) => r.countryName);
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

// Fetch one country's tariff blob from the LLM. Wrapped in its own helper so the
// caller can swallow per-country errors and keep going — we'd rather persist 4/5
// countries than discard everything because the 5th call hit a transient error.
async function fetchCountryTariff(chapterLabel: string, date: string, headings: IndustryAreasWrapper, country: string): Promise<CountrySpecificTariff> {
  const prompt = getTariffUpdatesForIndustryPrompt(chapterLabel, date, headings, country);
  console.log(`Fetching tariffs for ${country}…`);
  return getLlmResponse<CountrySpecificTariff>(prompt, CountrySpecificTariffSchema, LLMProvider.GEMINI_WITH_GROUNDING, GeminiModel.GEMINI_3_PRO_PREVIEW);
}

// Multi-country generation path. Persists after each country so a mid-flight
// failure (LLM error, serverless timeout) leaves the prior countries saved
// rather than discarding the whole batch. A subsequent run can re-target the
// missing countries via the single-country path.
async function generateAllCountryTariffs(
  ctx: ChapterPromptContext,
  date: string,
  headings: IndustryAreasWrapper,
  countriesToProcess: string[]
): Promise<TariffUpdatesForIndustry> {
  const chapterLabel = formatChapterLabel(ctx);
  const collected: CountrySpecificTariff[] = [];
  const failures: string[] = [];

  for (const country of countriesToProcess) {
    try {
      const tariff = await fetchCountryTariff(chapterLabel, date, headings, country);
      collected.push(tariff);
      // Incremental save: persist after every successful country so a later
      // failure doesn't roll back what we already have.
      await writeTariffUpdates(ctx.slug, {
        countryNames: countriesToProcess,
        countrySpecificTariffs: collected,
        lastUpdated: new Date().toISOString(),
      });
    } catch (err) {
      failures.push(country);
      console.error(`Failed to generate tariffs for ${country}; continuing with remaining countries.`, err);
    }
  }

  if (collected.length === 0) {
    throw new Error(`No tariff data generated. All countries failed: ${failures.join(', ')}`);
  }

  return {
    countryNames: countriesToProcess,
    countrySpecificTariffs: collected,
    lastUpdated: new Date().toISOString(),
  };
}

// Single-country regeneration path. Replaces just the targeted country in the
// existing record — used by the admin "regenerate one country" affordance.
async function regenerateSingleCountryTariff(
  ctx: ChapterPromptContext,
  date: string,
  headings: IndustryAreasWrapper,
  countryName: string
): Promise<TariffUpdatesForIndustry> {
  const chapterLabel = formatChapterLabel(ctx);
  const existing = await readTariffUpdates(ctx.slug);
  const newTariff = await fetchCountryTariff(chapterLabel, date, headings, countryName);

  if (existing && existing.countrySpecificTariffs.length > 0) {
    const merged = existing.countrySpecificTariffs.map((t) => (t.countryName.toLowerCase() === countryName.toLowerCase() ? newTariff : t));
    const alreadyPresent = existing.countrySpecificTariffs.some((t) => t.countryName.toLowerCase() === countryName.toLowerCase());
    return {
      countryNames: existing.countryNames,
      countrySpecificTariffs: alreadyPresent ? merged : [...merged, newTariff],
      lastUpdated: new Date().toISOString(),
    };
  }

  return {
    countryNames: [countryName],
    countrySpecificTariffs: [newTariff],
    lastUpdated: new Date().toISOString(),
  };
}

export async function getTariffUpdatesForIndustryAndSaveToFile(slug: string, date: string, countryName?: string): Promise<void> {
  console.log(`Starting tariff update generation for ${slug}${countryName ? ` (${countryName})` : ''}`);
  const ctx = await getChapterPromptContext(slug);
  const headings = await readIndustryHeadings(slug);
  if (!headings) throw new Error(`Headings not found for slug "${slug}"`);

  if (countryName) {
    const tariffUpdates = await regenerateSingleCountryTariff(ctx, date, headings, countryName);
    await writeTariffUpdates(slug, tariffUpdates);
    return;
  }

  console.log(`Fetching top ${TOP_COUNTRY_LIMIT} trading partners for ${slug} from trade analytics…`);
  const countriesToProcess = await getTopTradingCountriesFromAnalytics(ctx.chapterNumber);
  if (countriesToProcess.length === 0) {
    throw new Error(`No trade analytics found for HTS chapter ${ctx.chapterNumber}; cannot determine top trading partners.`);
  }
  console.log(`Invoking LLM for tariffs for each of:`, countriesToProcess);

  // generateAllCountryTariffs persists incrementally; this final write is
  // a no-op semantically but keeps the function symmetric with the single-
  // country path and ensures the final lastUpdated stamp is up to date.
  const tariffUpdates = await generateAllCountryTariffs(ctx, date, headings, countriesToProcess);
  await writeTariffUpdates(slug, tariffUpdates);
}

// Phase 1 of the split tariff-updates flow: resolve the top-5 trading
// countries from trade analytics and persist a stub record so the per-country
// route can append into it. Returns the country list so the caller can fan
// out one HTTP request per country — keeps each request well under Vercel's
// function timeout, which the bundled flow can blow past.
export async function initTariffUpdatesAndSaveToFile(slug: string): Promise<string[]> {
  console.log(`Initialising tariff updates for ${slug} (top countries lookup)`);
  const ctx = await getChapterPromptContext(slug);
  const countries = await getTopTradingCountriesFromAnalytics(ctx.chapterNumber);
  if (countries.length === 0) {
    throw new Error(`No trade analytics found for HTS chapter ${ctx.chapterNumber}; cannot determine top trading partners.`);
  }

  const existing = await readTariffUpdates(slug);
  await writeTariffUpdates(slug, {
    countryNames: countries,
    // Preserve any country tariffs already generated (e.g. a previous partial
    // run) so re-init on the same chapter doesn't wipe in-progress work.
    countrySpecificTariffs: existing?.countrySpecificTariffs ?? [],
    lastUpdated: new Date().toISOString(),
  });

  return countries;
}
