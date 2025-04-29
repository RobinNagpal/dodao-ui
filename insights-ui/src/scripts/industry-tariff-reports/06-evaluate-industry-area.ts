import { challengerToMarkdown, establishedPlayerToMarkdown } from '@/scripts/industry-tariff-reports/render-markdown';
import { getLlmResponse, gpt4OSearchModel, outputInstructions } from '@/scripts/llm-utils';
import { getJsonFromS3, uploadFileToS3 } from '@/scripts/report-file-utils';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { z } from 'zod';
import { generateChartUrls, img } from '../chart-utils';
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
 * Creates a standard prompt format for industry sector analysis
 */
function createIndustrySectorPrompt({
  industry,
  headings,
  tariffUpdates,
  date,
  instructions,
  context = {},
}: {
  industry: IndustrySubHeading;
  headings: IndustryAreaHeadings;
  tariffUpdates: TariffUpdatesForIndustry;
  date: string;
  instructions: string;
  context?: Record<string, any>;
}): string {
  const commonPrompt = `
${instructions}

Tariff Updates: ${JSON.stringify(tariffUpdates)}
Date: ${date}

${outputInstructions}

The analysis should be only for the ${industry.title} sector. 
Do not include any data from other headings or subheadings as they will be covered separately.
Make sure to focus just on the ${industry.title} sector and not on other headings or subheadings.

# All the industry areas. You need to only cover the ${industry.title} area.
${JSON.stringify(headings, null, 2)}
`;

  // Add any additional context if provided
  const contextStr = Object.entries(context)
    .map(([key, value]) => `# ${key}:\n${typeof value === 'string' ? value : JSON.stringify(value, null, 2)}`)
    .join('\n\n');

  return contextStr ? `${commonPrompt}\n\n${contextStr}` : commonPrompt;
}

/**
 * Get established players with structured data
 */
async function getEstablishedPlayers(
  tariffIndustry: TariffReportIndustry,
  headings: IndustryAreaHeadings,
  tariffUpdates: TariffUpdatesForIndustry,
  industry: IndustrySubHeading,
  date: string
): Promise<EstablishedPlayer[]> {
  const instructions = `Evaluate the following section for *Established Players* in the ${industry.title} sector based on these instructions:
- Focus on public US companies with 5+ years in the sector.
- Focus on US based companies.
- Provide three top established players.
- For each: companyName, companyDescription, companyWebsite, companyTicker, products (portfolio & revenue breakdown), aboutManagement, uniqueAdvantage, pastPerformance (5 years), futureGrowth (next 5 years), impactOfTariffs, competitors.
- Explain tariff impact with facts and reasoning and explain in at least 5-6 lines. Be very specific to the company and dont share general information. Explain in simple way if it will be good or bad for the company.
- Output JSON array matching EstablishedPlayerSchema.
- Ignore companies like ${tariffIndustry.companiesToIgnore.join(', ')} as they are no longer active.
- Make sure the companies are active and are being publicly traded as of ${date} on Nasdaq or NYSE.
- The company should be traded on US exchanges i.e. Nasdaq or NYSE.`;

  const context = {
    'Industry Summary': industry.oneLineSummary,
    'Key Companies': industry.companies.map((c) => c.name).join(', '),
  };

  const prompt = createIndustrySectorPrompt({
    industry,
    headings,
    tariffUpdates,
    date,
    instructions,
    context,
  });

  return (await getLlmResponse<EstablishedPlayersArray>(prompt, EstablishedPlayersArraySchema)).establishedPlayers;
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
 * Get new challengers using a two-step approach for better results
 */
async function getNewChallengers(
  tariffIndustry: TariffReportIndustry,
  headings: IndustryAreaHeadings,
  tariffUpdates: TariffUpdatesForIndustry,
  industry: IndustrySubHeading,
  establishedPlayers: EstablishedPlayer[],
  date: string
): Promise<NewChallenger[]> {
  const logger = (message: string) => console.log(`[NewChallengers] ${message}`);

  // --- STEP 1: Fetch just names + tickers ---
  logger('→ Fetching list of names and tickers');

  const listInstructions = `
Evaluate the *New Challengers* in the ${industry.title} sector **but output only** each company's **name** and **ticker** in JSON:
- Select three public US companies IPO'd in the last 7 years.
- Ignore any Chinese companies.
- Make sure the companies are active and are being publicly traded as of ${date} on Nasdaq or NYSE.
- The company should be traded on US exchanges i.e. Nasdaq or NYSE.
- Dont return duplicate companies.
- The companies should have unique edge over established players which creates probability of huge success in the future.
- Make sure to select the best of the best new players and they not be old established players.
- Ignore challengers like ${tariffIndustry.companiesToIgnore.join(', ')} as they no longer active.
- Make sure the company is not bankrupt or not active.
- Try to find three challenger that fall under this category of ${industry.title} sector.`;

  const listPrompt = createIndustrySectorPrompt({
    industry,
    headings,
    tariffUpdates,
    date,
    instructions: listInstructions,
    context: {
      'Established Players': establishedPlayers.map((ep) => ep.companyName),
    },
  });

  const { newChallengers: basicList } = await getLlmResponse<{ newChallengers: { companyName: string; companyTicker: string }[] }>(
    listPrompt,
    NewChallengerListSchema,
    'gpt-4o-search-preview'
  );
  logger(`← Received basic list: ${JSON.stringify(basicList)}`);

  // --- STEP 2: For each, fetch full details ---
  const detailedList: NewChallenger[] = [];
  for (const { companyName, companyTicker } of basicList) {
    logger(`→ Fetching details for ${companyName} (${companyTicker})`);

    const detailInstructions = `
Gather full details for **${companyName}** (ticker: ${companyTicker}) in the ${industry.title} sector:
- companyName, companyDescription, companyWebsite, companyTicker
- products (portfolio & revenue breakdown)
- aboutManagement, uniqueAdvantage
- pastPerformance (5 yrs), futureGrowth (5 yrs)
- impactOfTariffs (5–6 lines of facts & reasoning)
- competitors
- Output JSON matching NewChallengerSchema exactly.
- Explain tariff impact with facts and reasoning and explain in at least 5-6 lines. Be very specific to the company and dont share general information. Explain in simple way if it will be good or bad for the company.`;

    const detailPrompt = createIndustrySectorPrompt({
      industry,
      headings,
      tariffUpdates,
      date,
      instructions: detailInstructions,
    });

    const newChallenger = await getLlmResponse<NewChallenger>(detailPrompt, NewChallengerSchema, 'gpt-4o-search-preview');
    logger(`← Received details for ${companyName}`);
    detailedList.push(newChallenger);
  }

  return detailedList;
}

/**
 * Get headwinds and tailwinds analysis
 */
async function getHeadwindsAndTailwinds(
  headings: IndustryAreaHeadings,
  tariffUpdates: TariffUpdatesForIndustry,
  industry: IndustrySubHeading,
  date: string
): Promise<HeadwindsAndTailwinds> {
  const instructions = `List 4–5 key *headwinds* and 4–5 key *tailwinds* for the ${industry.title} sector:
- Each explained in 3–4 lines with reasoning. When explaining, take specific examples of the companies and the products. 
- Make sure to take examples.
- Output JSON matching HeadwindsAndTailwindsSchema.`;

  const prompt = createIndustrySectorPrompt({
    industry,
    headings,
    tariffUpdates,
    date,
    instructions,
  });

  return await getLlmResponse<HeadwindsAndTailwinds>(prompt, HeadwindsAndTailwindsSchema);
}

/**
 * Get tariff impact by company type analysis
 */
async function getTariffImpactByCompanyType(
  headings: IndustryAreaHeadings,
  tariffUpdates: TariffUpdatesForIndustry,
  industry: IndustrySubHeading,
  date: string
) {
  const instructions = `Analyze the new tariffs for the ${industry.title} sector and provide:
- Three categories of companies *positively* affected (companyType, impact, reasoning).
- Three categories of companies *negatively* affected (companyType, impact, reasoning).
- Output a JSON object with two arrays: positiveTariffImpactOnCompanyType and negativeTariffImpactOnCompanyType matching their schemas.`;

  const prompt = createIndustrySectorPrompt({
    industry,
    headings,
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
  industry: IndustrySubHeading,
  establishedPlayers: EstablishedPlayer[],
  newChallengers: NewChallenger[],
  headwindsAndTailwinds: HeadwindsAndTailwinds,
  positiveTariffImpactOnCompanyType: PositiveTariffImpactOnCompanyType[],
  negativeTariffImpactOnCompanyType: NegativeTariffImpactOnCompanyType[]
) {
  const instructions = `Write a 3-5 paragraph and Summarize the impact on established players, new challengers, headwinds and tailwinds, and tariff impact by company type in the ${industry.title} sector:
- Write the summary as if it will be used by investors. 
- Add one paragraph for positive impact and include the companies that will be most positively affected to be included first in that paragraph.
- Add one paragraph for negative impact and include the companies that will be most negatively affected to be included first in that paragraph.
- Add one paragraph about Final Notes for the effect of on ${industry.title} sector.
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
    industry,
    headings: { headings: [] }, // Not needed for summary
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

function getS3Key(industry: string, industryArea: IndustrySubHeading, headings: IndustryAreaHeadings, extension: string): string {
  const headingAndSubheadingIndex = headings.headings
    .flatMap((heading, headingIndex) =>
      heading.subHeadings.map((subHeading, index) => ({
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
  industryArea: IndustrySubHeading,
  headings: IndustryAreaHeadings
): Promise<EvaluateIndustryArea | undefined> {
  try {
    const key = getS3Key(industry, industryArea, headings, '.json');
    return await getJsonFromS3<EvaluateIndustryArea>(key);
  } catch (error) {
    console.error(`Error reading file from S3: ${error}`);
    return undefined;
  }
}

export async function writeEvaluateIndustryAreaToMarkdownFile(
  industry: string,
  industryArea: IndustrySubHeading,
  headings: IndustryAreaHeadings,
  evaluateIndustryArea: EvaluateIndustryArea
) {
  const markdownContent = getMarkdownContentForEvaluateIndustryArea(evaluateIndustryArea);
  const key = getS3Key(industry, industryArea, headings, '.md');
  await uploadFileToS3(new TextEncoder().encode(markdownContent), key, 'text/markdown');
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

  // Upload JSON to S3
  const jsonKey = getS3Key(industry, industryArea, headings, '.json');
  await uploadFileToS3(new TextEncoder().encode(JSON.stringify(result, null, 2)), jsonKey, 'application/json');

  // Generate and upload markdown
  await writeEvaluateIndustryAreaToMarkdownFile(industry, industryArea, headings, result);
}

export async function regenerateEvaluateIndustryAreaJson(
  tariffIndustry: TariffReportIndustry,
  industryArea: IndustrySubHeading,
  headings: IndustryAreaHeadings,
  tariffUpdates: TariffUpdatesForIndustry,
  date: string,
  content: EvaluateIndustryContent
) {
  // load existing or start new result
  const result = await readEvaluateIndustryAreaJsonFromFile(tariffIndustry.name, industryArea, headings);
  if (!result) {
    return;
  }

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

  // Upload updated JSON to S3
  const jsonKey = getS3Key(tariffIndustry.name, industryArea, headings, '.json');
  await uploadFileToS3(new TextEncoder().encode(JSON.stringify(result, null, 2)), jsonKey, 'application/json');

  // Generate and upload updated markdown
  await writeEvaluateIndustryAreaToMarkdownFile(tariffIndustry.name, industryArea, headings, result);
}

/**
 * Generic function – regenerates *just* the charts for a specific entity
 * without touching the underlying descriptive text.
 */
export async function regenerateCharts(
  industry: TariffReportIndustry,
  industryArea: IndustrySubHeading,
  headings: IndustryAreaHeadings,
  entityType: ChartEntityType,
  entityIndex = 0
): Promise<void> {
  const report = await readEvaluateIndustryAreaJsonFromFile(industry.name, industryArea, headings);

  if (!report) {
    return;
  }

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
  const jsonKey = getS3Key(industry.name, industryArea, headings, '.json');
  await uploadFileToS3(new TextEncoder().encode(JSON.stringify(report, null, 2)), jsonKey, 'application/json');
}

// ---------------------------------------------------------------------------
// ─── 7. MARKDOWN WRITER UPDATE (only snippet – now embeds images) ────────────
// ---------------------------------------------------------------------------
function writeImg(url: string) {
  return `![chart](${url})`; // simple helper
}

function getMarkdownFilePath(industry: string, industryArea: IndustrySubHeading, headings: IndustryAreaHeadings) {
  return getS3Key(industry, industryArea, headings, '.md');
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
