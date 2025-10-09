import { getNumberOfSubHeadings, getTariffIndustryDefinitionById, TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';
import { getIndustryTariffReport } from '@/scripts/industry-tariff-reports/industry-tariff-report-utils';
import {
  readAllCountriesTariffUpdatesFromFile,
  readExecutiveSummaryFromFile,
  readFinalConclusionFromFile,
  readIndustryAreaSectionFromFile,
  readIndustryHeadingsFromFile,
  readReportCoverFromFile,
  readTariffUpdatesFromFile,
  readUnderstandIndustryJsonFromFile,
  writeJsonFileForSeoDetails,
} from '@/scripts/industry-tariff-reports/tariff-report-read-write';
import { EvaluateIndustryArea, IndustryTariffReport, PageSeoDetails, TariffReportSeoDetails } from '@/scripts/industry-tariff-reports/tariff-types';
import { z } from 'zod';
import { ReportType } from './tariff-types';
import { getLlmResponse } from '../llm‑utils‑gemini';
import { GeminiModelType } from '@/types/llmConstants';

const PageSeoDetailsSchema = z.object({
  title: z.string().describe('SEO title for the page (50-60 characters)'),
  shortDescription: z.string().describe('Short meta description for the page (150-160 characters)'),
  keywords: z.array(z.string()).describe('Array of relevant keywords for the page (5-10 keywords)'),
});

// Function to generate SEO details for a single section
async function generateSeoDetailsForSection(industry: TariffIndustryId, sectionName: string, sectionContent: any): Promise<PageSeoDetails> {
  const definition = getTariffIndustryDefinitionById(industry);
  const prompt = `
    Generate SEO metadata for the ${sectionName} section of the ${definition.name} industry tariff report. 
    The section content is provided below.
    
    Please create:
    1. A concise, descriptive SEO title (50-60 characters) that includes important keywords
    2. A compelling meta description (150-160 characters) that summarizes the section content
    3. 5-10 relevant keywords related to the section content
    
    The SEO metadata should be optimized for search engines while accurately reflecting the content.
    
    # Content:
    ${JSON.stringify(sectionContent, null, 2)}
  `;

  return await getLlmResponse<PageSeoDetails>(prompt, PageSeoDetailsSchema, GeminiModelType.GEMINI_2_5_PRO);
}

// Generate SEO details for report cover
export async function generateReportCoverSeo(industry: TariffIndustryId): Promise<PageSeoDetails | undefined> {
  const reportCover = await readReportCoverFromFile(industry);
  if (!reportCover) return undefined;

  return await generateSeoDetailsForSection(industry, ReportType.REPORT_COVER, reportCover);
}

// Generate SEO details for executive summary
export async function generateExecutiveSummarySeo(industry: TariffIndustryId): Promise<PageSeoDetails | undefined> {
  const executiveSummary = await readExecutiveSummaryFromFile(industry);
  if (!executiveSummary) return undefined;

  return await generateSeoDetailsForSection(industry, ReportType.EXECUTIVE_SUMMARY, executiveSummary);
}

// Generate SEO details for tariff updates
export async function generateTariffUpdatesSeo(industry: TariffIndustryId): Promise<PageSeoDetails | undefined> {
  const tariffUpdates = await readTariffUpdatesFromFile(industry);
  if (!tariffUpdates) return undefined;

  return await generateSeoDetailsForSection(industry, ReportType.TARIFF_UPDATES, tariffUpdates);
}

// Generate SEO details for all countries tariff updates
export async function generateAllCountriesTariffUpdatesSeo(industry: TariffIndustryId): Promise<PageSeoDetails | undefined> {
  const allCountriesTariffUpdates = await readAllCountriesTariffUpdatesFromFile(industry);
  if (!allCountriesTariffUpdates) return undefined;

  return await generateSeoDetailsForSection(industry, ReportType.ALL_COUNTRIES_TARIFF_UPDATES, allCountriesTariffUpdates);
}

// Generate SEO details for understand industry
export async function generateUnderstandIndustrySeo(industry: TariffIndustryId): Promise<PageSeoDetails | undefined> {
  const understandIndustry = await readUnderstandIndustryJsonFromFile(industry);
  if (!understandIndustry) return undefined;

  return await generateSeoDetailsForSection(industry, ReportType.UNDERSTAND_INDUSTRY, understandIndustry);
}

// Generate SEO details for industry areas
export async function generateIndustryAreasSeo(industry: TariffIndustryId): Promise<PageSeoDetails | undefined> {
  const industryAreas = await readIndustryAreaSectionFromFile(industry);
  if (!industryAreas) return undefined;

  return await generateSeoDetailsForSection(industry, ReportType.INDUSTRY_AREA_SECTION, industryAreas);
}

// Generate SEO details for evaluate industry areas
export async function generateEvaluateIndustryAreasSeo(
  industry: TariffIndustryId,
  evaluateIndustryAreas: EvaluateIndustryArea[]
): Promise<Record<string, PageSeoDetails>> {
  const seoDetails: Record<string, PageSeoDetails> = {};

  // Get headings to map areas to their indices
  const headings = await readIndustryHeadingsFromFile(industry);
  if (!headings) {
    console.error(`Headings not found for industry: ${industry}`);
    return seoDetails;
  }

  // Create a map of area titles to their heading-subheading indices
  const areaToIndicesMap = new Map<string, string>();

  // Build the map by iterating through all headings and subheadings
  headings.areas.forEach((heading, headingIndex) => {
    heading.subAreas.forEach((subArea, subHeadingIndex) => {
      // Create the key in format headingIndex-subHeadingIndex
      const key = `${headingIndex}-${subHeadingIndex}`;
      areaToIndicesMap.set(subArea.title.toLowerCase(), key);
    });
  });

  // Calculate the number of subheadings per heading for array index calculation
  const numSubHeadings = getNumberOfSubHeadings(industry);

  // Process each area to generate SEO details
  for (let i = 0; i < evaluateIndustryAreas.length; i++) {
    const area = evaluateIndustryAreas[i];

    // Generate SEO details for this area
    const seoDetail = await generateSeoDetailsForSection(industry, `${ReportType.EVALUATE_INDUSTRY_AREA}: ${area.title}`, area);

    // Try to find the key by matching the area title
    let key = '';

    // First attempt: direct lookup by normalized title
    const normalizedTitle = area.title.toLowerCase();
    for (const [title, indexKey] of areaToIndicesMap.entries()) {
      if (normalizedTitle.includes(title) || title.includes(normalizedTitle)) {
        key = indexKey;
        break;
      }
    }

    // Second attempt: calculate the key from the array index
    if (!key && numSubHeadings > 0) {
      // Calculate the headingIndex and subHeadingIndex from the array index
      const headingIndex = Math.floor(i / numSubHeadings);
      const subHeadingIndex = i % numSubHeadings;
      key = `${headingIndex}-${subHeadingIndex}`;
    }

    // Store the SEO details with the key
    if (key) {
      seoDetails[key] = seoDetail;
      console.log(`Generated SEO details for ${area.title} with key: ${key}`);
    } else {
      // Fallback: use a title-based key if we can't find a proper key
      const fallbackKey = `title-${normalizedTitle.replace(/\s+/g, '-')}`;
      seoDetails[fallbackKey] = seoDetail;
      console.warn(`Could not find index for area: ${area.title}, using fallback key: ${fallbackKey}`);
    }
  }

  return seoDetails;
}

// Generate SEO details for a single evaluate industry area by index
export async function generateSingleEvaluateIndustryAreaSeo(
  industry: TariffIndustryId,
  headingIndex: number,
  subHeadingIndex: number
): Promise<PageSeoDetails | undefined> {
  // Get the report to access the evaluate industry area
  const report = await getIndustryTariffReport(industry);

  // Get the total number of subheadings per heading to calculate the index
  const numSubHeadings = getNumberOfSubHeadings(industry);

  // Calculate the index in the evaluateIndustryAreas array
  const indexInArray = headingIndex * numSubHeadings + subHeadingIndex;

  // Get the evaluate industry area from the report
  const evaluateIndustryArea = report.evaluateIndustryAreas?.[indexInArray];

  if (!evaluateIndustryArea) {
    console.error(`Evaluate industry area not found at index ${indexInArray} for industry: ${industry}`);
    console.error(`Heading index: ${headingIndex}, subheading index: ${subHeadingIndex}`);
    return undefined;
  }

  // Generate SEO details for the single area
  return await generateSeoDetailsForSection(industry, `${ReportType.EVALUATE_INDUSTRY_AREA}: ${evaluateIndustryArea.title}`, evaluateIndustryArea);
}

// Generate SEO details for final conclusion
export async function generateFinalConclusionSeo(industry: TariffIndustryId): Promise<PageSeoDetails | undefined> {
  const finalConclusion = await readFinalConclusionFromFile(industry);
  if (!finalConclusion) return undefined;

  return await generateSeoDetailsForSection(industry, ReportType.FINAL_CONCLUSION, finalConclusion);
}

// Generate SEO details for all sections and save them progressively
export async function generateAndSaveAllSeoDetails(industry: TariffIndustryId, tariffReport: IndustryTariffReport): Promise<TariffReportSeoDetails> {
  const seoDetails: TariffReportSeoDetails = {};

  // Generate and save SEO details for report cover
  if (tariffReport.reportCover) {
    console.log(`Generating SEO details for ${ReportType.REPORT_COVER}...`);
    seoDetails.reportCoverSeoDetails = await generateReportCoverSeo(industry);
    await savePartialSeoDetails(industry, seoDetails);
  }

  // Generate and save SEO details for executive summary
  if (tariffReport.executiveSummary) {
    console.log(`Generating SEO details for ${ReportType.EXECUTIVE_SUMMARY}...`);
    seoDetails.executiveSummarySeoDetails = await generateExecutiveSummarySeo(industry);
    await savePartialSeoDetails(industry, seoDetails);
  }

  // Generate and save SEO details for tariff updates
  if (tariffReport.tariffUpdates) {
    console.log(`Generating SEO details for ${ReportType.TARIFF_UPDATES}...`);
    seoDetails.tariffUpdatesSeoDetails = await generateTariffUpdatesSeo(industry);
    await savePartialSeoDetails(industry, seoDetails);
  }

  // Generate and save SEO details for all countries tariff updates
  if (tariffReport.allCountriesTariffUpdates) {
    console.log(`Generating SEO details for ${ReportType.ALL_COUNTRIES_TARIFF_UPDATES}...`);
    seoDetails.allCountriesTariffUpdatesSeoDetails = await generateAllCountriesTariffUpdatesSeo(industry);
    await savePartialSeoDetails(industry, seoDetails);
  }

  // Generate and save SEO details for understand industry
  if (tariffReport.understandIndustry) {
    console.log(`Generating SEO details for ${ReportType.UNDERSTAND_INDUSTRY}...`);
    seoDetails.understandIndustrySeoDetails = await generateUnderstandIndustrySeo(industry);
    await savePartialSeoDetails(industry, seoDetails);
  }

  // Generate and save SEO details for industry areas
  if (tariffReport.industryAreasSections) {
    console.log(`Generating SEO details for ${ReportType.INDUSTRY_AREA_SECTION}...`);
    seoDetails.industryAreasSeoDetails = await generateIndustryAreasSeo(industry);
    await savePartialSeoDetails(industry, seoDetails);
  }

  // Generate and save SEO details for evaluate industry areas
  if (tariffReport.evaluateIndustryAreas && tariffReport.evaluateIndustryAreas.length > 0) {
    console.log(`Generating SEO details for ${ReportType.EVALUATE_INDUSTRY_AREA}...`);
    seoDetails.evaluateIndustryAreasSeoDetails = await generateEvaluateIndustryAreasSeo(industry, tariffReport.evaluateIndustryAreas);
    await savePartialSeoDetails(industry, seoDetails);
  }

  // Generate and save SEO details for final conclusion
  if (tariffReport.finalConclusion) {
    console.log(`Generating SEO details for ${ReportType.FINAL_CONCLUSION}...`);
    seoDetails.finalConclusionSeoDetails = await generateFinalConclusionSeo(industry);
    await savePartialSeoDetails(industry, seoDetails);
  }

  return seoDetails;
}

// Helper function to save partial SEO details
async function savePartialSeoDetails(industry: TariffIndustryId, partialSeoDetails: TariffReportSeoDetails): Promise<void> {
  await writeJsonFileForSeoDetails(industry, partialSeoDetails);
}
