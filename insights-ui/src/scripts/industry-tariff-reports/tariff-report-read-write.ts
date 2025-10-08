import {
  AllCountriesTariffUpdatesForIndustry,
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
import { getJsonFromS3, uploadFileToS3, uploadJsonTariffFileToS3 } from '@/scripts/report-file-utils';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { TariffIndustryId } from './tariff-industries';

//--------------------------------------------------------------------------------------------------------
// 00-ReportCover
//--------------------------------------------------------------------------------------------------------
export function getS3KeyForReportCover(industry: string, fileName: string): string {
  return `koalagains-reports/tariff-reports/${industry.toLowerCase()}/01-report-cover/${fileName}`;
}

export async function writeJsonFileForReportCover(industry: TariffIndustryId, reportCover: ReportCover) {
  const jsonKey = getS3KeyForReportCover(industry, 'report-cover.json');
  await uploadJsonTariffFileToS3(new TextEncoder().encode(JSON.stringify(reportCover, null, 2)), jsonKey, industry);
}

export async function readReportCoverFromFile(industry: string): Promise<ReportCover | undefined> {
  const key = getS3KeyForReportCover(industry, 'report-cover.json');
  return await getJsonFromS3<ReportCover>(key);
}

//--------------------------------------------------------------------------------------------------------
// 00-IndustryAreas
//--------------------------------------------------------------------------------------------------------

export const industryHeadingsFileName = 'industry-headings.json';

function getS3KeyForIndustryAreas(industry: string, fileName: string): string {
  return `koalagains-reports/tariff-reports/${industry.toLowerCase()}/${fileName}`;
}

async function writeJsonFileForIndustryAreas(industry: TariffIndustryId, headings: IndustryAreasWrapper) {
  const jsonKey = getS3KeyForIndustryAreas(industry, industryHeadingsFileName);
  await uploadJsonTariffFileToS3(new TextEncoder().encode(JSON.stringify(headings, null, 2)), jsonKey, industry);
}

export async function writeJsonForIndustryAreas(industry: TariffIndustryId, headings: IndustryAreasWrapper) {
  await writeJsonFileForIndustryAreas(industry, headings);
}

export async function readIndustryHeadingsFromFile(industry: string): Promise<IndustryAreasWrapper | undefined> {
  const key = getS3KeyForIndustryAreas(industry, industryHeadingsFileName);
  return await getJsonFromS3<IndustryAreasWrapper>(key);
}

//--------------------------------------------------------------------------------------------------------
// 01-ExecutiveSummary
//--------------------------------------------------------------------------------------------------------
export function getS3KeyForExecutiveSummary(industry: string, fileName: string): string {
  return `koalagains-reports/tariff-reports/${industry.toLowerCase()}/01-executive-summary/${fileName}`;
}

export async function writeJsonFileForExecutiveSummary(industry: TariffIndustryId, executiveSummary: ExecutiveSummary) {
  const jsonKey = getS3KeyForExecutiveSummary(industry, 'executive-summary.json');
  await uploadJsonTariffFileToS3(new TextEncoder().encode(JSON.stringify(executiveSummary, null, 2)), jsonKey, industry);
}

export async function readExecutiveSummaryFromFile(industry: string): Promise<ExecutiveSummary | undefined> {
  const key = getS3KeyForExecutiveSummary(industry, 'executive-summary.json');
  return await getJsonFromS3<ExecutiveSummary>(key);
}

//--------------------------------------------------------------------------------------------------------
// 03-IndustryTariffs
//--------------------------------------------------------------------------------------------------------

export function getS3KeyForIndustryTariffs(industry: string, fileName: string): string {
  return `koalagains-reports/tariff-reports/${industry.toLowerCase()}/03-tariff-updates/${fileName}`;
}

export async function writeJsonFileForIndustryTariffs(industry: TariffIndustryId, tariffUpdates: TariffUpdatesForIndustry) {
  const jsonKey = getS3KeyForIndustryTariffs(industry, 'tariff-updates.json');
  const jsonContent = JSON.stringify(tariffUpdates, null, 2);
  await uploadJsonTariffFileToS3(new TextEncoder().encode(jsonContent), jsonKey, industry);
}

export async function readTariffUpdatesFromFile(industry: string): Promise<TariffUpdatesForIndustry | undefined> {
  const key = getS3KeyForIndustryTariffs(industry, 'tariff-updates.json');
  return await getJsonFromS3<TariffUpdatesForIndustry>(key);
}

//--------------------------------------------------------------------------------------------------------
// 04-UnderstandIndustry
//--------------------------------------------------------------------------------------------------------
export function getS3KeyForUnderstandTariff(industry: string, fileName: string): string {
  return `koalagains-reports/tariff-reports/${industry.toLowerCase()}/04-understand-industry/${fileName}`;
}

export async function writeJsonFileForUnderstandIndustry(industry: TariffIndustryId, understandIndustry: UnderstandIndustry) {
  const jsonKey = getS3KeyForUnderstandTariff(industry, 'understand-industry.json');
  await uploadJsonTariffFileToS3(new TextEncoder().encode(JSON.stringify(understandIndustry, null, 2)), jsonKey, industry);
}

export async function readUnderstandIndustryJsonFromFile(industry: string): Promise<UnderstandIndustry | undefined> {
  const key = getS3KeyForUnderstandTariff(industry, 'understand-industry.json');
  return await getJsonFromS3<UnderstandIndustry>(key);
}

//--------------------------------------------------------------------------------------------------------
// 05-IndustryAreas
//--------------------------------------------------------------------------------------------------------
export function getS3KeyForIndustryAreasSections(industry: string, fileName: string): string {
  return `koalagains-reports/tariff-reports/${industry.toLowerCase()}/05-industry-areas/${fileName}`;
}

export async function writeJsonFileForIndustryAreaSections(industry: TariffIndustryId, industryAreaSection: IndustryAreaSection) {
  const jsonKey = getS3KeyForIndustryAreasSections(industry, 'industry-area.json');
  await uploadJsonTariffFileToS3(new TextEncoder().encode(JSON.stringify(industryAreaSection, null, 2)), jsonKey, industry);
}

export async function readIndustryAreaSectionFromFile(industry: string): Promise<IndustryAreaSection | undefined> {
  const key = getS3KeyForIndustryAreasSections(industry, 'industry-area.json');
  return await getJsonFromS3<IndustryAreaSection>(key);
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

export async function writeJsonFileForEvaluateSubIndustryArea(
  industry: TariffIndustryId,
  industryArea: IndustrySubArea,
  industryAreasWrapper: IndustryAreasWrapper,
  result: EvaluateIndustryArea
) {
  const jsonKey = getS3KeyForSubIndustryArea(industry, industryArea, industryAreasWrapper, '.json');
  await uploadJsonTariffFileToS3(new TextEncoder().encode(JSON.stringify(result, null, 2)), jsonKey, industry);
}

//--------------------------------------------------------------------------------------------------------
// 07-Final Conclusion
//--------------------------------------------------------------------------------------------------------

export function getS3KeyForFinalConclusion(industry: string, fileName: string): string {
  return `koalagains-reports/tariff-reports/${industry.toLowerCase()}/07-final-conclusion/${fileName}`;
}

export async function writeJsonFileForFinalConclusion(industry: TariffIndustryId, finalConclusion: FinalConclusion) {
  const jsonKey = getS3KeyForFinalConclusion(industry, 'final-conclusion.json');
  await uploadJsonTariffFileToS3(new TextEncoder().encode(JSON.stringify(finalConclusion, null, 2)), jsonKey, industry);
}

export async function readFinalConclusionFromFile(industry: string): Promise<FinalConclusion | undefined> {
  const key = getS3KeyForFinalConclusion(industry, 'final-conclusion.json');
  return await getJsonFromS3<FinalConclusion>(key);
}

//--------------------------------------------------------------------------------------------------------
// 08-SEO Details
//--------------------------------------------------------------------------------------------------------
export function getS3KeyForSeoDetails(industry: string, fileName: string): string {
  return `koalagains-reports/tariff-reports/${industry.toLowerCase()}/08-seo-details/${fileName}`;
}

export async function writeJsonFileForSeoDetails(industry: TariffIndustryId, seoDetails: TariffReportSeoDetails) {
  const jsonKey = getS3KeyForSeoDetails(industry, 'seo-details.json');
  await uploadJsonTariffFileToS3(new TextEncoder().encode(JSON.stringify(seoDetails, null, 2)), jsonKey, industry);
}

export async function readSeoDetailsFromFile(industry: string): Promise<TariffReportSeoDetails | undefined> {
  const key = getS3KeyForSeoDetails(industry, 'seo-details.json');
  return await getJsonFromS3<TariffReportSeoDetails>(key);
}

//--------------------------------------------------------------------------------------------------------
// 09-AllCountriesTariffUpdates
//--------------------------------------------------------------------------------------------------------

export function getS3KeyForAllCountriesTariffs(industry: string, fileName: string): string {
  return `koalagains-reports/tariff-reports/${industry.toLowerCase()}/09-all-countries-tariff-updates/${fileName}`;
}

export async function writeJsonFileForAllCountriesTariffUpdates(industry: TariffIndustryId, allCountriesTariffUpdates: AllCountriesTariffUpdatesForIndustry) {
  const jsonKey = getS3KeyForAllCountriesTariffs(industry, 'all-countries-tariff-updates.json');
  const jsonContent = JSON.stringify(allCountriesTariffUpdates, null, 2);
  await uploadJsonTariffFileToS3(new TextEncoder().encode(jsonContent), jsonKey, industry);
}

export async function readAllCountriesTariffUpdatesFromFile(industry: string): Promise<AllCountriesTariffUpdatesForIndustry | undefined> {
  const key = getS3KeyForAllCountriesTariffs(industry, 'all-countries-tariff-updates.json');
  return await getJsonFromS3<AllCountriesTariffUpdatesForIndustry>(key);
}

//--------------------------------------------------------------------------------------------------------
// Centralized Last Modified Dates
//--------------------------------------------------------------------------------------------------------

export function getS3KeyForLastModifiedDates(fileName: string): string {
  return `koalagains-reports/tariff-reports/${fileName}`;
}

export async function readLastModifiedDatesFromS3(): Promise<Record<string, string> | undefined> {
  const key = getS3KeyForLastModifiedDates('last-modified-dates.json');
  return await getJsonFromS3<Record<string, string>>(key);
}

export async function writeLastModifiedDatesToS3(lastModifiedDates: Record<string, string>) {
  const jsonKey = getS3KeyForLastModifiedDates('last-modified-dates.json');
  const jsonContent = JSON.stringify(lastModifiedDates, null, 2);
  await uploadFileToS3(new TextEncoder().encode(jsonContent), jsonKey, 'application/json');
}
