import { getLlmResponse, gpt4OSearchModel, outputInstructions } from '@/scripts/llm-utils';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { generateChartUrls, img } from '../chart-utils';
import { addDirectoryIfNotPresent, reportsOutDir } from '../reportFileUtils';
import {
  ChartEntityType,
  EstablishedPlayer,
  EstablishedPlayersArray,
  EvaluateIndustryArea,
  EvaluateIndustryContent,
  HeadwindsAndTailwinds,
  IndustryAreaHeadings,
  IndustrySubHeading,
  NegativeTariffImpactOnCompanyType,
  NewChallenger,
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
 * Converts a NewChallenger object to Markdown with organized sections and tables.
 */
function challengerToMarkdown(challenger: NewChallenger): string {
  // Company Header
  const header =
    `### ${challenger.companyName} (Ticker: ${challenger.companyTicker})\n` +
    `**Description:** ${challenger.companyDescription}\n\n` +
    `**Website:** [${challenger.companyWebsite}](${challenger.companyWebsite})\n\n` +
    `**Unique Advantage:** ${challenger.uniqueAdvantage}\n\n`;

  // Product Portfolio
  const productsSection =
    `#### Products\n` +
    `| Name | Description | % of Revenue | Competitors |\n` +
    `| ---- | ----------- | ------------ | ----------- |\n` +
    challenger.products.map((p) => `| ${p.productName} | ${p.productDescription} | ${p.percentageOfRevenue} | ${p.competitors.join(', ')} |`).join('\n') +
    `\n\n`;

  // Performance Metrics
  const past = challenger.pastPerformance;
  const future = challenger.futureGrowth;
  const performanceSection =
    `#### Performance\n` +
    `- **Past 5 Years:**\n` +
    `  - Revenue Growth: ${past.revenueGrowth}\n` +
    `  - Cost of Revenue: ${past.costOfRevenue}\n` +
    `  - Profitability Growth: ${past.profitabilityGrowth}\n` +
    `  - ROC Growth: ${past.rocGrowth}\n` +
    `- **Next 5 Years (Projected):**\n` +
    `  - Revenue Growth: ${future.revenueGrowth}\n` +
    `  - Cost of Revenue: ${future.costOfRevenue}\n` +
    `  - Profitability Growth: ${future.profitabilityGrowth}\n` +
    `  - ROC Growth: ${future.rocGrowth}\n\n`;

  // Management & Strategy
  const managementSection =
    `#### Management & Strategy\n` + `- About Management: ${challenger.aboutManagement}\n` + `- Unique Advantage: ${challenger.uniqueAdvantage}\n\n`;

  // Tariff Impact & Competitors
  const footer = `#### Tariffs & Competitors\n\n` + `- Tariff Impact: ${challenger.impactOfTariffs}\n\n` + `- Competitors: ${challenger.competitors}\n`;

  return header + productsSection + performanceSection + managementSection + footer;
}

/**
 * Converts an EstablishedPlayer object to Markdown with organized sections and tables.
 */
function establishedPlayerToMarkdown(player: EstablishedPlayer): string {
  const header =
    `### ${player.companyName} (Ticker: ${player.companyTicker})\n` +
    `**Description:** ${player.companyDescription}\n\n` +
    `**Website:** [${player.companyWebsite}](${player.companyWebsite})\n\n`;

  const productsSection =
    `#### Products\n` +
    `| Name | Description | % of Revenue | Competitors |\n` +
    `| ---- | ----------- | ------------ | ----------- |\n` +
    player.products.map((p) => `| ${p.productName} | ${p.productDescription} | ${p.percentageOfRevenue} | ${p.competitors.join(', ')} |`).join('\n') +
    `\n\n`;

  const past = player.pastPerformance;
  const future = player.futureGrowth;
  const performanceSection =
    `#### Performance\n` +
    `- **Past 5 Years:**\n` +
    `  - Revenue Growth: ${past.revenueGrowth}\n` +
    `  - Cost of Revenue: ${past.costOfRevenue}\n` +
    `  - Profitability Growth: ${past.profitabilityGrowth}\n` +
    `  - ROC Growth: ${past.rocGrowth}\n` +
    `- **Next 5 Years (Projected):**\n` +
    `  - Revenue Growth: ${future.revenueGrowth}\n` +
    `  - Cost of Revenue: ${future.costOfRevenue}\n` +
    `  - Profitability Growth: ${future.profitabilityGrowth}\n` +
    `  - ROC Growth: ${future.rocGrowth}\n\n`;

  const managementSection =
    `#### Management & Strategy\n\n` + `- About Management: ${player.aboutManagement}\n\n` + `- Unique Advantage: ${player.uniqueAdvantage}\n\n`;

  const footer = `#### Tariffs & Competitors\n\n` + `- Tariff Impact: ${player.impactOfTariffs}\n\n` + `- Competitors: ${player.competitors}\n\n`;

  return header + productsSection + performanceSection + managementSection + footer;
}

async function getEstablishedPlayers(
  tariffIndustry: TariffReportIndustry,
  headings: IndustryAreaHeadings,
  tariffUpdates: TariffUpdatesForIndustry,
  industry: IndustrySubHeading,
  date: string
): Promise<EstablishedPlayer[]> {
  const prompt = `Evaluate the following section for *Established Players* in the ${industry.title} sector based on these instructions:
- Focus on public US companies with 5+ years in the sector.
- Focus on US based companies.
- Provide three top established players.
- For each: companyName, companyDescription, companyWebsite, companyTicker, products (portfolio & revenue breakdown), aboutManagement, uniqueAdvantage, pastPerformance (5 years), futureGrowth (next 5 years), impactOfTariffs, competitors.
- Explain tariff impact with facts and reasoning and explain in at least 5-6 lines. Be very specific to the company and dont share general information. Explain in simple way if it will be good or bad for the company.
- Output JSON array matching EstablishedPlayerSchema.
- Ignore companies like ${tariffIndustry.companiesToIgnore.join(', ')} as they are no longer active.
- Make sure the companies are active and are being publicly traded as of ${date} on Nasdaq or NYSE.
- The company should be traded on US exchanges i.e. Nasdaq or NYSE.

${outputInstructions}

Industry Summary: ${industry.oneLineSummary}
Key Companies: ${industry.companies.map((c) => c.name).join(', ')}

Tariff Updates: ${JSON.stringify(tariffUpdates)}
Date: ${date}


The selected companies should be just from the ${industry.title} sector. 
Do not include any companies from other headings or subheadings as they will be covered separately.
Make sure to select companies just from the ${industry.title} sector and not from other headings or subheadings.

# All the industry areas. You need to only cover the ${industry.title} area.
${JSON.stringify(headings, null, 2)}

`;

  return (await getLlmResponse<EstablishedPlayersArray>(prompt, EstablishedPlayersArraySchema)).establishedPlayers;
}

// 2. New Challengers
// A minimal schema for step 1: name + ticker only
const NewChallengerListSchema = z.object({
  newChallengers: z.array(
    z.object({
      companyName: z.string().describe('Name of the company'),
      companyTicker: z.string().describe('Stock ticker symbol'),
    })
  ),
});

async function getNewChallengers(
  tariffIndustry: TariffReportIndustry,
  headings: IndustryAreaHeadings,
  tariffUpdates: TariffUpdatesForIndustry,
  industry: IndustrySubHeading,
  establishedPlayers: EstablishedPlayer[],
  date: string
): Promise<NewChallenger[]> {
  // --- STEP 1: Fetch just names + tickers ---
  console.log('[NewChallengers] → Fetching list of names and tickers');
  const listPrompt = `
Evaluate the *New Challengers* in the ${industry.title} sector **but output only** each company's **name** and **ticker** in JSON:
- Select three public US companies IPO'd in the last 7 years.
- Ignore any Chinese companies.
- Output JSON matching:
- Make sure the companies are active and are being publicly traded as of ${date} on Nasdaq or NYSE.
- The company should be traded on US exchanges i.e. Nasdaq or NYSE.
- Dont return duplicate companies.
- The companies should have unique edge over established players which creates probability of huge success in the future.
- Make sure to select the best of the best new players and they not be old established players.
- Ignore challengers like ${tariffIndustry.companiesToIgnore.join(', ')} as they no longer active.
- Make sure the company is not bankrupt or not active.
- Try to find three challenger that fall under this category of ${industry.title} sector.
  {
    "newChallengers": [
      { "companyName": "...", "companyTicker": "..." },
      …
    ]
  }
  
The selected companies should be just from the ${industry.title} sector. 
Do not include any companies from other headings or subheadings as they will be covered separately.
Make sure to select companies just from the ${industry.title} sector and not from other headings or subheadings.
  
# Established Players:
${JSON.stringify(
  establishedPlayers.map((ep) => ep.companyName),
  null,
  2
)}

  
# All the industry areas. You need to only cover the ${industry.title} area.
${JSON.stringify(headings, null, 2)}

`;
  const { newChallengers: basicList } = await getLlmResponse<{ newChallengers: { companyName: string; companyTicker: string }[] }>(
    listPrompt,
    NewChallengerListSchema,
    gpt4OSearchModel
  );
  console.log('[NewChallengers] ← Received basic list:', basicList);

  // --- STEP 2: For each, fetch full details ---
  const detailedList: NewChallenger[] = [];
  for (const { companyName, companyTicker } of basicList) {
    console.log(`[NewChallengers] → Fetching details for ${companyName} (${companyTicker})`);
    const detailPrompt = `
Gather full details for **${companyName}** (ticker: ${companyTicker}) in the ${industry.title} sector:
- companyName, companyDescription, companyWebsite, companyTicker
- products (portfolio & revenue breakdown)
- aboutManagement, uniqueAdvantage
- pastPerformance (5 yrs), futureGrowth (5 yrs)
- impactOfTariffs (5–6 lines of facts & reasoning)
- competitors
- Output JSON matching NewChallengerSchema exactly.
- Explain tariff impact with facts and reasoning and explain in at least 5-6 lines. Be very specific to the company and dont share general information. Explain in simple way if it will be good or bad for the company.

${outputInstructions}

# Tariff Updates:
${JSON.stringify(tariffUpdates, null, 2)}

`;
    const newChallenger = await getLlmResponse<NewChallenger>(detailPrompt, NewChallengerSchema, gpt4OSearchModel);
    console.log(`[NewChallengers] ← Details for ${companyName}:`, newChallenger);
    detailedList.push(newChallenger);
  }

  return detailedList;
}

// 3. Headwinds & Tailwinds
async function getHeadwindsAndTailwinds(headings: IndustryAreaHeadings, tariffUpdates: TariffUpdatesForIndustry, industry: IndustrySubHeading, date: string) {
  const prompt = `List 4–5 key *headwinds* and 4–5 key *tailwinds* for the ${industry.title} sector:
- Each explained in 3–4 lines with reasoning. When explaining, take specific examples of the companies and the products. 
- Make sure to take examples.
- Output JSON matching HeadwindsAndTailwindsSchema.

Tariff Updates: ${JSON.stringify(tariffUpdates)}
Date: ${date}

${outputInstructions}

The headwinds and tailwinds should be only for the ${industry.title} sector. 
Do not include any headwinds or tailwinds from other headings or subheadings as they will be covered separately.
Make sure to select headwinds and tailwinds just from the ${industry.title} sector and not from other headings or subheadings.

# All the industry areas. You need to only cover the ${industry.title} area.
${JSON.stringify(headings, null, 2)}
`;

  return await getLlmResponse<HeadwindsAndTailwinds>(prompt, HeadwindsAndTailwindsSchema);
}

// 4. Tariff Impact by Company Type
async function getTariffImpactByCompanyType(
  headings: IndustryAreaHeadings,
  tariffUpdates: TariffUpdatesForIndustry,
  industry: IndustrySubHeading,
  date: string
) {
  const prompt = `Analyze the new tariffs for the ${industry.title} sector and provide:
- Three categories of companies *positively* affected (companyType, impact, reasoning).
- Three categories of companies *negatively* affected (companyType, impact, reasoning).
- Output a JSON object with two arrays: positiveTariffImpactOnCompanyType and negativeTariffImpactOnCompanyType matching their schemas.

Tariff Updates: ${JSON.stringify(tariffUpdates)}
Date: ${date}

${outputInstructions}

The selected tariff impact should be just from the ${industry.title} sector.
Do not include any tariff impact from other headings or subheadings as they will be covered separately.
Make sure to select tariff impact just from the ${industry.title} sector and not from other headings or subheadings.

# All the industry areas. You need to only cover the ${industry.title} area.
${JSON.stringify(headings, null, 2)}

`;

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

// 5. Tariff Impact Summary
async function getTariffImpactSummary(
  tariffUpdates: TariffUpdatesForIndustry,
  industry: IndustrySubHeading,
  establishedPlayers: EstablishedPlayer[],
  newChallengers: NewChallenger[],
  headwindsAndTailwinds: HeadwindsAndTailwinds,
  positiveTariffImpactOnCompanyType: PositiveTariffImpactOnCompanyType[],
  negativeTariffImpactOnCompanyType: NegativeTariffImpactOnCompanyType[]
) {
  const prompt = `Write a 3-5 paragraph and Summarize the impact on established players, new challengers, headwinds and tailwinds, and tariff impact by company type in the ${
    industry.title
  } sector:
- Write the summary as if it will be used by investors. 
- Add one paragraph for positive impact and include the companies that will be most positively affected to be included first in that paragraph.
- Add one paragraph for negative impact and include the companies that will be most negatively affected to be included first in that paragraph.
- Add one paragraph about Final Notes for the effect of on ${industry.title} sector.
- Summary should be 3 paragraphs long, with each paragraph of 6-8 lines long.
- Include specific examples of companies, facts, and reasoning.
- Focus on impact on US based companies.

${outputInstructions}


# Established Players: 
${JSON.stringify(establishedPlayers, null, 2)}

# New Challengers:
${JSON.stringify(newChallengers, null, 2)}

# Headwinds and Tailwinds:
${JSON.stringify(headwindsAndTailwinds, null, 2)}

# Positive Tariff Impact on Company Type:
${JSON.stringify(positiveTariffImpactOnCompanyType, null, 2)}

# Negative Tariff Impact on Company Type:
${JSON.stringify(negativeTariffImpactOnCompanyType, null, 2)}

`;

  const schema = z.object({
    summary: z.string().describe('Summary of tariff impacts'),
  });

  interface TariffImpactSummary {
    summary: string;
  }
  return (await getLlmResponse<TariffImpactSummary>(prompt, schema)).summary;
}
export async function getAndWriteEvaluateIndustryAreaJson(
  tariffIndustry: TariffReportIndustry,
  industryArea: IndustrySubHeading,
  headings: IndustryAreaHeadings,
  tariffUpdates: TariffUpdatesForIndustry,
  date: string
) {
  const industry = tariffIndustry.name;
  // 1
  console.log('Invoking LLM for established players');
  const establishedPlayers = await getEstablishedPlayers(tariffIndustry, headings, tariffUpdates, industryArea, date);
  console.log('Found established players:', establishedPlayers);

  // 2
  console.log('Invoking LLM for new challengers');
  const newChallengers = await getNewChallengers(tariffIndustry, headings, tariffUpdates, industryArea, establishedPlayers, date);
  console.log('Found new challengers:', newChallengers);

  // 3
  console.log('Invoking LLM for headwinds and tailwinds');
  const headwindsAndTailwinds = await getHeadwindsAndTailwinds(headings, tariffUpdates, industryArea, date);
  console.log('Found headwinds and tailwinds:', headwindsAndTailwinds);

  // 4
  console.log('Invoking LLM for tariff impact by company type');
  const { positiveTariffImpactOnCompanyType, negativeTariffImpactOnCompanyType } = await getTariffImpactByCompanyType(
    headings,
    tariffUpdates,
    industryArea,
    date
  );
  console.log('Found tariff impact by company type:', positiveTariffImpactOnCompanyType, negativeTariffImpactOnCompanyType);

  // 5
  console.log('Invoking LLM for tariff impact summary');
  const tariffImpactSummary = await getTariffImpactSummary(
    tariffUpdates,
    industryArea,
    establishedPlayers,
    newChallengers,
    headwindsAndTailwinds,
    positiveTariffImpactOnCompanyType,
    negativeTariffImpactOnCompanyType
  );

  console.log('Found tariff impact summary:', tariffImpactSummary);

  const result = {
    title: industryArea.title,
    aboutParagraphs: industryArea.oneLineSummary,
    establishedPlayers,
    newChallengers,
    headwindsAndTailwinds,
    positiveTariffImpactOnCompanyType,
    negativeTariffImpactOnCompanyType,
    tariffImpactSummary,
  };

  const jsonPath = getJsonFilePath(industry, industryArea, headings);
  addDirectoryIfNotPresent(path.dirname(jsonPath));
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf-8');
}

export async function regenerateTariffImpactSummary(
  tariffUpdates: TariffUpdatesForIndustry,
  industryArea: IndustrySubHeading,
  currentReport: EvaluateIndustryArea
) {
  console.log('Invoking LLM for tariff impact summary');
  const tariffImpactSummary = await getTariffImpactSummary(
    tariffUpdates,
    industryArea,
    currentReport.establishedPlayers,
    currentReport.newChallengers,
    currentReport.headwindsAndTailwinds,
    currentReport.positiveTariffImpactOnCompanyType,
    currentReport.negativeTariffImpactOnCompanyType
  );

  console.log('Found tariff impact summary:', tariffImpactSummary);

  return tariffImpactSummary;
}

export async function regenerateEvaluateIndustryAreaJson(
  tariffIndustry: TariffReportIndustry,
  industryArea: IndustrySubHeading,
  headings: IndustryAreaHeadings,
  tariffUpdates: TariffUpdatesForIndustry,
  date: string,
  content: EvaluateIndustryContent
) {
  const jsonPath = getJsonFilePath(tariffIndustry.name, industryArea, headings);
  if (!fs.existsSync(jsonPath)) {
  }

  // load existing or start new result
  const result: EvaluateIndustryArea = readEvaluateIndustryAreaJsonFromFile(tariffIndustry.name, industryArea, headings);

  switch (content) {
    case EvaluateIndustryContent.ESTABLISHED_PLAYERS:
      result.establishedPlayers = await getEstablishedPlayers(tariffIndustry, headings, tariffUpdates, industryArea, date);
      result.tariffImpactSummary = await regenerateTariffImpactSummary(tariffUpdates, industryArea, result);
      break;
    case EvaluateIndustryContent.NEW_CHALLENGERS:
      result.newChallengers = await getNewChallengers(tariffIndustry, headings, tariffUpdates, industryArea, result.establishedPlayers, date);
      result.tariffImpactSummary = await regenerateTariffImpactSummary(tariffUpdates, industryArea, result);
      break;
    case EvaluateIndustryContent.HEADWINDS_AND_TAILWINDS:
      result.headwindsAndTailwinds = await getHeadwindsAndTailwinds(headings, tariffUpdates, industryArea, date);
      result.tariffImpactSummary = await regenerateTariffImpactSummary(tariffUpdates, industryArea, result);
      break;
    case EvaluateIndustryContent.TARIFF_IMPACT_BY_COMPANY_TYPE:
      const impact = await getTariffImpactByCompanyType(headings, tariffUpdates, industryArea, date);
      result.positiveTariffImpactOnCompanyType = impact.positiveTariffImpactOnCompanyType;
      result.negativeTariffImpactOnCompanyType = impact.negativeTariffImpactOnCompanyType;
      result.tariffImpactSummary = await regenerateTariffImpactSummary(tariffUpdates, industryArea, result);
      break;
    case EvaluateIndustryContent.TARIFF_IMPACT_SUMMARY:
      result.tariffImpactSummary = await regenerateTariffImpactSummary(tariffUpdates, industryArea, result);
      break;
    case EvaluateIndustryContent.ALL:
    default:
      // regenerate everything
      return getAndWriteEvaluateIndustryAreaJson(tariffIndustry, industryArea, headings, tariffUpdates, date);
  }

  // write updated file and markdown
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf-8');
  writeEvaluateIndustryAreaToMarkdownFile(tariffIndustry.name, industryArea, headings, result);
}

/**
 * Generic function – regenerates *just* the charts for a specific entity
 * without touching the underlying descriptive text.
 */
export async function regenerateCharts(
  industry: TariffReportIndustry,
  industryArea: IndustrySubHeading,
  headings: IndustryAreaHeadings,
  entityType: ChartEntityType,
  entityIndex = 0
): Promise<void> {
  const report = readEvaluateIndustryAreaJsonFromFile(industry.name, industryArea, headings);

  switch (entityType) {
    case ChartEntityType.NEW_CHALLENGER: {
      const chall = report.newChallengers[entityIndex];
      chall.chartUrls = await generateChartUrls(
        JSON.stringify(chall, null, 2),
        chartsPrefix({
          industry: industry.name,
          industryArea: industryArea.title,
          reportSection: 'new-challenger',
          reportSubSection: chall.companyName,
        })
      );
      break;
    }
    case ChartEntityType.ESTABLISHED_PLAYER: {
      const pl = report.establishedPlayers[entityIndex];
      pl.chartUrls = await generateChartUrls(
        JSON.stringify(pl, null, 2),
        chartsPrefix({
          industry: industry.name,
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
          industry: industry.name,
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
          industry: industry.name,
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
          industry: industry.name,
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
          industry: industry.name,
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
          industry: industry.name,
          industryArea: industryArea.title,
          reportSection: 'summary',
          reportSubSection: 'summary',
        })
      );
      break;
    }
  }

  // Persist modified JSON
  const jsonPath = getJsonFilePath(industry.name, industryArea, headings);
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf-8');
}

// ---------------------------------------------------------------------------
// ─── 7. MARKDOWN WRITER UPDATE (only snippet – now embeds images) ────────────
// ---------------------------------------------------------------------------
function writeImg(url: string) {
  return `![chart](${url})`; // simple helper
}

function getJsonFilePath(industry: string, industryArea: IndustrySubHeading, headings: IndustryAreaHeadings) {
  const headingAndSubheadingIndex = headings.headings
    .flatMap((heading, headingIndex) =>
      heading.subHeadings.map((subHeading, index) => ({
        headingAndSubheadingIndex: `${headingIndex}_${index}`,
        heading: heading.title,
        subHeading: subHeading.title,
      }))
    )
    .find((item) => item.subHeading === industryArea.title)?.headingAndSubheadingIndex;

  const dirPath = path.join(reportsOutDir, industry.toLowerCase(), '06-evaluate-industry-area');
  const filePath = path.join(dirPath, `${headingAndSubheadingIndex}-evaluate-${slugify(industryArea.title)}.json`);
  addDirectoryIfNotPresent(dirPath);
  return filePath;
}

function getMarkdownFilePath(industry: string, industryArea: IndustrySubHeading, headings: IndustryAreaHeadings) {
  return getJsonFilePath(industry, industryArea, headings).replace('.json', '.md');
}

export function readEvaluateIndustryAreaJsonFromFile(industry: string, industryArea: IndustrySubHeading, headings: IndustryAreaHeadings): EvaluateIndustryArea {
  const filePath = getJsonFilePath(industry, industryArea, headings);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  // Read the file contents and convert to string
  const contents: string = fs.readFileSync(filePath, 'utf-8').toString();
  // Parse the JSON data
  const evaluateIndustryArea: EvaluateIndustryArea = JSON.parse(contents);
  return evaluateIndustryArea;
}

export function getMarkdownContentForEvaluateIndustryArea(evaluateIndustryArea: EvaluateIndustryArea) {
  const md: string[] = [];

  /* ───────────────────── header ───────────────────── */
  md.push(`# ${evaluateIndustryArea.title}`);
  md.push(evaluateIndustryArea.aboutParagraphs.toString());

  /* ───────────────── Established Players ──────────── */
  md.push('## Established Players');
  evaluateIndustryArea.establishedPlayers.forEach((p) => {
    md.push(establishedPlayerToMarkdown(p));
    md.push(img(p.chartUrls));
  });

  /* ───────────────── New Challengers ──────────────── */
  if (evaluateIndustryArea.newChallengers.length) {
    md.push('## Newer Challengers');
    evaluateIndustryArea.newChallengers.forEach((c) => {
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

/** Markdown writer – now embeds charts right after the relevant text */
export function writeEvaluateIndustryAreaToMarkdownFile(
  industry: string,
  industryArea: IndustrySubHeading,
  headings: IndustryAreaHeadings,
  evaluateIndustryArea: EvaluateIndustryArea
) {
  const filePath = getMarkdownFilePath(industry, industryArea, headings);
  const markdownContent = getMarkdownContentForEvaluateIndustryArea(evaluateIndustryArea);
  fs.writeFileSync(filePath, markdownContent, 'utf-8');
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
