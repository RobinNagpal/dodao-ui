import { img } from '@/scripts/chart-utils';
import {
  CountrySpecificTariff,
  EstablishedPlayer,
  EvaluateIndustryArea,
  ExecutiveSummary,
  FinalConclusion,
  IndustryArea,
  IndustryAreaSection,
  IndustryAreasWrapper,
  NewChallenger,
  ReportCover,
  TariffUpdatesForIndustry,
  UnderstandIndustry,
} from '@/scripts/industry-tariff-reports/tariff-types';
import { recursivelyCleanOpenAiUrls } from '@/scripts/llm-utils';

//--------------------------------------------------------------------------------------------------------
// 01-ReportCover
//--------------------------------------------------------------------------------------------------------
export function getMarkdownContentForReportCover(reportCover: ReportCover) {
  return recursivelyCleanOpenAiUrls(reportCover.reportCoverContent);
}

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

  const content = `# ${industryId} Areas\n\n` + industryAreasWrapper.areas.map((heading) => contentForHeadings(heading)).join('\n\n\n') + `\n\n\n`;
  return recursivelyCleanOpenAiUrls(content);
}

//--------------------------------------------------------------------------------------------------------
// 01-ExecutiveSummary
//--------------------------------------------------------------------------------------------------------

export function getMarkdownContentForExecutiveSummary(executiveSummary: ExecutiveSummary) {
  const markdownContent = `## ${executiveSummary.title}\n\n` + `${executiveSummary.executiveSummary}\n`;
  return recursivelyCleanOpenAiUrls(markdownContent);
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

  return recursivelyCleanOpenAiUrls(markdownContent);
}

//--------------------------------------------------------------------------------------------------------
// 04-UnderstandIndustry
//--------------------------------------------------------------------------------------------------------

export function getMarkdownContentForUnderstandIndustry(understandIndustry: UnderstandIndustry) {
  const markdownContent =
    `# ${understandIndustry.title}\n\n` +
    `${understandIndustry.sections.map((section) => `## ${section.title}\n${section.paragraphs.join('\n\n')}`).join('\n\n')}\n`;
  return recursivelyCleanOpenAiUrls(markdownContent);
}

//--------------------------------------------------------------------------------------------------------
// 05-IndustryAreas
//--------------------------------------------------------------------------------------------------------

export function getMarkdownContentForIndustryAreas(industryAreaSection: IndustryAreaSection) {
  const markdownContent = `# ${industryAreaSection.title}\n\n${industryAreaSection.industryAreas}`;
  return recursivelyCleanOpenAiUrls(markdownContent);
}

//--------------------------------------------------------------------------------------------------------
// 06-EvaluateIndustryArea
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

  const content = header + productsSection + performanceSection + managementSection + footer;
  return recursivelyCleanOpenAiUrls(content);
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
  return recursivelyCleanOpenAiUrls(markdownContent);
}

//--------------------------------------------------------------------------------------------------------
// 07-FinalConclusion
//--------------------------------------------------------------------------------------------------------
export function getMarkdownContentForFinalConclusion(finalConclusion: FinalConclusion) {
  const markdownContent =
    `# ${finalConclusion.title}\n` +
    `${finalConclusion.conclusionBrief}\n\n` +
    `## ${finalConclusion.positiveImpacts.title}\n` +
    `${finalConclusion.positiveImpacts.positiveImpacts}\n\n` +
    `## ${finalConclusion.negativeImpacts.title}\n` +
    `${finalConclusion.negativeImpacts.negativeImpacts}\n\n` +
    `## Final Statements\n` +
    `${finalConclusion.finalStatements}\n`;
  return recursivelyCleanOpenAiUrls(markdownContent);
}
