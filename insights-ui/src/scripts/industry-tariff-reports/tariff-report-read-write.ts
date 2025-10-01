import {
  generateMarkdownContent,
  getMarkdownContentForEvaluateIndustryArea,
  getMarkdownContentForExecutiveSummary,
  getMarkdownContentForFinalConclusion,
  getMarkdownContentForIndustryAreas,
  getMarkdownContentForIndustryTariffs,
  getMarkdownContentForReportCover,
  getMarkdownContentForUnderstandIndustry,
} from '@/scripts/industry-tariff-reports/render-tariff-markdown';
import {
  EvaluateIndustryArea,
  ExecutiveSummary,
  FinalConclusion,
  IndustryAreaSection,
  IndustryAreasWrapper,
  IndustrySubArea,
  ReportCover,
  TariffReportSeoDetails,
  TariffUpdatesForIndustry,
  UnderstandIndustry,
} from '@/scripts/industry-tariff-reports/tariff-types';
import { getJsonFromS3, uploadFileToS3 } from '@/scripts/report-file-utils';
import { slugify } from '@dodao/web-core/utils/auth/slugify';

//--------------------------------------------------------------------------------------------------------
// 00-ReportCover
//--------------------------------------------------------------------------------------------------------
export function getS3KeyForReportCover(industry: string, fileName: string): string {
  return `koalagains-reports/tariff-reports/${industry.toLowerCase()}/01-report-cover/${fileName}`;
}

export async function writeJsonFileForReportCover(industry: string, reportCover: ReportCover) {
  const jsonKey = getS3KeyForReportCover(industry, 'report-cover.json');
  await uploadFileToS3(new TextEncoder().encode(JSON.stringify(reportCover, null, 2)), jsonKey, 'application/json');
}

export async function writeJsonAndMarkdownFilesForReportCover(industry: string, reportCover: ReportCover) {
  await writeJsonFileForReportCover(industry, reportCover);
  await writeMarkdownFileForReportCover(industry, reportCover);
}

export async function readReportCoverFromFile(industry: string): Promise<ReportCover | undefined> {
  const key = getS3KeyForReportCover(industry, 'report-cover.json');
  return await getJsonFromS3<ReportCover>(key);
}

export async function writeMarkdownFileForReportCover(industry: string, reportCover: ReportCover) {
  const markdownContent = getMarkdownContentForReportCover(reportCover);
  const key = getS3KeyForReportCover(industry, 'report-cover.md');
  await uploadFileToS3(new TextEncoder().encode(markdownContent), key, 'text/markdown');
}

//--------------------------------------------------------------------------------------------------------
// 00-IndustryAreas
//--------------------------------------------------------------------------------------------------------

export const industryHeadingsFileName = 'industry-headings.json';

function getS3KeyForIndustryAreas(industry: string, fileName: string): string {
  return `koalagains-reports/tariff-reports/${industry.toLowerCase()}/${fileName}`;
}

async function writeJsonFileForIndustryAreas(industry: string, headings: IndustryAreasWrapper) {
  const jsonKey = getS3KeyForIndustryAreas(industry, industryHeadingsFileName);
  await uploadFileToS3(new TextEncoder().encode(JSON.stringify(headings, null, 2)), jsonKey, 'application/json');
}

export async function writeJsonAndMarkdownFilesForIndustryAreas(industry: string, headings: IndustryAreasWrapper) {
  await writeJsonFileForIndustryAreas(industry, headings);
  await writeMarkdownFileForIndustryAreas(industry, headings);
}

export async function readIndustryHeadingsFromFile(industry: string): Promise<IndustryAreasWrapper | undefined> {
  const key = getS3KeyForIndustryAreas(industry, industryHeadingsFileName);
  return await getJsonFromS3<IndustryAreasWrapper>(key);
}

export async function writeMarkdownFileForIndustryAreas(industry: string, headings: IndustryAreasWrapper) {
  const markdownContent = generateMarkdownContent(industry, headings);
  const key = getS3KeyForIndustryAreas(industry, industryHeadingsFileName.replace('.json', '.md'));
  await uploadFileToS3(new TextEncoder().encode(markdownContent), key, 'text/markdown');
}

//--------------------------------------------------------------------------------------------------------
// 01-ExecutiveSummary
//--------------------------------------------------------------------------------------------------------
export function getS3KeyForExecutiveSummary(industry: string, fileName: string): string {
  return `koalagains-reports/tariff-reports/${industry.toLowerCase()}/01-executive-summary/${fileName}`;
}

async function writeJsonFileForExecutiveSummary(industry: string, executiveSummary: ExecutiveSummary) {
  const jsonKey = getS3KeyForExecutiveSummary(industry, 'executive-summary.json');
  await uploadFileToS3(new TextEncoder().encode(JSON.stringify(executiveSummary, null, 2)), jsonKey, 'application/json');
}

export async function writeJsonAndMarkdownFilesForExecutiveSummary(industryId: string, executiveSummary: ExecutiveSummary) {
  await writeJsonFileForExecutiveSummary(industryId, executiveSummary);
  await writeMarkdownFileForExecutiveSummary(industryId, executiveSummary);
}

export async function readExecutiveSummaryFromFile(industry: string): Promise<ExecutiveSummary | undefined> {
  const key = getS3KeyForExecutiveSummary(industry, 'executive-summary.json');
  return await getJsonFromS3<ExecutiveSummary>(key);
}

export async function writeMarkdownFileForExecutiveSummary(industry: string, executiveSummary: ExecutiveSummary) {
  const markdownContent = getMarkdownContentForExecutiveSummary(executiveSummary);
  const key = getS3KeyForExecutiveSummary(industry, 'executive-summary.md');
  await uploadFileToS3(new TextEncoder().encode(markdownContent), key, 'text/markdown');
}

//--------------------------------------------------------------------------------------------------------
// 03-IndustryTariffs
//--------------------------------------------------------------------------------------------------------

export function getS3KeyForIndustryTariffs(industry: string, fileName: string): string {
  return `koalagains-reports/tariff-reports/${industry.toLowerCase()}/03-tariff-updates/${fileName}`;
}

export async function writeJsonFileForIndustryTariffs(industry: string, tariffUpdates: TariffUpdatesForIndustry) {
  const jsonKey = getS3KeyForIndustryTariffs(industry, 'tariff-updates.json');
  const jsonContent = JSON.stringify(tariffUpdates, null, 2);
  await uploadFileToS3(new TextEncoder().encode(jsonContent), jsonKey, 'application/json');
}

export async function readTariffUpdatesFromFile(industry: string): Promise<TariffUpdatesForIndustry | undefined> {
  const key = getS3KeyForIndustryTariffs(industry, 'tariff-updates.json');
  return await getJsonFromS3<TariffUpdatesForIndustry>(key);
}

export async function writeMarkdownFileForIndustryTariffs(industry: string, tariffUpdates: TariffUpdatesForIndustry) {
  const markdownContent = getMarkdownContentForIndustryTariffs(industry, tariffUpdates);
  const key = getS3KeyForIndustryTariffs(industry, 'tariff-updates.md');
  await uploadFileToS3(new TextEncoder().encode(markdownContent), key, 'text/markdown');
}

//--------------------------------------------------------------------------------------------------------
// 04-UnderstandIndustry
//--------------------------------------------------------------------------------------------------------
export function getS3KeyForUnderstandTariff(industry: string, fileName: string): string {
  return `koalagains-reports/tariff-reports/${industry.toLowerCase()}/04-understand-industry/${fileName}`;
}

export async function writeJsonFileForUnderstandIndustry(industry: string, understandIndustry: UnderstandIndustry) {
  const jsonKey = getS3KeyForUnderstandTariff(industry, 'understand-industry.json');
  await uploadFileToS3(new TextEncoder().encode(JSON.stringify(understandIndustry, null, 2)), jsonKey, 'application/json');
}

export async function readUnderstandIndustryJsonFromFile(industry: string): Promise<UnderstandIndustry | undefined> {
  const key = getS3KeyForUnderstandTariff(industry, 'understand-industry.json');
  return await getJsonFromS3<UnderstandIndustry>(key);
}

export async function writeMarkdownFileForUnderstandIndustry(industry: string, understandIndustry: UnderstandIndustry) {
  const markdownContent = getMarkdownContentForUnderstandIndustry(understandIndustry);
  const key = getS3KeyForUnderstandTariff(industry, 'understand-industry.md');
  await uploadFileToS3(new TextEncoder().encode(markdownContent), key, 'text/markdown');
}

//--------------------------------------------------------------------------------------------------------
// 05-IndustryAreas
//--------------------------------------------------------------------------------------------------------
export function getS3KeyForIndustryAreasSections(industry: string, fileName: string): string {
  return `koalagains-reports/tariff-reports/${industry.toLowerCase()}/05-industry-areas/${fileName}`;
}

export async function writeJsonFileForIndustryAreaSections(industry: string, industryAreaSection: IndustryAreaSection) {
  const jsonKey = getS3KeyForIndustryAreasSections(industry, 'industry-area.json');
  await uploadFileToS3(new TextEncoder().encode(JSON.stringify(industryAreaSection, null, 2)), jsonKey, 'application/json');
}

export async function readIndustryAreaSectionFromFile(industry: string): Promise<IndustryAreaSection | undefined> {
  const key = getS3KeyForIndustryAreasSections(industry, 'industry-area.json');
  return await getJsonFromS3<IndustryAreaSection>(key);
}

export async function writeMarkdownFileForIndustryAreaSections(industry: string, industryAreaSection: IndustryAreaSection): Promise<void> {
  const markdownContent = getMarkdownContentForIndustryAreas(industryAreaSection);
  const key = getS3KeyForIndustryAreasSections(industry, 'industry-area.md');
  await uploadFileToS3(new TextEncoder().encode(markdownContent), key, 'text/markdown');
}

//--------------------------------------------------------------------------------------------------------
// 06-EvaluateSubIndustryArea
//--------------------------------------------------------------------------------------------------------

export function getS3KeyForSubIndustryArea(industry: string, industryArea: IndustrySubArea, headings: IndustryAreasWrapper, extension: string): string {
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

export async function readEvaluateSubIndustryAreaJsonFromFile(
  industry: string,
  industryArea: IndustrySubArea,
  headings: IndustryAreasWrapper
): Promise<EvaluateIndustryArea | undefined> {
  const key = getS3KeyForSubIndustryArea(industry, industryArea, headings, '.json');
  return await getJsonFromS3<EvaluateIndustryArea>(key);
}

export async function writeMarkdownFileForEvaluateSubIndustryArea(
  industry: string,
  industryArea: IndustrySubArea,
  headings: IndustryAreasWrapper,
  evaluateIndustryArea: EvaluateIndustryArea
) {
  const markdownContent = getMarkdownContentForEvaluateIndustryArea(evaluateIndustryArea);
  const key = getS3KeyForSubIndustryArea(industry, industryArea, headings, '.md');
  await uploadFileToS3(new TextEncoder().encode(markdownContent), key, 'text/markdown');
}

export async function writeJsonFileForEvaluateSubIndustryArea(
  industry: string,
  industryArea: IndustrySubArea,
  industryAreasWrapper: IndustryAreasWrapper,
  result: EvaluateIndustryArea
) {
  const jsonKey = getS3KeyForSubIndustryArea(industry, industryArea, industryAreasWrapper, '.json');
  await uploadFileToS3(new TextEncoder().encode(JSON.stringify(result, null, 2)), jsonKey, 'application/json');
}

//--------------------------------------------------------------------------------------------------------
// 07-Final Conclusion
//--------------------------------------------------------------------------------------------------------

export function getS3KeyForFinalConclusion(industry: string, fileName: string): string {
  return `koalagains-reports/tariff-reports/${industry.toLowerCase()}/07-final-conclusion/${fileName}`;
}

export async function writeJsonFileForFinalConclusion(industry: string, finalConclusion: FinalConclusion) {
  const jsonKey = getS3KeyForFinalConclusion(industry, 'final-conclusion.json');
  await uploadFileToS3(new TextEncoder().encode(JSON.stringify(finalConclusion, null, 2)), jsonKey, 'application/json');
}

export async function writeJsonAndMarkdownFilesForFinalConclusion(industry: string, finalConclusion: FinalConclusion) {
  await writeJsonFileForFinalConclusion(industry, finalConclusion);
  await writeMarkdownFileForFinalConclusion(industry, finalConclusion);
}

export async function readFinalConclusionFromFile(industry: string): Promise<FinalConclusion | undefined> {
  const key = getS3KeyForFinalConclusion(industry, 'final-conclusion.json');
  return await getJsonFromS3<FinalConclusion>(key);
}

export async function writeMarkdownFileForFinalConclusion(industry: string, finalConclusion: FinalConclusion) {
  const markdownContent = getMarkdownContentForFinalConclusion(finalConclusion);
  const key = getS3KeyForFinalConclusion(industry, 'final-conclusion.md');
  await uploadFileToS3(new TextEncoder().encode(markdownContent), key, 'text/markdown');
}

//--------------------------------------------------------------------------------------------------------
// 08-SEO Details
//--------------------------------------------------------------------------------------------------------
export function getS3KeyForSeoDetails(industry: string, fileName: string): string {
  return `koalagains-reports/tariff-reports/${industry.toLowerCase()}/08-seo-details/${fileName}`;
}

export async function writeJsonFileForSeoDetails(industry: string, seoDetails: TariffReportSeoDetails) {
  const jsonKey = getS3KeyForSeoDetails(industry, 'seo-details.json');
  await uploadFileToS3(new TextEncoder().encode(JSON.stringify(seoDetails, null, 2)), jsonKey, 'application/json');
}

export async function readSeoDetailsFromFile(industry: string): Promise<TariffReportSeoDetails | undefined> {
  const key = getS3KeyForSeoDetails(industry, 'seo-details.json');
  return await getJsonFromS3<TariffReportSeoDetails>(key);
}

//--------------------------------------------------------------------------------------------------------
// Centralized Last Modified Dates
//--------------------------------------------------------------------------------------------------------

export function getS3KeyForLastModifiedDates(fileName: string): string {
  return `koalagains-reports/tariff-reports/${fileName}`;
}

export async function readLastModifiedDatesFromFile(): Promise<Record<string, string> | undefined> {
  const key = getS3KeyForLastModifiedDates('last-modified-dates.json');
  return await getJsonFromS3<Record<string, string>>(key);
}

export async function writeLastModifiedDatesToFile(lastModifiedDates: Record<string, string>) {
  const jsonKey = getS3KeyForLastModifiedDates('last-modified-dates.json');
  const jsonContent = JSON.stringify(lastModifiedDates, null, 2);
  await uploadFileToS3(new TextEncoder().encode(jsonContent), jsonKey, 'application/json');
}
