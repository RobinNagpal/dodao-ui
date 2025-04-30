import { EstablishedPlayer, IndustryArea, IndustryAreasWrapper, NewChallenger } from '@/scripts/industry-tariff-reports/tariff-types';

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
