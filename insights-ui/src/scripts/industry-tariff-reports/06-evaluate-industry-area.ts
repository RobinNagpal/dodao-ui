import { IndustryAreaHeadings, IndustrySubHeading } from '@/scripts/industry-tariff-reports/00-industry-main-headings';
import { TariffUpdatesForIndustry } from '@/scripts/industry-tariff-reports/03-industry-tariffs';
import { getLlmResponse } from '@/scripts/industry-tariff-reports/llm-utils';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { addDirectoryIfNotPresent, reportsOutDir } from '../reportFileUtils';

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

const EvaluateIndustryAreaSchema = z.object({
  title: z.string().describe('Industry area title'),
  aboutParagraphs: z.string().array().describe('Detailed overview of the industry area, in 3–5 lines per paragraph, with citations for definitions and data'),
  newChallengers: z
    .array(NewChallengerSchema)
    .describe('Three leading new challengers (public US companies, IPO in the last 5–7 years), 500–800 words each, with citations'),
  establishedPlayers: z
    .array(EstablishedPlayerSchema)
    .describe('Three top established players (public US companies, 5+ years in industry), 500–800 words each, with citations'),
  headwindsAndTailwinds: HeadwindsAndTailwindsSchema.describe('Headwinds and tailwinds for this industry area, with citations'),
  positiveTariffImpactOnCompanyType: z
    .array(PositiveTariffImpactOnCompanyTypeSchema)
    .describe('Three company categories that benefit from the tariffs, 400–600 words each, with specific examples'),
  negativeTariffImpactOnCompanyType: z
    .array(NegativeTariffImpactOnCompanyTypeSchema)
    .describe('Three company categories that are harmed by the tariffs, 400–600 words each, with specific examples'),
  tariffImpactSummary: z.string().describe('4–5 paragraph summary of tariff impacts on US companies, with examples, facts, and reasoning'),
});

interface CompanyProduct {
  productName: string;
  productDescription: string;
  percentageOfRevenue: string;
  competitors: string[];
}

interface PerformanceMetrics {
  revenueGrowth: string;
  costOfRevenue: string;
  profitabilityGrowth: string;
  rocGrowth: string;
}

interface NewChallenger {
  companyName: string;
  companyDescription: string;
  companyWebsite: string;
  companyTicker: string;
  products: CompanyProduct[];
  aboutManagement: string;
  uniqueAdvantage: string;
  pastPerformance: PerformanceMetrics;
  futureGrowth: PerformanceMetrics;
  competitors: string;
  impactOfTariffs: string;
}

interface EstablishedPlayer {
  companyName: string;
  companyDescription: string;
  companyWebsite: string;
  companyTicker: string;
  products: CompanyProduct[];
  aboutManagement: string;
  uniqueAdvantage: string;
  pastPerformance: PerformanceMetrics;
  futureGrowth: PerformanceMetrics;
  competitors: string;
  impactOfTariffs: string;
}

interface HeadwindsAndTailwinds {
  headwinds: string[];
  tailwinds: string[];
}

export interface PositiveTariffImpactOnCompanyType {
  companyType: string;
  impact: string;
  reasoning: string;
}

export interface NegativeTariffImpactOnCompanyType {
  companyType: string;
  impact: string;
  reasoning: string;
}

interface EvaluateIndustryArea {
  title: string;
  aboutParagraphs: string[];
  newChallengers: NewChallenger[];
  establishedPlayers: EstablishedPlayer[];
  headwindsAndTailwinds: HeadwindsAndTailwinds;
  positiveTariffImpactOnCompanyType: PositiveTariffImpactOnCompanyType[];
  negativeTariffImpactOnCompanyType: NegativeTariffImpactOnCompanyType[];
  tariffImpactSummary: string;
}

export function getEvaluateIndustryAreaPrompt(
  headings: IndustryAreaHeadings,
  tariffUpdates: TariffUpdatesForIndustry,
  industry: IndustrySubHeading,
  date: string
) {
  const prompt = `
I’m researching the ${industry.title} sector and need a detailed report.

Summary: ${industry.oneLineSummary}
Key companies: ${industry.companies.map((c) => c.name).join(', ')}

Please focus only on public US companies.

Report scope (8,000–10,000 words total):

1. **New Challengers** (3 companies):
   - Public US IPOs in the last 5–7 years disrupting the industry.
   - Select the companies with some unique advantage over established players.
   - Make sure there is some unique advantage the selected new player has over established players.
   - 500–800 words each, covering:
     • Company name, description, website, ticker
     • Product portfolio and revenue breakdown
     • Management overview
     • Competitive advantage
     • Past performance (5 years): revenue, cost, profitability, ROC (numbers & facts)
     • Projected performance (next 5 years)
     • Impact of recent tariffs
     • Competitors

2. **Established Players** (3 companies):
   - Public US companies with 5+ years in the sector.
   - 500–800 words each, same details as above.

3. **Industry Headwinds & Tailwinds**:
   - 4–5 headwinds and 4–5 tailwinds, each 3–4 lines with reasoning.

4. **Tariff Impacts**:
   - Three categories of companies positively affected (400–600 words each, with examples).
   - Three categories of companies negatively affected (400–600 words each, with examples).

5. **Tariff Impact Summary**:
   - 4–5 paragraphs summarizing effects on US companies
   - Use specific examples, facts, citations. Write in future tense.

# For output content:
- Cite the latest figures and embed hyperlinks to sources.
- Include hyperlinks/citations in the content where ever possible in the markdown format.
- Dont forget to include hyperlinks/citations in the content where ever possible.
- Avoid LaTeX, italics, or KaTeX formatting, or   character for space
- Use only headings and subheadings, bold, bullets, points, tables for formatting the content.
- Use markdown format for output.
- All amounts, dollar values, or figures should be wrapped in backticks.


Industry areas details:
${JSON.stringify(headings, null, 2)}

# Tariff Updates
${JSON.stringify(tariffUpdates, null, 2)}
`;

  return prompt;
}

/**
 * Converts a NewChallenger object to Markdown with organized sections and tables.
 */
function challengerToMarkdown(challenger: NewChallenger): string {
  // Company Header
  const header =
    `### ${challenger.companyName} (Ticker: ${challenger.companyTicker})\n` +
    `**Description:** ${challenger.companyDescription}\n` +
    `**Website:** [${challenger.companyWebsite}](${challenger.companyWebsite})\n\n`;

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
  const footer = `#### Tariffs & Competitors\n` + `- Tariff Impact: ${challenger.impactOfTariffs}\n` + `- Competitors: ${challenger.competitors}\n`;

  return header + productsSection + performanceSection + managementSection + footer;
}

/**
 * Converts an EstablishedPlayer object to Markdown with organized sections and tables.
 */
function establishedPlayerToMarkdown(player: EstablishedPlayer): string {
  const header =
    `### ${player.companyName} (Ticker: ${player.companyTicker})\n` +
    `**Description:** ${player.companyDescription}\n` +
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
    `#### Management & Strategy\n` + `- About Management: ${player.aboutManagement}\n` + `- Unique Advantage: ${player.uniqueAdvantage}\n\n`;

  const footer = `#### Tariffs & Competitors\n` + `- Tariff Impact: ${player.impactOfTariffs}\n` + `- Competitors: ${player.competitors}\n`;

  return header + productsSection + performanceSection + managementSection + footer;
}

async function getEvaluateIndustryArea(
  industry: IndustrySubHeading,
  headings: IndustryAreaHeadings,
  tariffUpdates: TariffUpdatesForIndustry,
  date: string
): Promise<EvaluateIndustryArea> {
  const prompt = getEvaluateIndustryAreaPrompt(headings, tariffUpdates, industry, date);
  return await getLlmResponse<EvaluateIndustryArea>(prompt, EvaluateIndustryAreaSchema);
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

export async function getAndWriteEvaluateIndustryAreaJson(
  industry: string,
  industryArea: IndustrySubHeading,
  headings: IndustryAreaHeadings,
  tariffUpdates: TariffUpdatesForIndustry,
  date: string
) {
  const evaluateIndustryArea = await getEvaluateIndustryArea(industryArea, headings, tariffUpdates, date);
  const filePath = getJsonFilePath(industry, industryArea, headings);
  fs.writeFileSync(filePath, JSON.stringify(evaluateIndustryArea, null, 2), {
    encoding: 'utf-8',
  });
}

export function readEvaluateIndustryAreaJsonFromFile(industry: string, industryArea: IndustrySubHeading, headings: IndustryAreaHeadings) {
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

export function writeEvaluateIndustryAreaToMarkdownFile(
  industry: string,
  industryArea: IndustrySubHeading,
  headings: IndustryAreaHeadings,
  evaluateIndustryArea: EvaluateIndustryArea
) {
  const filePath = getMarkdownFilePath(industry, industryArea, headings);

  const md = [];
  md.push(`# ${industryArea.title}`);
  md.push(...evaluateIndustryArea.aboutParagraphs);
  md.push(`## Established Players`);
  evaluateIndustryArea.establishedPlayers.forEach((p) => md.push(establishedPlayerToMarkdown(p)));
  md.push(`## Newer Challengers`);
  evaluateIndustryArea.newChallengers.forEach((c) => md.push(challengerToMarkdown(c)));
  md.push(`## Headwinds & Tailwinds`);
  md.push(`### Headwinds`, ...evaluateIndustryArea.headwindsAndTailwinds.headwinds);
  md.push(`### Tailwinds`, ...evaluateIndustryArea.headwindsAndTailwinds.tailwinds);
  md.push(`## Tariff Impact by Company Type`);
  md.push(`### Positive Impact`);
  evaluateIndustryArea.positiveTariffImpactOnCompanyType.forEach((i) => md.push(`#### ${i.companyType}\n- Impact: ${i.impact}\n- Reasoning: ${i.reasoning}`));
  md.push(`### Negative Impact`);
  evaluateIndustryArea.negativeTariffImpactOnCompanyType.forEach((i) => md.push(`#### ${i.companyType}\n- Impact: ${i.impact}\n- Reasoning: ${i.reasoning}`));
  md.push(`## Tariff Impact Summary`, evaluateIndustryArea.tariffImpactSummary);

  fs.writeFileSync(filePath, md.join('\n\n'), 'utf-8');
}
