import { TariffIndustryDefinition } from '@/scripts/industry-tariff-reports/tariff-industries';
import {
  getS3KeyForSubIndustryArea,
  readEvaluateSubIndustryAreaJsonFromFile,
  writeJsonFileForEvaluateSubIndustryArea,
} from '@/scripts/industry-tariff-reports/tariff-report-read-write';
import { uploadJsonTariffFileToS3 } from '@/scripts/report-file-utils';
import { z } from 'zod';
import {
  EstablishedPlayer,
  EstablishedPlayerRef,
  EvaluateIndustryArea,
  EvaluateIndustryContent,
  HeadwindsAndTailwinds,
  IndustryAreasWrapper,
  IndustrySubArea,
  NegativeTariffImpactOnCompanyType,
  NewChallenger,
  NewChallengerRef,
  PositiveTariffImpactOnCompanyType,
  TariffUpdatesForIndustry,
} from './tariff-types';
import { getLlmResponse, outputInstructions } from '../llm‑utils‑gemini';
import { LLMProvider, getDefaultGeminiModel } from '@/types/llmConstants';

// ---------------------------------------------------------------------------
// ─── 1. TYPE & SCHEMA EXTENSIONS ────────────────────────────────────────────
// ---------------------------------------------------------------------------

const EstablishedPlayerSchema = z.object({
  companyName: z.string().describe('Name of the company'),
  companyDescription: z.string().describe('One-paragraph overview of the company'),
  companyWebsite: z.string().describe('Company website URL'),
  companyTicker: z.string().describe('Stock ticker symbol'),
  products: z
    .array(
      z.object({
        productName: z.string().describe('Product name'),
        productDescription: z.string().describe('Brief two-line description of the product'),
        percentageOfRevenue: z.string().describe('Percentage of total revenue contributed'),
        competitors: z.string().array().describe('List of competitors and their relative market scale'),
      })
    )
    .describe('Product portfolio and revenue breakdown'),
  aboutManagement: z.string().describe('Summary of the management team'),
  uniqueAdvantage: z.string().describe('Key competitive advantage'),
  pastPerformance: z
    .object({
      revenueGrowth: z.string().describe('Revenue growth: include both percentage and absolute values'),
      costOfRevenue: z.string().describe('Cost of revenue: include percentage and absolute values, and commentary on efficiency'),
      profitabilityGrowth: z.string().describe('Profitability growth: include both percentage and absolute values'),
      rocGrowth: z.string().describe('Return on capital growth: include both percentage and absolute values'),
    })
    .describe('Financial performance over the past five years'),
  futureGrowth: z
    .object({
      revenueGrowth: z.string().describe('Revenue growth: include both percentage and absolute values'),
      costOfRevenue: z.string().describe('Cost of revenue: include percentage and absolute values, and commentary on efficiency'),
      profitabilityGrowth: z.string().describe('Profitability growth: include both percentage and absolute values'),
      rocGrowth: z.string().describe('Return on capital growth: include both percentage and absolute values'),
    })
    .describe('Projected financial performance over the next five years'),
  impactOfTariffs: z.string().describe('Impact of new tariffs on the company, with facts and reasoning (5-6 lines)'),
  competitors: z.string().describe('Major competitors and their market position'),
});

const NewChallengerSchema = z.object({
  companyName: z.string().describe('Name of the company'),
  companyDescription: z.string().describe('One-paragraph overview of the company'),
  companyWebsite: z.string().describe('Company website URL'),
  companyTicker: z.string().describe('Stock ticker symbol'),
  products: z
    .array(
      z.object({
        productName: z.string().describe('Product name'),
        productDescription: z.string().describe('Brief two-line description of the product'),
        percentageOfRevenue: z.string().describe('Percentage of total revenue contributed'),
        competitors: z.string().array().describe('List of competitors and their relative market scale'),
      })
    )
    .describe('Product portfolio and revenue breakdown'),
  aboutManagement: z.string().describe('Summary of the management team'),
  uniqueAdvantage: z.string().describe('Key competitive advantage over established players'),
  pastPerformance: z
    .object({
      revenueGrowth: z.string().describe('Revenue growth: include both percentage and absolute values'),
      costOfRevenue: z.string().describe('Cost of revenue: include percentage and absolute values, and commentary on efficiency'),
      profitabilityGrowth: z.string().describe('Profitability growth: include both percentage and absolute values'),
      rocGrowth: z.string().describe('Return on capital growth: include both percentage and absolute values'),
    })
    .describe('Financial performance over the past five years'),
  futureGrowth: z
    .object({
      revenueGrowth: z.string().describe('Revenue growth: include both percentage and absolute values'),
      costOfRevenue: z.string().describe('Cost of revenue: include percentage and absolute values, and commentary on efficiency'),
      profitabilityGrowth: z.string().describe('Profitability growth: include both percentage and absolute values'),
      rocGrowth: z.string().describe('Return on capital growth: include both percentage and absolute values'),
    })
    .describe('Projected financial performance over the next five years'),
  impactOfTariffs: z.string().describe('Impact of new tariffs on the company, with facts and reasoning (5-6 lines)'),
  competitors: z.string().describe('Major competitors and their market position'),
});

const NewChallengersArraySchema = z.object({
  newChallengers: z.array(NewChallengerSchema).describe('Array of new challengers'),
});

const EstablishedPlayersArraySchema = z.object({
  establishedPlayers: z.array(EstablishedPlayerSchema).describe('Array of established players'),
});

const HeadwindsAndTailwindsSchema = z.object({
  headwinds: z.string().array().describe('4–5 key headwinds, each explained in 3–4 lines with reasoning'),
  tailwinds: z.string().array().describe('4–5 key tailwinds, each explained in 3–4 lines with reasoning'),
});

const PositiveTariffImpactOnCompanyTypeSchema = z.object({
  companyType: z.string().describe('Category of companies positively affected by tariffs'),
  impact: z.string().describe('Expected increase in revenue and growth rate due to tariffs'),
  reasoning: z.string().describe('Rationale for the projected impact'),
});

const NegativeTariffImpactOnCompanyTypeSchema = z.object({
  companyType: z.string().describe('Category of companies negatively affected by tariffs'),
  impact: z.string().describe('Expected decrease in revenue and growth rate due to tariffs'),
  reasoning: z.string().describe('Rationale for the projected impact'),
});

/**
 * Creates a standard prompt format for industry sector analysis
 */
function createIndustrySectorPrompt({
  subArea,
  areas,
  tariffUpdates,
  date,
  instructions,
  context = {},
}: {
  subArea: IndustrySubArea;
  areas: IndustryAreasWrapper;
  tariffUpdates: TariffUpdatesForIndustry;
  date: string;
  instructions: string;
  context?: Record<string, any>;
}): string {
  const area = areas.areas.find((a) => a.subAreas.some((s) => s.title === subArea.title));
  if (!area) {
    throw new Error(`Area not found for subArea: ${subArea.title}`);
  }
  const commonPrompt = `
${instructions}

Focus on Specific Sector and Subsector:

# Sector - ${area.title}
Description: ${area.oneLineSummary}

# Subsector - ${subArea.title}
Description: ${subArea.oneLineSummary}

# Output Instructions:
${outputInstructions}

# Tariff Updates: 
${JSON.stringify(tariffUpdates)}

# Date: 
${date}

The analysis should be only for the ${subArea.title} sector. 
Do not include any data from other headings or subheadings as they will be covered separately.
Make sure to focus just on the ${subArea.title} sector and not on other headings or subheadings.
Make sure to verify the tariff information on official governament websites or trade websites for tariff information.
Dont use or refer to koalagains.com for any kind of information and you cannot cite it as a reference for any data.
Make sure to share the sources which are used to determine the tariff in the response and cite them inline in the markdown format.
  

# All the industry areas. You need to only cover the ${subArea.title} area.
${JSON.stringify(areas, null, 2)}
`;

  // Add any additional context if provided
  const contextStr = Object.entries(context)
    .map(([key, value]) => `# ${key}:\n${typeof value === 'string' ? value : JSON.stringify(value, null, 2)}`)
    .join('\n\n');

  return contextStr ? `${commonPrompt}\n\n${contextStr}` : commonPrompt;
}

// A minimal schema for step 1: name + ticker only
const EstablishedPlayerListSchema = z.object({
  establishedPlayers: z.array(
    z.object({
      companyName: z.string().describe('Name of the company'),
      companyTicker: z.string().describe('Stock ticker symbol'),
    })
  ),
});

/**
 * Get detailed information for a single established player
 */
async function getEstablishedPlayerDetails(
  tariffIndustry: TariffIndustryDefinition,
  areas: IndustryAreasWrapper,
  tariffUpdates: TariffUpdatesForIndustry,
  subArea: IndustrySubArea,
  date: string,
  companyName: string,
  companyTicker: string
): Promise<EstablishedPlayer> {
  const subAreaInfo = getSubAreaInfoString(subArea, areas, tariffIndustry);
  const detailInstructions = `
Gather full details for **${companyName}** (ticker: ${companyTicker}) in the ${subAreaInfo} sector:
- companyName, companyDescription, companyWebsite, companyTicker
- products (portfolio & revenue breakdown)
- aboutManagement, uniqueAdvantage
- pastPerformance (5 yrs), futureGrowth (5 yrs)
- impactOfTariffs (5–6 lines of facts & reasoning)
- competitors
- Output JSON matching EstablishedPlayerSchema exactly.
- Explain tariff impact with facts and reasoning and explain in at least 5-6 lines. Be very specific to the company and dont share general information. Explain in simple way if it will be good or bad for the company.`;

  const detailPrompt = createIndustrySectorPrompt({
    subArea: subArea,
    areas,
    tariffUpdates,
    date,
    instructions: detailInstructions,
  });

  return await getLlmResponse<EstablishedPlayer>(detailPrompt, EstablishedPlayerSchema, LLMProvider.GEMINI, getDefaultGeminiModel());
}

function getSubAreaInfoString(subArea: IndustrySubArea, areas: IndustryAreasWrapper, tariffIndustry: TariffIndustryDefinition) {
  const area = areas.areas.find((a) => a.subAreas.some((s) => s.title === subArea.title));
  if (!area) {
    throw new Error(`Area not found for subArea: ${subArea.title}`);
  }

  const subAreaInfo = `${tariffIndustry.industryId} - ${area.title} - ${subArea.title}`;
  return subAreaInfo;
}

/**
 * Get established players using a two-step approach for better results
 */
async function getEstablishedPlayers(
  tariffIndustry: TariffIndustryDefinition,
  areas: IndustryAreasWrapper,
  tariffUpdates: TariffUpdatesForIndustry,
  subArea: IndustrySubArea,
  date: string
): Promise<{ establishedPlayersRefs: EstablishedPlayerRef[]; establishedPlayerDetails: EstablishedPlayer[] }> {
  // --- STEP 1: Fetch just names + tickers using the dedicated function ---
  const basicList = await getEstablishedPlayersListOnly(tariffIndustry, areas, tariffUpdates, subArea, date);

  // --- STEP 2: For each, fetch full details ---
  const detailedList: EstablishedPlayer[] = [];
  for (const { companyName, companyTicker } of basicList) {
    console.log(`[EstablishedPlayers] ${`→ Fetching details for ${companyName} (${companyTicker})`}`);
    const establishedPlayer = await getEstablishedPlayerDetails(tariffIndustry, areas, tariffUpdates, subArea, date, companyName, companyTicker);
    console.log(`[EstablishedPlayers] ${`← Received details for ${companyName}`}`);
    detailedList.push(establishedPlayer);
  }

  return { establishedPlayersRefs: basicList, establishedPlayerDetails: detailedList };
}

/**
 * Get just the established players list without detailed information
 */
async function getEstablishedPlayersListOnly(
  tariffIndustry: TariffIndustryDefinition,
  areas: IndustryAreasWrapper,
  tariffUpdates: TariffUpdatesForIndustry,
  subArea: IndustrySubArea,
  date: string
): Promise<EstablishedPlayerRef[]> {
  console.log(`[EstablishedPlayers] ${'→ Fetching list of names and tickers only'}`);
  const subAreaInfo = getSubAreaInfoString(subArea, areas, tariffIndustry);
  const listInstructions = `
Find the three *Established Players* in the ${subAreaInfo} sector  **but output only** each company's **name** and **ticker** in JSON:
- Select three biggest and most performant public US companies with 5+ years in the sector.
- Focus on US based companies.
- Bigger Focus is on ${tariffIndustry.name} industry.
- Make sure the companies are active and are being publicly traded as of ${date} on Nasdaq or NYSE.
- The company should be traded on US exchanges i.e. Nasdaq or NYSE.
- Dont return duplicate companies.
- Ignore companies like ${tariffIndustry.companiesToIgnore.join(', ')} as they are no longer active.
- Make sure the company is not bankrupt or not active.
- Try to find three established players that fall under this category of ${subArea.oneLineSummary} sector.

Do not include any data from other areas or sub-areas as they will be covered separately.
Make sure to verify the tariff information on official governament websites or trade websites for tariff information.
Dont use or refer to koalagains.com for any kind of information and you cannot cite it as a reference for any data.
Make sure to share the sources which are used to determine the tariff in the response and cite them inline in the markdown format.
 
Make sure to focus just on the ${subArea.title} sector and not on other areas or sub-areas

# Other areas and sub-areas
${JSON.stringify(areas, null, 2)}
`;

  const prompt = createIndustrySectorPrompt({
    subArea: subArea,
    areas,
    tariffUpdates,
    date,
    instructions: listInstructions,
  });

  const { establishedPlayers: basicList } = await getLlmResponse<{ establishedPlayers: { companyName: string; companyTicker: string }[] }>(
    prompt,
    EstablishedPlayerListSchema,
    LLMProvider.GEMINI,
    getDefaultGeminiModel()
  );
  console.log(`[EstablishedPlayers] ${`← Received basic list only: ${JSON.stringify(basicList)}`}`);

  return basicList;
}

// A minimal schema for step 1: name + ticker only
const NewChallengerListSchema = z.object({
  newChallengers: z.array(
    z.object({
      companyName: z.string().describe('Name of the company'),
      companyTicker: z.string().describe('Stock ticker symbol'),
    })
  ),
});

/**
 * Get detailed information for a single new challenger
 */
async function getNewChallengerDetails(
  tariffIndustry: TariffIndustryDefinition,
  areas: IndustryAreasWrapper,
  tariffUpdates: TariffUpdatesForIndustry,
  industry: IndustrySubArea,
  establishedPlayers: EstablishedPlayer[],
  date: string,
  companyName: string,
  companyTicker: string
): Promise<NewChallenger> {
  const subAreaInfo = getSubAreaInfoString(industry, areas, tariffIndustry);
  const detailInstructions = `
Gather full details for **${companyName}** (ticker: ${companyTicker}) in the ${subAreaInfo} sector:
- companyName, companyDescription, companyWebsite, companyTicker
- products (portfolio & revenue breakdown)
- aboutManagement, uniqueAdvantage
- pastPerformance (5 yrs), futureGrowth (5 yrs)
- impactOfTariffs (5–6 lines of facts & reasoning)
- competitors
- Output JSON matching NewChallengerSchema exactly.
- Explain tariff impact with facts and reasoning and explain in at least 5-6 lines. Be very specific to the company and dont share general information. Explain in simple way if it will be good or bad for the company.
`;
  const detailPrompt = createIndustrySectorPrompt({
    subArea: industry,
    areas,
    tariffUpdates,
    date,
    instructions: detailInstructions,
    context: {
      'Established Players': establishedPlayers.map((ep) => ep.companyName),
    },
  });

  return await getLlmResponse<NewChallenger>(detailPrompt, NewChallengerSchema, LLMProvider.GEMINI, getDefaultGeminiModel());
}

/**
 * Get new challengers using a two-step approach for better results
 */
async function getNewChallengers(
  tariffIndustry: TariffIndustryDefinition,
  areas: IndustryAreasWrapper,
  tariffUpdates: TariffUpdatesForIndustry,
  subArea: IndustrySubArea,
  establishedPlayers: EstablishedPlayer[],
  date: string
): Promise<{ newChallengersRefs: NewChallengerRef[]; newChallengersDetails: NewChallenger[] }> {
  // --- STEP 1: Fetch just names + tickers using the dedicated function ---
  const basicList = await getNewChallengersListOnly(tariffIndustry, areas, tariffUpdates, subArea, establishedPlayers, date);

  // --- STEP 2: For each, fetch full details ---
  const detailedList: NewChallenger[] = [];
  for (const { companyName, companyTicker } of basicList) {
    console.log(`[NewChallengers] ${`→ Fetching details for ${companyName} (${companyTicker})`}`);
    const newChallenger = await getNewChallengerDetails(tariffIndustry, areas, tariffUpdates, subArea, establishedPlayers, date, companyName, companyTicker);
    console.log(`[NewChallengers] ${`← Received details for ${companyName}`}`);
    detailedList.push(newChallenger);
  }

  return { newChallengersRefs: basicList, newChallengersDetails: detailedList };
}

/**
 * Get just the new challengers list without detailed information
 */
async function getNewChallengersListOnly(
  tariffIndustry: TariffIndustryDefinition,
  areas: IndustryAreasWrapper,
  tariffUpdates: TariffUpdatesForIndustry,
  subArea: IndustrySubArea,
  establishedPlayers: EstablishedPlayer[],
  date: string
): Promise<NewChallengerRef[]> {
  console.log(`[NewChallengers] ${'→ Fetching list of names and tickers only'}`);
  const subAreaInfo = getSubAreaInfoString(subArea, areas, tariffIndustry);
  const listInstructions = `
Find the *New Challengers* in the ${subAreaInfo} sector **but output only** each company's **name** and **ticker** in JSON:
- Select upto three public US companies IPO's in the last 7 years.
- Ignore any Chinese companies.
- Make sure the companies are active and are being publicly traded as of ${date} on Nasdaq or NYSE.
- The company should be traded on US exchanges i.e. Nasdaq or NYSE.
- Dont return duplicate companies.
- The companies should have unique edge over established players which creates probability of huge success in the future.
- Make sure to select the best of the best new players and they not be old established players.
- Ignore challengers like ${tariffIndustry.companiesToIgnore.join(', ')} as they no longer active.
- Make sure the new challenger is not in the established players list i.e. ${establishedPlayers
    .map((ep) => `${ep.companyName} (${ep.companyTicker})`)
    .join(', ')}
- Make sure the company is not bankrupt or not active.

Do not include any data from other areas or sub-areas as they will be covered separately.

Make sure to focus just on the ${subArea.title} sector and not on other areas or sub-areas

# Other areas and sub-areas
${JSON.stringify(areas, null, 2)}
`;

  const prompt = createIndustrySectorPrompt({
    subArea: subArea,
    areas,
    tariffUpdates,
    date,
    instructions: listInstructions,
  });

  const { newChallengers: basicList } = await getLlmResponse<{ newChallengers: { companyName: string; companyTicker: string }[] }>(
    prompt,
    NewChallengerListSchema,
    LLMProvider.GEMINI,
    getDefaultGeminiModel()
  );
  console.log(`[NewChallengers] ${`← Received basic list only: ${JSON.stringify(basicList)}`}`);

  return basicList;
}

/**
 * Get headwinds and tailwinds analysis
 */
async function getHeadwindsAndTailwinds(
  tariffIndustry: TariffIndustryDefinition,
  areas: IndustryAreasWrapper,
  tariffUpdates: TariffUpdatesForIndustry,
  subArea: IndustrySubArea,
  date: string
): Promise<HeadwindsAndTailwinds> {
  const subAreaInfo = getSubAreaInfoString(subArea, areas, tariffIndustry);
  const instructions = `List 4–5 key *headwinds* and 4–5 key *tailwinds* for the ${subAreaInfo} sector:
- Each explained in 3–4 lines with reasoning. When explaining, take specific examples of the companies and the products. 
- Focus on the specific Sector And Subsector.
- Make sure to take examples.
- Output JSON matching HeadwindsAndTailwindsSchema.
`;

  const prompt = createIndustrySectorPrompt({
    subArea,
    areas,
    tariffUpdates,
    date,
    instructions,
  });

  return await getLlmResponse<HeadwindsAndTailwinds>(prompt, HeadwindsAndTailwindsSchema, LLMProvider.GEMINI, getDefaultGeminiModel());
}

/**
 * Get tariff impact by company type analysis
 */
async function getTariffImpactByCompanyType(areas: IndustryAreasWrapper, tariffUpdates: TariffUpdatesForIndustry, industry: IndustrySubArea, date: string) {
  const instructions = `Analyze the new tariffs for the ${industry.title} sector and provide:
- Three categories of companies *positively* affected (companyType, impact, reasoning).
- Three categories of companies *negatively* affected (companyType, impact, reasoning).
- Output a JSON object with two arrays: positiveTariffImpactOnCompanyType and negativeTariffImpactOnCompanyType matching their schemas.`;

  const prompt = createIndustrySectorPrompt({
    subArea: industry,
    areas,
    tariffUpdates,
    date,
    instructions,
  });

  const schema = z.object({
    positiveTariffImpactOnCompanyType: z.array(PositiveTariffImpactOnCompanyTypeSchema),
    negativeTariffImpactOnCompanyType: z.array(NegativeTariffImpactOnCompanyTypeSchema),
  });

  interface TariffImpactByCompanyType {
    positiveTariffImpactOnCompanyType: PositiveTariffImpactOnCompanyType[];
    negativeTariffImpactOnCompanyType: NegativeTariffImpactOnCompanyType[];
  }

  return await getLlmResponse<TariffImpactByCompanyType>(prompt, schema, LLMProvider.GEMINI, getDefaultGeminiModel());
}

/**
 * Generate an overall tariff impact summary
 */
async function getTariffImpactSummary(
  tariffUpdates: TariffUpdatesForIndustry,
  industryAreasWrapper: IndustryAreasWrapper,
  subArea: IndustrySubArea,
  establishedPlayers: EstablishedPlayer[],
  newChallengers: NewChallenger[],
  headwindsAndTailwinds: HeadwindsAndTailwinds,
  positiveTariffImpactOnCompanyType: PositiveTariffImpactOnCompanyType[],
  negativeTariffImpactOnCompanyType: NegativeTariffImpactOnCompanyType[]
) {
  const instructions = `Write a 3-5 paragraph and Summarize the impact on established players, new challengers, headwinds and tailwinds, and tariff impact by company type in the ${subArea.title} sector:
- Write the summary as if it will be used by investors. 
- Add one paragraph for positive impact and include the companies that will be most positively affected to be included first in that paragraph.
- Add one paragraph for negative impact and include the companies that will be most negatively affected to be included first in that paragraph.
- Add one paragraph about Final Notes for the effect of on ${subArea.title} sector.
- Summary should be 3 paragraphs long, with each paragraph of 6-8 lines long.
- Include specific examples of companies, facts, and reasoning.
- Focus on impact on US based companies.`;

  const context = {
    'Established Players': establishedPlayers,
    'New Challengers': newChallengers,
    'Headwinds and Tailwinds': headwindsAndTailwinds,
    'Positive Tariff Impact on Company Type': positiveTariffImpactOnCompanyType,
    'Negative Tariff Impact on Company Type': negativeTariffImpactOnCompanyType,
  };

  const prompt = createIndustrySectorPrompt({
    subArea: subArea,
    areas: industryAreasWrapper, // Not needed for summary
    tariffUpdates,
    date: '', // Not needed for summary
    instructions,
    context,
  });

  const schema = z.object({
    summary: z.string().describe('Summary of tariff impacts'),
  });

  interface TariffImpactSummary {
    summary: string;
  }

  return (await getLlmResponse<TariffImpactSummary>(prompt, schema, LLMProvider.GEMINI, getDefaultGeminiModel())).summary;
}

export async function getAndWriteEvaluateIndustryAreaJson(
  tariffIndustry: TariffIndustryDefinition,
  industryArea: IndustrySubArea,
  industryAreasWrapper: IndustryAreasWrapper,
  tariffUpdates: TariffUpdatesForIndustry,
  date: string
) {
  const industry = tariffIndustry.industryId;
  // 1
  console.log('Invoking LLM for established players');
  const { establishedPlayersRefs, establishedPlayerDetails } = await getEstablishedPlayers(
    tariffIndustry,
    industryAreasWrapper,
    tariffUpdates,
    industryArea,
    date
  );
  console.log('Found established players:', establishedPlayersRefs);
  console.log('Found established player details:', establishedPlayerDetails);

  // 2
  console.log('Invoking LLM for new challengers');
  const { newChallengersRefs, newChallengersDetails } = await getNewChallengers(
    tariffIndustry,
    industryAreasWrapper,
    tariffUpdates,
    industryArea,
    establishedPlayerDetails,
    date
  );
  console.log('Found new challengers:', newChallengersRefs);
  console.log('Found new challenger details:', newChallengersRefs);

  // 3
  console.log('Invoking LLM for headwinds and tailwinds');
  const headwindsAndTailwinds = await getHeadwindsAndTailwinds(tariffIndustry, industryAreasWrapper, tariffUpdates, industryArea, date);
  console.log('Found headwinds and tailwinds:', headwindsAndTailwinds);

  // 4
  console.log('Invoking LLM for tariff impact by company type');
  const { positiveTariffImpactOnCompanyType, negativeTariffImpactOnCompanyType } = await getTariffImpactByCompanyType(
    industryAreasWrapper,
    tariffUpdates,
    industryArea,
    date
  );
  console.log('Found tariff impact by company type:', positiveTariffImpactOnCompanyType, negativeTariffImpactOnCompanyType);

  // 5
  console.log('Invoking LLM for tariff impact summary');
  const tariffImpactSummary = await getTariffImpactSummary(
    tariffUpdates,
    industryAreasWrapper,
    industryArea,
    establishedPlayerDetails,
    newChallengersDetails,
    headwindsAndTailwinds,
    positiveTariffImpactOnCompanyType,
    negativeTariffImpactOnCompanyType
  );

  console.log('Found tariff impact summary:', tariffImpactSummary);

  const result: EvaluateIndustryArea = {
    title: industryArea.title,
    aboutParagraphs: industryArea.oneLineSummary,
    establishedPlayersRefs,
    establishedPlayerDetails,
    newChallengersRefs,
    newChallengersDetails,
    headwindsAndTailwinds,
    positiveTariffImpactOnCompanyType,
    negativeTariffImpactOnCompanyType,
    tariffImpactSummary,
  };

  // Upload JSON to S3
  await writeJsonFileForEvaluateSubIndustryArea(industry, industryArea, industryAreasWrapper, result);
}

interface EvaluateIndustryParams {
  tariffIndustry: TariffIndustryDefinition;
  industryArea: IndustrySubArea;
  industryAreasWrapper: IndustryAreasWrapper;
  tariffUpdates: TariffUpdatesForIndustry;
  date: string;
  content: EvaluateIndustryContent;
  challengerTicker?: string;
  establishedPlayerTicker?: string;
}

export async function regenerateEvaluateIndustryAreaJson(params: EvaluateIndustryParams) {
  const { tariffIndustry, industryArea, industryAreasWrapper, tariffUpdates, date, content, challengerTicker, establishedPlayerTicker } = params;
  let result = await readEvaluateSubIndustryAreaJsonFromFile(tariffIndustry.industryId, industryArea, industryAreasWrapper);

  const isTickersOnly = content === EvaluateIndustryContent.ESTABLISHED_PLAYERS_TICKERS_ONLY;

  if (!result) {
    if (!isTickersOnly) {
      await getAndWriteEvaluateIndustryAreaJson(tariffIndustry, industryArea, industryAreasWrapper, tariffUpdates, date);
      return;
    }

    result = {
      title: industryArea.title,
      aboutParagraphs: industryArea.oneLineSummary,
      establishedPlayersRefs: [],
      establishedPlayerDetails: [],
      newChallengersRefs: [],
      newChallengersDetails: [],
      headwindsAndTailwinds: { headwinds: [], tailwinds: [] },
      positiveTariffImpactOnCompanyType: [],
      negativeTariffImpactOnCompanyType: [],
      tariffImpactSummary: '',
    };
  }

  switch (content) {
    case EvaluateIndustryContent.ESTABLISHED_PLAYERS:
      console.log('Regenerating established players');
      const { establishedPlayersRefs, establishedPlayerDetails } = await getEstablishedPlayers(
        tariffIndustry,
        industryAreasWrapper,
        tariffUpdates,
        industryArea,
        date
      );
      result.establishedPlayersRefs = establishedPlayersRefs;
      result.establishedPlayerDetails = establishedPlayerDetails;
      result.tariffImpactSummary = await regenerateTariffImpactSummary(tariffUpdates, industryAreasWrapper, industryArea, result);
      break;
    case EvaluateIndustryContent.ESTABLISHED_PLAYER:
      if (!establishedPlayerTicker) {
        throw new Error('Established player ticker is required for individual player regeneration');
      }
      const existingRef = result.establishedPlayersRefs.find((p) => p.companyTicker === establishedPlayerTicker);
      if (!existingRef) {
        throw new Error(`Established player with ticker ${establishedPlayerTicker} not found`);
      }
      console.log(`Regenerating established player ${existingRef.companyName} (${establishedPlayerTicker})`);
      const newPlayer = await getEstablishedPlayerDetails(
        tariffIndustry,
        industryAreasWrapper,
        tariffUpdates,
        industryArea,
        date,
        existingRef.companyName,
        establishedPlayerTicker
      );
      const idx = result.establishedPlayerDetails.findIndex((p) => p.companyTicker === establishedPlayerTicker);
      if (idx >= 0) {
        result.establishedPlayerDetails[idx] = newPlayer;
      } else {
        result.establishedPlayerDetails.push(newPlayer);
      }
      // result.tariffImpactSummary = await regenerateTariffImpactSummary(tariffUpdates, industryAreasWrapper, industryArea, result);
      break;
    case EvaluateIndustryContent.ESTABLISHED_PLAYERS_TICKERS_ONLY:
      console.log('Getting established players list only');
      const establishedPlayersListOnly = await getEstablishedPlayersListOnly(tariffIndustry, industryAreasWrapper, tariffUpdates, industryArea, date);
      result.establishedPlayersRefs = establishedPlayersListOnly;
      break;
    case EvaluateIndustryContent.NEW_CHALLENGERS:
      console.log('Regenerating new challengers');
      const { newChallengersRefs, newChallengersDetails } = await getNewChallengers(
        tariffIndustry,
        industryAreasWrapper,
        tariffUpdates,
        industryArea,
        result.establishedPlayerDetails,
        date
      );
      result.newChallengersRefs = newChallengersRefs;
      result.newChallengersDetails = newChallengersDetails;
      result.tariffImpactSummary = await regenerateTariffImpactSummary(tariffUpdates, industryAreasWrapper, industryArea, result);
      break;
    case EvaluateIndustryContent.NEW_CHALLENGER:
      if (!challengerTicker) {
        throw new Error('Challenger ticker is required for individual challenger regeneration');
      }
      const existingChallenger = result.newChallengersRefs.find((c) => c.companyTicker === challengerTicker);
      if (!existingChallenger) {
        throw new Error(`Challenger with ticker ${challengerTicker} not found`);
      }
      console.log(`Regenerating new challenger ${existingChallenger.companyName} (${challengerTicker})`);
      const newChallenger = await getNewChallengerDetails(
        tariffIndustry,
        industryAreasWrapper,
        tariffUpdates,
        industryArea,
        result.establishedPlayerDetails,
        date,
        existingChallenger.companyName,
        challengerTicker
      );
      const newIdx = result.newChallengersDetails.findIndex((c) => c.companyTicker === challengerTicker);
      if (newIdx >= 0) {
        result.newChallengersDetails[newIdx] = newChallenger;
      } else {
        result.newChallengersDetails.push(newChallenger);
      }
      // result.tariffImpactSummary = await regenerateTariffImpactSummary(tariffUpdates, industryAreasWrapper, industryArea, result);
      break;
    case EvaluateIndustryContent.NEW_CHALLENGERS_TICKERS_ONLY:
      console.log('Getting new challengers list only');
      const newChallengersListOnly = await getNewChallengersListOnly(
        tariffIndustry,
        industryAreasWrapper,
        tariffUpdates,
        industryArea,
        result.establishedPlayerDetails,
        date
      );
      result.newChallengersRefs = newChallengersListOnly;
      break;
    case EvaluateIndustryContent.HEADWINDS_AND_TAILWINDS:
      result.headwindsAndTailwinds = await getHeadwindsAndTailwinds(tariffIndustry, industryAreasWrapper, tariffUpdates, industryArea, date);
      result.tariffImpactSummary = await regenerateTariffImpactSummary(tariffUpdates, industryAreasWrapper, industryArea, result);
      break;
    case EvaluateIndustryContent.TARIFF_IMPACT_BY_COMPANY_TYPE:
      const impact = await getTariffImpactByCompanyType(industryAreasWrapper, tariffUpdates, industryArea, date);
      result.positiveTariffImpactOnCompanyType = impact.positiveTariffImpactOnCompanyType;
      result.negativeTariffImpactOnCompanyType = impact.negativeTariffImpactOnCompanyType;
      result.tariffImpactSummary = await regenerateTariffImpactSummary(tariffUpdates, industryAreasWrapper, industryArea, result);
      break;
    case EvaluateIndustryContent.TARIFF_IMPACT_SUMMARY:
      result.tariffImpactSummary = await regenerateTariffImpactSummary(tariffUpdates, industryAreasWrapper, industryArea, result);
      break;
    case EvaluateIndustryContent.ALL:
    default:
      // regenerate everything
      return getAndWriteEvaluateIndustryAreaJson(tariffIndustry, industryArea, industryAreasWrapper, tariffUpdates, date);
  }

  // Upload updated JSON to S3
  const jsonKey = getS3KeyForSubIndustryArea(tariffIndustry.industryId, industryArea, industryAreasWrapper, '.json');
  await uploadJsonTariffFileToS3(new TextEncoder().encode(JSON.stringify(result, null, 2)), jsonKey, tariffIndustry.industryId);
}

/** Upload binary blob to S3 & return public https URL */

export async function regenerateTariffImpactSummary(
  tariffUpdates: TariffUpdatesForIndustry,
  industryAreasWrapper: IndustryAreasWrapper,
  subArea: IndustrySubArea,
  currentReport: EvaluateIndustryArea
) {
  console.log('Invoking LLM for tariff impact summary');
  const tariffImpactSummary = await getTariffImpactSummary(
    tariffUpdates,
    industryAreasWrapper,
    subArea,
    currentReport.establishedPlayerDetails,
    currentReport.newChallengersDetails,
    currentReport.headwindsAndTailwinds,
    currentReport.positiveTariffImpactOnCompanyType,
    currentReport.negativeTariffImpactOnCompanyType
  );

  console.log('Found tariff impact summary:', tariffImpactSummary);

  return tariffImpactSummary;
}
