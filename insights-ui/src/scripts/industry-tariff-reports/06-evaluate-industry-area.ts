import { IndustryAreaHeadings, IndustrySubHeading } from '@/scripts/industry-tariff-reports/00-industry-main-headings';
import { TariffUpdatesForIndustry } from '@/scripts/industry-tariff-reports/03-industry-tariffs';
import { getLlmResponse } from '@/scripts/industry-tariff-reports/llm-utils';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { addDirectoryIfNotPresent, reportsOutDir } from '../reportFileUtils';

const CompanyProductSchema = z.object({
  productName: z.string().describe('Name of the product.'),
  productDescription: z.string().describe('Two line description of the product.'),
  percentageOfRevenue: z.string().describe('Percentage of revenue from the product.'),
  competitors: z.string().array().describe('Competitors of the product and their scale.'),
});

const PerformanceMetricsSchema = z.object({
  revenueGrowth: z.string().describe('Revenue growth of the company. ' + 'Include details on both the percentage and the dollar value.'),
  costOfRevenue: z
    .string()
    .describe(
      'Cost of revenue of the company needed to support the growth and explain if its was a good or a bad. ' +
        'Include details on both the percentage and the dollar value.'
    ),
  profitabilityGrowth: z.string().describe('Profitability growth of the company. ' + 'Include details on both the percentage and the dollar value.'),
  rocGrowth: z.string().describe('ROC growth of the company. Include details on both the percentage and the dollar value.'),
});

const NewChallengerSchema = z.object({
  companyName: z.string().describe('Name of the company.'),
  companyDescription: z.string().describe('One paragraph description of the company.'),
  companyWebsite: z.string().describe('Website of the company.'),
  companyTicker: z.string().describe('Ticker of the company.'),
  products: z.array(CompanyProductSchema).describe('Products of the company and the revenue each product generates.'),
  aboutManagement: z.string().describe('About the management team of the company.'),
  uniqueAdvantage: z.string().describe('Unique advantage of the company against the established players.'),
  pastPerformance: PerformanceMetricsSchema.describe('Growth, Revenue, and Profitability, ROC of the company in the last five years'),
  futureGrowth: PerformanceMetricsSchema.describe('Growth, Revenue, and Profitability, ROC of the company expected in the next five years'),
  impactOfTariffs: z.string().describe('Impact of the new tariffs on the company. Explain in 3-4 lines with facts and reasoning.'),
  competitors: z.string().describe('Competitors of the company and their scale.'),
});

const EstablishedPlayerSchema = z.object({
  companyName: z.string().describe('Name of the company.'),
  companyDescription: z.string().describe('One paragraph description of the company.'),
  companyWebsite: z.string().describe('Website of the company.'),
  companyTicker: z.string().describe('Ticker of the company.'),
  products: z.array(CompanyProductSchema).describe('Products of the company and the revenue each product generates.'),
  aboutManagement: z.string().describe('About the management team of the company.'),
  uniqueAdvantage: z.string().describe('Unique advantage of the company against the established players.'),
  pastPerformance: PerformanceMetricsSchema.describe('Growth, Revenue, and Profitability, ROC of the company in the last five years'),
  futureGrowth: PerformanceMetricsSchema.describe('Growth, Revenue, and Profitability, ROC of the company expected in the next five years'),
  impactOfTariffs: z.string().describe('Impact of the new tariffs on the company. Explain in 3-4 lines with facts and reasoning.'),
  competitors: z.string().describe('Competitors of the company and their scale.'),
});

const HeadwindsAndTailwindsSchema = z.object({
  headwinds: z
    .string()
    .array()
    .describe(
      '4-5 Headwinds faced by ths area of the industry and its impact on the growth and revenue. ' +
        'Each headwind should be 3-4 lines long and give full reasoning behind it.'
    ),
  tailwinds: z
    .string()
    .array()
    .describe(
      '4-5 Tailwinds faced by ths area of the industry and its impact on the growth and revenue.' +
        'Each tailwind should be 3-4 lines long and give full reasoning behind it.'
    ),
});

const PositiveTariffImpactOnCompanyTypeSchema = z.object({
  companyType: z.string().describe('Type of the companies that will be positively impacted by the tariffs.'),
  impact: z.string().describe('Expected increase in revenue and growth rate of the companies purely due to the tariffs.'),
  reasoning: z.string().describe('Reasoning behind the expected increase in revenue and growth rate of the companies purely due to the tariffs.'),
});

const NegativeTariffImpactOnCompanyTypeSchema = z.object({
  companyType: z.string().describe('Type of the companies that will be positively impacted by the tariffs.'),
  impact: z.string().describe('Expected increase in revenue and growth rate of the companies purely due to the tariffs.'),
  reasoning: z.string().describe('Reasoning behind the expected increase in revenue and growth rate of the companies purely due to the tariffs.'),
});

const EvaluateIndustryAreaSchema = z.object({
  title: z.string().describe('Title of the area which is being discussed. '),

  aboutParagraphs: z
    .string()
    .array()
    .describe(
      'Paragraphs of 3-5 lines each which explain in the industry area in detail. ' +
        'Be very specific. ' +
        'Include hyperlinks/citations in the content where ever possible. ' +
        'Every definition, and number should have a hyperlink. '
    ),
  newChallengers: z
    .array(NewChallengerSchema)
    .describe(
      '3 Top New challengers in the area of the industry.' +
        'Content about each company should be 500-800 words long.' +
        'Focus only on public US companies. ' +
        'Include hyperlinks/citations in the content where ever possible. ' +
        'Every definition, and number, company name etc should have a hyperlink. '
    ),
  establishedPlayers: z
    .array(EstablishedPlayerSchema)
    .describe(
      '3 Top Established in the area of the industry.' +
        'Content about each company should be 500-800 words long.' +
        'Focus only on public US companies. ' +
        'Include hyperlinks/citations in the content where ever possible. ' +
        'Every definition, and number, company name etc should have a hyperlink. '
    ),
  headwindsAndTailwinds: HeadwindsAndTailwindsSchema.describe(
    '4-5 Headwinds and Tailwinds faced by the area of the industry.' +
      'Focus only on public US companies. ' +
      'Include hyperlinks/citations in the content where ever possible. ' +
      'Every definition, and number, company name etc should have a hyperlink. '
  ),
  positiveTariffImpactOnCompanyType: z
    .array(PositiveTariffImpactOnCompanyTypeSchema)
    .describe(
      '3 Types of companies that will be positively impacted by the tariffs.' +
        'Include specific examples of companies and the type of products when sharing information of the company types that are impacted. ' +
        'Information about each company should be 400-600 words long.' +
        'Focus only on US companies'
    ),
  negativeTariffImpactOnCompanyType: z
    .array(NegativeTariffImpactOnCompanyTypeSchema)
    .describe(
      '3 Types of companies that will be negatively impacted by the tariffs. ' +
        'Include specific examples of companies and the type of products when sharing information of the company types that are impacted. ' +
        'Information about each company should be 400-600 words long. ' +
        'Focus only on public US companies. '
    ),
  tariffImpactSummary: z
    .string()
    .describe(
      'Summary of the impact of tariffs on the area of the industry. ' +
        'Include specific examples of companies and the type of products when creating the summary. ' +
        'Include hyperlinks/citations in the content where ever possible. ' +
        'Take example of companies and the type of products when creating the summary. ' +
        'Every definition, and number, company name etc should have a hyperlink. '
    ),
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
  I want to know about the new challengers and established players in the ${industry.title} industry.
  
  Couple of more lines about the ${industry.title} industry.
  - Summary: ${industry.oneLineSummary}
  - Few Companies involved: ${industry.companies.map((company) => company.name).join(', ')}
  
  Focus only on public US companies. 
  
  Total response will be 8000-10000 words long.
  
  For the provided industry area, please provide the following:
  - 3 new challengers which are public US companies which has IPO in the last 5-7 years and which are disrupting the 
  industry and challenging the established players. Only consider best of the best new players who have something unique 
  to offer.
  - Make sure to properly choose the new players and not just any random company if should best of the best.
  
  - 3 established players which are public US companies which are already in the industry for more than 5-7 years and 
  have been very stable, but can still scale. Only consider the top 4-5 player.
  
  The details for both the challenger and new player should include 
  - Name of the company
  - Description of the company
  - Website of the company
  - Ticker of the company
  - Products of the company and the revenue each product generates
  - About the management team of the company
  - Unique advantage of the company against the established players
  - Growth, Revenue, and Profitability, ROC of the company in the last five years. Make sure to include the numbers and facts
  - Growth, Revenue, and Profitability, ROC of the company expected in the next five years
  - Impact of the tariffs on the company
  - Competitors of the company and their scale
  
  
  - 3 Type of companies that will be positively impacted by the tariffs. Include specific examples of companies and the type of products when sharing information of the company types that are impacted. 
  - 3 Type of companies that will be negatively impacted by the tariffs. Include specific examples of companies and the type of products when sharing information of the company types that are impacted.
  
  Include hyperlinks/citations in the content where ever possible.
  Every definition, and number should have a hyperlink.
  
  The tariff summary should be 
  - At least 4-5 paragraphs long and should clearly explain which type of companies under
  this industry will be positively impacted by the tariffs and which type of companies under this industry will be negatively
  and why. 
  - Answer should be very specific and should include facts and reasoning. 
  - Take example of companies and the type  of products when creating the summary.
  - Dont be abstract and generic, use specific examples of companies and the type of products when creating the summary.
  - Dont say generic stuff like "local companies will be positively impacted by the tariffs" or "importers will be negatively impacted by the tariffs". Share concrete examples of companies and the type of products when creating the summary.
  - Answer in future tense.
  - Keep it specific to the impact on US companies.
  
  Dont use any Katex or Latex or italics formatting in the response.
  
  Here are more details about the areas of the industry that I want to know about:
  
  ${JSON.stringify(headings, null, 2)}
  
  
  # Tariff Updates
  ${JSON.stringify(tariffUpdates, null, 2)}
  
  `;

  return prompt;
}

/**
 * Converts a NewChallenger object to Markdown with a product table and all properties.
 */
function challengerToMarkdown(challenger: NewChallenger): string {
  const header =
    `### ${challenger.companyName} - (Ticker - ${challenger.companyTicker})\n` +
    `**Description:** ${challenger.companyDescription}\n\n` +
    `**Website:** ${challenger.companyWebsite}\n\n`;

  // Build products table
  const tableHeader = `| Product Name | Description | % of Revenue | Competitors |\n` + `| ------------ | ----------- | ------------ | ----------- |\n`;
  const tableRows = challenger.products
    .map((p) => `| ${p.productName} | ${p.productDescription} | ${p.percentageOfRevenue} | ${p.competitors.join(', ')} |`)
    .join('\n');

  const productsTable = tableHeader + tableRows + '\n\n';

  const pastPerformance =
    `  - **Revenue Growth:** ${challenger.pastPerformance.revenueGrowth}\n\n` +
    `  - **Cost of Revenue:** ${challenger.pastPerformance.costOfRevenue}\n\n` +
    `  - **Profitability Growth:** ${challenger.pastPerformance.profitabilityGrowth}\n\n` +
    `  - **ROC Growth:** ${challenger.pastPerformance.rocGrowth}\n\n`;

  const futureGrowth =
    `  - **Revenue Growth:** ${challenger.futureGrowth.revenueGrowth}\n\n` +
    `  - **Cost of Revenue:** ${challenger.futureGrowth.costOfRevenue}\n\n` +
    `  - **Profitability Growth:** ${challenger.futureGrowth.profitabilityGrowth}\n\n` +
    `  - **ROC Growth:** ${challenger.futureGrowth.rocGrowth}\n\n`;

  const footer =
    `**About Management:** ${challenger.aboutManagement}\n\n` +
    `**Unique Advantage:** ${challenger.uniqueAdvantage}\n\n` +
    `**Past Performance:**\n\n${pastPerformance}\n\n` +
    `**Future Growth:**\n\n${futureGrowth}\n\n` +
    `**Tariff Impact:** ${challenger.impactOfTariffs}\n\n` +
    `**Competitors:** ${challenger.competitors}`;

  return header + productsTable + footer;
}

/**
 * Converts an EstablishedPlayer object to Markdown with a product table and all properties.
 */
function establishedPlayerToMarkdown(player: EstablishedPlayer): string {
  const header =
    `### ${player.companyName} - (Ticker - ${player.companyTicker})\n` +
    `**Description:** ${player.companyDescription}\n\n` +
    `**Website:** ${player.companyWebsite}\n\n`;

  // Build products table
  const tableHeader = `| Product Name | Description | % of Revenue | Competitors |\n` + `| ------------ | ----------- | ------------ | ----------- |\n`;
  const tableRows = player.products
    .map((p) => `| ${p.productName} | ${p.productDescription} | ${p.percentageOfRevenue} | ${p.competitors.join(', ')} |`)
    .join('\n');

  const productsTable = tableHeader + tableRows + '\n\n';

  const pastPerformance =
    `  - **Revenue Growth:** ${player.pastPerformance.revenueGrowth}\n\n` +
    `  - **Cost of Revenue:** ${player.pastPerformance.costOfRevenue}\n\n` +
    `  - **Profitability Growth:** ${player.pastPerformance.profitabilityGrowth}\n\n` +
    `  - **ROC Growth:** ${player.pastPerformance.rocGrowth}\n\n`;

  const futureGrowth =
    `  - **Revenue Growth:** ${player.futureGrowth.revenueGrowth}\n\n` +
    `  - **Cost of Revenue:** ${player.futureGrowth.costOfRevenue}\n\n` +
    `  - **Profitability Growth:** ${player.futureGrowth.profitabilityGrowth}\n\n` +
    `  - **ROC Growth:** ${player.futureGrowth.rocGrowth}\n\n`;

  const footer =
    `**About Management:** ${player.aboutManagement}\n\n` +
    `**Unique Advantage:** ${player.uniqueAdvantage}\n\n` +
    `**Past Performance:**\n\n${pastPerformance}\n\n` +
    `**Future Growth:**\n\n${futureGrowth}\n\n` +
    `**Tariff Impact:** ${player.impactOfTariffs}\n\n` +
    `**Competitors:** ${player.competitors}`;

  return header + productsTable + footer;
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

  const markdownContent =
    `# ${industryArea.title}\n\n` +
    `${evaluateIndustryArea.aboutParagraphs.map((paragraph) => `${paragraph}`).join('\n\n')}\n` +
    `## New Challengers\n\n` +
    `${evaluateIndustryArea.newChallengers.map((challenger) => challengerToMarkdown(challenger)).join('\n\n')}\n` +
    `## Established Players\n\n` +
    `${evaluateIndustryArea.establishedPlayers.map((establishedPlayer) => establishedPlayerToMarkdown(establishedPlayer)).join('\n\n')}\n` +
    `## Headwinds\n\n` +
    `${evaluateIndustryArea.headwindsAndTailwinds.headwinds.map((headwind) => `${headwind}`).join('\n\n')}\n` +
    `## Tailwinds\n\n` +
    `${evaluateIndustryArea.headwindsAndTailwinds.tailwinds.map((tailwind) => `${tailwind}`).join('\n\n')}\n` +
    `## Company types that will be Positively Impacted by Tariffs\n\n` +
    `${evaluateIndustryArea.positiveTariffImpactOnCompanyType
      .map((impact) => `### ${impact.companyType}\n- **Impact**: ${impact.impact}\n- **Reason**: ${impact.reasoning}`)
      .join('\n\n')}\n` +
    `## Company types that will be Negatively Impacted by Tariffs\n\n` +
    `${evaluateIndustryArea.negativeTariffImpactOnCompanyType
      .map((impact) => `### ${impact.companyType}\n- **Impact**: ${impact.impact}\n- **Reason**: ${impact.reasoning}`)
      .join('\n\n')}\n` +
    `## Tariff Impact Summary\n\n` +
    `${evaluateIndustryArea.tariffImpactSummary}`;

  fs.writeFileSync(filePath, markdownContent, {
    encoding: 'utf-8',
  });
}
