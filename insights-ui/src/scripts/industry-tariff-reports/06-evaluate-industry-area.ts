import { challengerToMarkdown, establishedPlayerToMarkdown } from '@/scripts/industry-tariff-reports/render-markdown';
import { getLlmResponse, outputInstructions } from '@/scripts/llm-utils';
import { getJsonFromS3, uploadFileToS3 } from '@/scripts/report-file-utils';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { z } from 'zod';
import { generateChartUrls, img } from '../chart-utils';
import {
  ChartEntityType,
  EstablishedPlayer,
  EstablishedPlayerRef,
  EstablishedPlayersArray,
  EvaluateIndustryArea,
  EvaluateIndustryContent,
  HeadwindsAndTailwinds,
  IndustryAreasWrapper,
  IndustrySubArea,
  NegativeTariffImpactOnCompanyType,
  NewChallenger,
  NewChallengerRef,
  PositiveTariffImpactOnCompanyType,
  TariffReportIndustry,
  TariffUpdatesForIndustry,
} from './tariff-types';

// ---------------------------------------------------------------------------
// ─── 1. TYPE & SCHEMA EXTENSIONS ────────────────────────────────────────────
// ---------------------------------------------------------------------------

const CompanyProductSchema = z.object({
  productName: z.string().describe('Product name'),
  productDescription: z.string().describe('Brief two-line description of the product'),
  percentageOfRevenue: z.string().describe('Percentage of total revenue contributed'),
  competitors: z.string().array().describe('List of competitors and their relative market scale'),
});

const PerformanceMetricsSchema = z.object({
  revenueGrowth: z.string().describe('Revenue growth: include both percentage and absolute values'),
  costOfRevenue: z.string().describe('Cost of revenue: include percentage and absolute values, and commentary on efficiency'),
  profitabilityGrowth: z.string().describe('Profitability growth: include both percentage and absolute values'),
  rocGrowth: z.string().describe('Return on capital growth: include both percentage and absolute values'),
});

const NewChallengerSchema = z.object({
  companyName: z.string().describe('Name of the company'),
  companyDescription: z.string().describe('One-paragraph overview of the company'),
  companyWebsite: z.string().describe('Company website URL'),
  companyTicker: z.string().describe('Stock ticker symbol'),
  products: z.array(CompanyProductSchema).describe('Product portfolio and revenue breakdown'),
  aboutManagement: z.string().describe('Summary of the management team'),
  uniqueAdvantage: z.string().describe('Key competitive advantage over established players'),
  pastPerformance: PerformanceMetricsSchema.describe('Financial performance over the past five years'),
  futureGrowth: PerformanceMetricsSchema.describe('Projected financial performance over the next five years'),
  impactOfTariffs: z.string().describe('Impact of new tariffs on the company, with facts and reasoning (5-6 lines)'),
  competitors: z.string().describe('Major competitors and their market position'),
});

const EstablishedPlayerSchema = z.object({
  companyName: z.string().describe('Name of the company'),
  companyDescription: z.string().describe('One-paragraph overview of the company'),
  companyWebsite: z.string().describe('Company website URL'),
  companyTicker: z.string().describe('Stock ticker symbol'),
  products: z.array(CompanyProductSchema).describe('Product portfolio and revenue breakdown'),
  aboutManagement: z.string().describe('Summary of the management team'),
  uniqueAdvantage: z.string().describe('Key competitive advantage'),
  pastPerformance: PerformanceMetricsSchema.describe('Financial performance over the past five years'),
  futureGrowth: PerformanceMetricsSchema.describe('Projected financial performance over the next five years'),
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

# Tariff Updates: 
${JSON.stringify(tariffUpdates)}

# Date: 
${date}

# Output Instructions:
${outputInstructions}

The analysis should be only for the ${subArea.title} sector. 
Do not include any data from other headings or subheadings as they will be covered separately.
Make sure to focus just on the ${subArea.title} sector and not on other headings or subheadings.

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
  tariffIndustry: TariffReportIndustry,
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

  return await getLlmResponse<EstablishedPlayer>(detailPrompt, EstablishedPlayerSchema, 'gpt-4o-search-preview');
}

function getSubAreaInfoString(subArea: IndustrySubArea, areas: IndustryAreasWrapper, tariffIndustry: TariffReportIndustry) {
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
  tariffIndustry: TariffReportIndustry,
  areas: IndustryAreasWrapper,
  tariffUpdates: TariffUpdatesForIndustry,
  subArea: IndustrySubArea,
  date: string
): Promise<{ establishedPlayersRefs: EstablishedPlayerRef[]; establishedPlayerDetails: EstablishedPlayer[] }> {
  // --- STEP 1: Fetch just names + tickers ---
  console.log(`[EstablishedPlayers] ${'→ Fetching list of names and tickers'}`);
  const subAreaInfo = getSubAreaInfoString(subArea, areas, tariffIndustry);
  const listInstructions = `
Find the three *Established Players* in the ${subAreaInfo} sector  **but output only** each company's **name** and **ticker** in JSON:
- Select three biggest and most performant public US companies with 5+ years in the sector.
- Focus on US based companies.
- Bigger Focus is on ${tariffIndustry.industryId}
- Make sure the companies are active and are being publicly traded as of ${date} on Nasdaq or NYSE.
- The company should be traded on US exchanges i.e. Nasdaq or NYSE.
- Dont return duplicate companies.
- Ignore companies like ${tariffIndustry.companiesToIgnore.join(', ')} as they are no longer active.
- Make sure the company is not bankrupt or not active.
- Try to find three established players that fall under this category of ${subArea.oneLineSummary} sector.

Do not include any data from other areas or sub-areas as they will be covered separately.

Make sure to focus just on the ${subArea.title} sector and not on other areas or sub-areas

# Other areas and sub-areas
${JSON.stringify(areas, null, 2)}
`;

  const { establishedPlayers: basicList } = await getLlmResponse<{ establishedPlayers: { companyName: string; companyTicker: string }[] }>(
    listInstructions,
    EstablishedPlayerListSchema,
    'gpt-4o-search-preview'
  );
  console.log(`[EstablishedPlayers] ${`← Received basic list: ${JSON.stringify(basicList)}`}`);

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
  tariffIndustry: TariffReportIndustry,
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

  return await getLlmResponse<NewChallenger>(detailPrompt, NewChallengerSchema, 'gpt-4o-search-preview');
}

/**
 * Get new challengers using a two-step approach for better results
 */
async function getNewChallengers(
  tariffIndustry: TariffReportIndustry,
  areas: IndustryAreasWrapper,
  tariffUpdates: TariffUpdatesForIndustry,
  subArea: IndustrySubArea,
  establishedPlayers: EstablishedPlayer[],
  date: string
): Promise<{ newChallengersRefs: NewChallengerRef[]; newChallengersDetails: NewChallenger[] }> {
  // --- STEP 1: Fetch just names + tickers ---
  console.log(`[NewChallengers] ${'→ Fetching list of names and tickers'}`);
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
- Make sure the company is not bankrupt or not active.

Do not include any data from other areas or sub-areas as they will be covered separately.

Make sure to focus just on the ${subArea.title} sector and not on other areas or sub-areas

# Other areas and sub-areas
${JSON.stringify(areas, null, 2)}
`;

  const { newChallengers: basicList } = await getLlmResponse<{ newChallengers: { companyName: string; companyTicker: string }[] }>(
    listInstructions,
    NewChallengerListSchema,
    'gpt-4o-search-preview'
  );
  console.log(`[NewChallengers] ${`← Received basic list: ${JSON.stringify(basicList)}`}`);

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
 * Get headwinds and tailwinds analysis
 */
async function getHeadwindsAndTailwinds(
  tariffIndustry: TariffReportIndustry,
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

  return await getLlmResponse<HeadwindsAndTailwinds>(prompt, HeadwindsAndTailwindsSchema);
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

  return await getLlmResponse<TariffImpactByCompanyType>(prompt, schema);
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

  return (await getLlmResponse<TariffImpactSummary>(prompt, schema)).summary;
}

function getS3Key(industry: string, industryArea: IndustrySubArea, headings: IndustryAreasWrapper, extension: string): string {
  const headingAndSubheadingIndex = headings.areas
    .flatMap((heading, headingIndex) =>
      heading.subAreas.map((subHeading, index) => ({
        headingAndSubheadingIndex: `${headingIndex}_${index}`,
        heading: heading.title,
        subHeading: subHeading.title,
      }))
    )
    .find((item) => item.subHeading === industryArea.title)?.headingAndSubheadingIndex;

  const baseFileName = `${headingAndSubheadingIndex}-evaluate-${slugify(industryArea.title)}`;
  return `koalagains-reports/tariff-reports/${industry.toLowerCase()}/06-evaluate-industry-area/${baseFileName}${extension}`;
}

export async function readEvaluateIndustryAreaJsonFromFile(
  industry: string,
  industryArea: IndustrySubArea,
  headings: IndustryAreasWrapper
): Promise<EvaluateIndustryArea | undefined> {
  const key = getS3Key(industry, industryArea, headings, '.json');
  return await getJsonFromS3<EvaluateIndustryArea>(key);
}

export async function writeEvaluateIndustryAreaToMarkdownFile(
  industry: string,
  industryArea: IndustrySubArea,
  headings: IndustryAreasWrapper,
  evaluateIndustryArea: EvaluateIndustryArea
) {
  const markdownContent = getMarkdownContentForEvaluateIndustryArea(evaluateIndustryArea);
  const key = getS3Key(industry, industryArea, headings, '.md');
  await uploadFileToS3(new TextEncoder().encode(markdownContent), key, 'text/markdown');
}

export async function getAndWriteEvaluateIndustryAreaJson(
  tariffIndustry: TariffReportIndustry,
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
  const jsonKey = getS3Key(industry, industryArea, industryAreasWrapper, '.json');
  await uploadFileToS3(new TextEncoder().encode(JSON.stringify(result, null, 2)), jsonKey, 'application/json');

  // Generate and upload markdown
  await writeEvaluateIndustryAreaToMarkdownFile(industry, industryArea, industryAreasWrapper, result);
}

export async function regenerateEvaluateIndustryAreaJson(
  tariffIndustry: TariffReportIndustry,
  industryArea: IndustrySubArea,
  industryAreasWrapper: IndustryAreasWrapper,
  tariffUpdates: TariffUpdatesForIndustry,
  date: string,
  content: EvaluateIndustryContent,
  challengerTicker?: string,
  establishedPlayerTicker?: string
) {
  // load existing or start new result
  const result = await readEvaluateIndustryAreaJsonFromFile(tariffIndustry.industryId, industryArea, industryAreasWrapper);
  if (!result) {
    await getAndWriteEvaluateIndustryAreaJson(tariffIndustry, industryArea, industryAreasWrapper, tariffUpdates, date);
    return;
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
      const existingPlayer = result.establishedPlayersRefs.find((p) => p.companyTicker === establishedPlayerTicker);
      if (!existingPlayer) {
        throw new Error(`Established player with ticker ${establishedPlayerTicker} not found`);
      }
      console.log(`Regenerating established player ${existingPlayer.companyName} (${establishedPlayerTicker})`);
      const newPlayer = await getEstablishedPlayerDetails(
        tariffIndustry,
        industryAreasWrapper,
        tariffUpdates,
        industryArea,
        date,
        existingPlayer.companyName,
        establishedPlayerTicker
      );
      const playerIndex = result.establishedPlayerDetails.findIndex((p) => p.companyTicker === establishedPlayerTicker);
      result.establishedPlayerDetails[playerIndex] = newPlayer;
      result.tariffImpactSummary = await regenerateTariffImpactSummary(tariffUpdates, industryAreasWrapper, industryArea, result);
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
      const challengerIndex = result.newChallengersDetails.findIndex((c) => c.companyTicker === challengerTicker);
      result.newChallengersDetails[challengerIndex] = newChallenger;
      result.tariffImpactSummary = await regenerateTariffImpactSummary(tariffUpdates, industryAreasWrapper, industryArea, result);
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
  const jsonKey = getS3Key(tariffIndustry.industryId, industryArea, industryAreasWrapper, '.json');
  await uploadFileToS3(new TextEncoder().encode(JSON.stringify(result, null, 2)), jsonKey, 'application/json');

  // Generate and upload updated markdown
  await writeEvaluateIndustryAreaToMarkdownFile(tariffIndustry.industryId, industryArea, industryAreasWrapper, result);
}

/**
 * Generic function – regenerates *just* the charts for a specific entity
 * without touching the underlying descriptive text.
 */
export async function regenerateCharts(
  industry: TariffReportIndustry,
  industryArea: IndustrySubArea,
  headings: IndustryAreasWrapper,
  entityType: ChartEntityType,
  entityIndex = 0
): Promise<void> {
  const report = await readEvaluateIndustryAreaJsonFromFile(industry.industryId, industryArea, headings);

  if (!report) {
    return;
  }

  switch (entityType) {
    case ChartEntityType.NEW_CHALLENGER: {
      const chall = report.newChallengersDetails[entityIndex];
      chall.chartUrls = await generateChartUrls(
        JSON.stringify(chall, null, 2),
        chartsPrefix({
          industry: industry.industryId,
          industryArea: industryArea.title,
          reportSection: 'new-challenger',
          reportSubSection: chall.companyName,
        })
      );
      break;
    }
    case ChartEntityType.ESTABLISHED_PLAYER: {
      const pl = report.establishedPlayerDetails[entityIndex];
      pl.chartUrls = await generateChartUrls(
        JSON.stringify(pl, null, 2),
        chartsPrefix({
          industry: industry.industryId,
          industryArea: industryArea.title,
          reportSection: 'established-player',
          reportSubSection: pl.companyName,
        })
      );
      break;
    }
    case ChartEntityType.HEADWINDS: {
      report.headwindsAndTailwinds.headwindChartUrls = await generateChartUrls(
        report.headwindsAndTailwinds.headwinds.join('\n'),
        chartsPrefix({
          industry: industry.industryId,
          industryArea: industryArea.title,
          reportSection: 'headwinds',
          reportSubSection: 'headwinds',
        })
      );
      break;
    }
    case ChartEntityType.TAILWINDS: {
      report.headwindsAndTailwinds.tailwindChartUrls = await generateChartUrls(
        report.headwindsAndTailwinds.tailwinds.join('\n'),
        chartsPrefix({
          industry: industry.industryId,
          industryArea: industryArea.title,
          reportSection: 'tailwinds',
          reportSubSection: 'tailwinds',
        })
      );
      break;
    }
    case ChartEntityType.POSITIVE_IMPACT: {
      const pos = report.positiveTariffImpactOnCompanyType[entityIndex];
      pos.chartUrls = await generateChartUrls(
        `${pos.companyType}\n${pos.impact}\n${pos.reasoning}`,
        chartsPrefix({
          industry: industry.industryId,
          industryArea: industryArea.title,
          reportSection: 'positive-impact',
          reportSubSection: pos.companyType,
        })
      );
      break;
    }
    case ChartEntityType.NEGATIVE_IMPACT: {
      const neg = report.negativeTariffImpactOnCompanyType[entityIndex];
      neg.chartUrls = await generateChartUrls(
        `${neg.companyType}\n${neg.impact}\n${neg.reasoning}`,
        chartsPrefix({
          industry: industry.industryId,
          industryArea: industryArea.title,
          reportSection: 'negative-impact',
          reportSubSection: neg.companyType,
        })
      );
      break;
    }
    case ChartEntityType.SUMMARY: {
      report.tariffImpactSummaryChartUrls = await generateChartUrls(
        report.tariffImpactSummary,
        chartsPrefix({
          industry: industry.industryId,
          industryArea: industryArea.title,
          reportSection: 'summary',
          reportSubSection: 'summary',
        })
      );
      break;
    }
  }

  // Persist modified JSON
  const jsonKey = getS3Key(industry.industryId, industryArea, headings, '.json');
  await uploadFileToS3(new TextEncoder().encode(JSON.stringify(report, null, 2)), jsonKey, 'application/json');
}

// ---------------------------------------------------------------------------
// ─── 7. MARKDOWN WRITER UPDATE (only snippet – now embeds images) ────────────
// ---------------------------------------------------------------------------
function writeImg(url: string) {
  return `![chart](${url})`; // simple helper
}

function getMarkdownFilePath(industry: string, industryArea: IndustrySubArea, headings: IndustryAreasWrapper) {
  return getS3Key(industry, industryArea, headings, '.md');
}

export function getMarkdownContentForEvaluateIndustryArea(evaluateIndustryArea: EvaluateIndustryArea) {
  const md: string[] = [];

  /* ───────────────────── header ───────────────────── */
  md.push(`# ${evaluateIndustryArea.title}`);
  md.push(evaluateIndustryArea.aboutParagraphs.toString());

  /* ───────────────── Established Players ──────────── */
  md.push('## Established Players');
  evaluateIndustryArea.establishedPlayerDetails.forEach((p) => {
    md.push(establishedPlayerToMarkdown(p));
    md.push(img(p.chartUrls));
  });

  /* ───────────────── New Challengers ──────────────── */
  if (evaluateIndustryArea.newChallengersDetails.length) {
    md.push('## Newer Challengers');
    evaluateIndustryArea.newChallengersDetails.forEach((c) => {
      md.push(challengerToMarkdown(c));
      md.push(img(c.chartUrls));
    });
  }

  /* ──────────────── Headwinds & Tailwinds ─────────── */
  md.push('## Headwinds & Tailwinds');
  md.push('### Headwinds', ...evaluateIndustryArea.headwindsAndTailwinds.headwinds);
  md.push(img(evaluateIndustryArea.headwindsAndTailwinds.headwindChartUrls));
  md.push('### Tailwinds', ...evaluateIndustryArea.headwindsAndTailwinds.tailwinds);
  md.push(img(evaluateIndustryArea.headwindsAndTailwinds.tailwindChartUrls));

  /* ───────── Tariff Impact by Company Type ────────── */
  md.push('## Tariff Impact by Company Type');
  md.push('### Positive Impact');
  evaluateIndustryArea.positiveTariffImpactOnCompanyType.forEach((i) => {
    md.push(`#### ${i.companyType}\n- Impact: ${i.impact}\n- Reasoning: ${i.reasoning}`);
    md.push(img(i.chartUrls));
  });
  md.push('### Negative Impact');
  evaluateIndustryArea.negativeTariffImpactOnCompanyType.forEach((i) => {
    md.push(`#### ${i.companyType}\n- Impact: ${i.impact}\n- Reasoning: ${i.reasoning}`);
    md.push(img(i.chartUrls));
  });

  /* ───────────────────── Summary ──────────────────── */
  md.push('## Tariff Impact Summary', evaluateIndustryArea.tariffImpactSummary);
  md.push(img(evaluateIndustryArea.tariffImpactSummaryChartUrls));

  /* write file */
  const markdownContent = md.join('\n\n');
  return markdownContent;
}

// ---------------------------------------------------------------------------
// ─── 4. HELPERS: PATH BUILDERS ──────────────────────────────────────────────
// ---------------------------------------------------------------------------

function chartsPrefix({
  industry,
  industryArea,
  reportSection,
  reportSubSection,
}: {
  industry: string;
  industryArea: string;
  reportSection: string;
  reportSubSection: string;
}): string {
  return [slugify(industry), slugify(industryArea), slugify(reportSection), slugify(reportSubSection)].join('/');
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
