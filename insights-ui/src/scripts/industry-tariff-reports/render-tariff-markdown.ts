import { AllCountriesTariffUpdatesForIndustry, EstablishedPlayer, IndustryAreaSection } from '@/scripts/industry-tariff-reports/tariff-types';

export function getMarkdownContentForAllCountriesIndustryTariffs(industry: string, allCountriesTariffUpdates: AllCountriesTariffUpdatesForIndustry) {
  const markdownContent = `# All Countries Tariff Updates for ${industry}\n\n` + `${allCountriesTariffUpdates.countrySpecificTariffs}`;

  return markdownContent;
}

export function getMarkdownContentForIndustryAreas(industryAreaSection: IndustryAreaSection) {
  const markdownContent = `# ${industryAreaSection.title}\n\n${industryAreaSection.industryAreas}`;
  return markdownContent;
}

/**
 * Converts an EstablishedPlayer object to Markdown with organized sections and tables.
 */
export function establishedPlayerToMarkdown(player: EstablishedPlayer): string {
  const header =
    `### ${player.companyName} (Ticker: ${player.companyTicker})\n\n` +
    `**Description:** ${player.companyDescription}\n\n` +
    `**Website:** [${player.companyWebsite}](${player.companyWebsite})\n\n` +
    `---\n\n`;

  const productsSection =
    `#### Products\n\n` +
    `| Name | Description | % of Revenue | Competitors |\n` +
    `| :--- | :---------- | :----------: | :---------- |\n` +
    player.products.map((p) => `| ${p.productName} | ${p.productDescription} | ${p.percentageOfRevenue} | ${p.competitors.join(', ')} |`).join('\n') +
    `\n\n---\n\n`;

  const past = player.pastPerformance;
  const future = player.futureGrowth;
  const performanceSection =
    `#### Performance\n\n` +
    `- **Past 5 Years:**\n` +
    `  - Revenue Growth: ${past.revenueGrowth}\n` +
    `  - Cost of Revenue: ${past.costOfRevenue}\n` +
    `  - Profitability Growth: ${past.profitabilityGrowth}\n` +
    `  - ROC Growth: ${past.rocGrowth}\n\n` +
    `- **Next 5 Years (Projected):**\n` +
    `  - Revenue Growth: ${future.revenueGrowth}\n` +
    `  - Cost of Revenue: ${future.costOfRevenue}\n` +
    `  - Profitability Growth: ${future.profitabilityGrowth}\n` +
    `  - ROC Growth: ${future.rocGrowth}\n\n` +
    `---\n\n`;

  const managementSection =
    `#### Management & Strategy\n\n` + `- About Management: ${player.aboutManagement}\n\n` + `- Unique Advantage: ${player.uniqueAdvantage}\n\n` + `---\n\n`;

  const footer = `#### Tariffs & Competitors\n\n` + `- Tariff Impact: ${player.impactOfTariffs}\n\n` + `- Competitors: ${player.competitors}\n\n`;

  const content = header + productsSection + performanceSection + managementSection + footer;
  return content;
}
