import {
  CountrySpecificTariff,
  EstablishedPlayer,
  ExecutiveSummary,
  IndustryArea,
  IndustryAreasWrapper,
  Introduction,
  NewChallenger,
  TariffUpdatesForIndustry,
  UnderstandIndustry,
} from '@/scripts/industry-tariff-reports/tariff-types';
import { recursivelyCleanOpenAiUrls } from '@/scripts/llm-utils';

//--------------------------------------------------------------------------------------------------------
// 00-IndustryAreas
//--------------------------------------------------------------------------------------------------------
export function generateMarkdownContent(industryId: string, industryAreasWrapper: IndustryAreasWrapper): string {
  const contentForHeadings = (heading: IndustryArea) => {
    return (
      `## ${heading.title}\n${heading.oneLineSummary}\n\n` +
      `${heading.subAreas
        .map(
          (subHeading) =>
            `### ${subHeading.title}\n${subHeading.oneLineSummary}\n\n${subHeading.companies
              .map((company) => `${company.name} (${company.ticker})`)
              .join(', ')}`
        )
        .join('\n\n')}`
    );
  };

  return `# ${industryId} Areas\n\n` + industryAreasWrapper.areas.map((heading) => contentForHeadings(heading)).join('\n\n\n') + `\n\n\n`;
}

//--------------------------------------------------------------------------------------------------------
// 01-ExecutiveSummary
//--------------------------------------------------------------------------------------------------------

export function getMarkdownContentForExecutiveSummary(executiveSummary: ExecutiveSummary) {
  const markdownContent = `# Executive Summary\n\n` + `${executiveSummary.executiveSummary}\n`;
  return markdownContent;
}

//--------------------------------------------------------------------------------------------------------
// 02-Introduction
//--------------------------------------------------------------------------------------------------------

export function getMarkdownContentForIntroduction(introduction: Introduction) {
  const markdownContent =
    `# Introduction\n\n` +
    `## ${introduction.aboutSector.title}\n${introduction.aboutSector.aboutSector}\n\n` +
    `## ${introduction.aboutConsumption.title}\n${introduction.aboutConsumption.aboutConsumption}\n\n` +
    `## ${introduction.pastGrowth.title}\n${introduction.pastGrowth.aboutGrowth}\n\n` +
    `## ${introduction.futureGrowth.title}\n${introduction.futureGrowth.aboutGrowth}\n\n` +
    `## ${introduction.usProduction.title}\n${introduction.usProduction.aboutProduction}\n\n` +
    `## Country Specific Imports\n` +
    `${introduction.countrySpecificImports.map((importInfo) => `### ${importInfo.title}\n${importInfo.aboutImport}`).join('\n\n')}\n`;
  return markdownContent;
}

//--------------------------------------------------------------------------------------------------------
// 03-IndustryTariffs
//--------------------------------------------------------------------------------------------------------

export function getMarkdownContentForCountryTariffs(tariff: CountrySpecificTariff): string {
  const content =
    `${tariff.tariffDetails}\n\n` +
    `${tariff.existingTradeAmountAndAgreement}\n\n` +
    `${tariff.newChanges}\n\n` +
    `${tariff.tariffChangesForIndustrySubArea?.map((changes) => `- ${changes}`)?.join('\n\n')}\n\n` +
    `### Trade Impacted by New Tariff\n\n` +
    `${tariff.tradeImpactedByNewTariff}\n\n` +
    `### Trade Exempted by New Tariff\n\n` +
    `${tariff.tradeExemptedByNewTariff}\n`;
  return recursivelyCleanOpenAiUrls(content);
}

export function getMarkdownContentForIndustryTariffs(industry: string, tariffUpdates: TariffUpdatesForIndustry) {
  const markdownContent =
    `# Tariff Updates for ${industry}\n\n` +
    `${tariffUpdates.countrySpecificTariffs.map((country) => `##${country.countryName}\n\n${getMarkdownContentForCountryTariffs(country)}`).join('\n\n')}\n`;

  return markdownContent;
}

//--------------------------------------------------------------------------------------------------------
// 04-UnderstandIndustry
//--------------------------------------------------------------------------------------------------------

export function getMarkdownContentForUnderstandIndustry(understandIndustry: UnderstandIndustry) {
  const markdownContent =
    `# ${understandIndustry.title}\n\n` +
    `${understandIndustry.sections.map((section) => `## ${section.title}\n${section.paragraphs.join('\n\n')}`).join('\n\n')}\n`;
  return markdownContent;
}

//--------------------------------------------------------------------------------------------------------
// 05-IndustryAreas
//--------------------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------------------
// 00-IndustryAreas
//--------------------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------------------
// 00-IndustryAreas
//--------------------------------------------------------------------------------------------------------

/**
 * Converts a NewChallenger object to Markdown with organized sections and tables.
 */
export function challengerToMarkdown(challenger: NewChallenger): string {
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
export function establishedPlayerToMarkdown(player: EstablishedPlayer): string {
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
