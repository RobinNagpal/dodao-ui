import {
  readExecutiveSummaryFromFile,
  readFinalConclusionFromFile,
  readIndustryAreaSectionFromFile,
  readIndustryHeadingsFromFile,
  readReportCoverFromFile,
  readTariffUpdatesFromFile,
  readUnderstandIndustryJsonFromFile,
  writeJsonFileForSeoDetails,
} from '@/scripts/industry-tariff-reports/tariff-report-read-write';
import {
  EvaluateIndustryArea,
  ExecutiveSummary,
  FinalConclusion,
  IndustryAreaSection,
  IndustryAreasWrapper,
  IndustryTariffReport,
  PageSeoDetails,
  ReportCover,
  TariffReportSeoDetails,
  TariffUpdatesForIndustry,
  UnderstandIndustry,
} from '@/scripts/industry-tariff-reports/tariff-types';
import { getLlmResponse, outputInstructions } from '@/scripts/llm-utils';
import { z } from 'zod';

const PageSeoDetailsSchema = z.object({
  title: z.string().describe('SEO title for the page (50-60 characters)'),
  shortDescription: z.string().describe('Short meta description for the page (150-160 characters)'),
  keywords: z.array(z.string()).describe('Array of relevant keywords for the page (5-10 keywords)'),
});

// Function to generate SEO details for a single section
async function generateSeoDetailsForSection(industry: string, sectionName: string, sectionContent: any): Promise<PageSeoDetails> {
  const prompt = `
    Generate SEO metadata for the ${sectionName} section of the ${industry} industry tariff report. 
    The section content is provided below.
    
    Please create:
    1. A concise, descriptive SEO title (50-60 characters) that includes important keywords
    2. A compelling meta description (150-160 characters) that summarizes the section content
    3. 5-10 relevant keywords related to the section content
    
    The SEO metadata should be optimized for search engines while accurately reflecting the content.
    
    # Content:
    ${JSON.stringify(sectionContent, null, 2)}
  `;

  return await getLlmResponse<PageSeoDetails>(prompt, PageSeoDetailsSchema);
}

// Generate SEO details for report cover
export async function generateReportCoverSeo(industry: string): Promise<PageSeoDetails | undefined> {
  const reportCover = await readReportCoverFromFile(industry);
  if (!reportCover) return undefined;

  return await generateSeoDetailsForSection(industry, 'Report Cover', reportCover);
}

// Generate SEO details for executive summary
export async function generateExecutiveSummarySeo(industry: string): Promise<PageSeoDetails | undefined> {
  const executiveSummary = await readExecutiveSummaryFromFile(industry);
  if (!executiveSummary) return undefined;

  return await generateSeoDetailsForSection(industry, 'Executive Summary', executiveSummary);
}

// Generate SEO details for tariff updates
export async function generateTariffUpdatesSeo(industry: string): Promise<PageSeoDetails | undefined> {
  const tariffUpdates = await readTariffUpdatesFromFile(industry);
  if (!tariffUpdates) return undefined;

  return await generateSeoDetailsForSection(industry, 'Tariff Updates', tariffUpdates);
}

// Generate SEO details for understand industry
export async function generateUnderstandIndustrySeo(industry: string): Promise<PageSeoDetails | undefined> {
  const understandIndustry = await readUnderstandIndustryJsonFromFile(industry);
  if (!understandIndustry) return undefined;

  return await generateSeoDetailsForSection(industry, 'Understand Industry', understandIndustry);
}

// Generate SEO details for industry areas
export async function generateIndustryAreasSeo(industry: string): Promise<PageSeoDetails | undefined> {
  const industryAreas = await readIndustryAreaSectionFromFile(industry);
  if (!industryAreas) return undefined;

  return await generateSeoDetailsForSection(industry, 'Industry Areas', industryAreas);
}

// Generate SEO details for evaluate industry areas
export async function generateEvaluateIndustryAreasSeo(industry: string, evaluateIndustryAreas: EvaluateIndustryArea[]): Promise<PageSeoDetails[]> {
  const seoDetails: PageSeoDetails[] = [];

  for (const area of evaluateIndustryAreas) {
    const seoDetail = await generateSeoDetailsForSection(industry, `Evaluate Industry Area: ${area.title}`, area);
    seoDetails.push(seoDetail);
  }

  return seoDetails;
}

// Generate SEO details for final conclusion
export async function generateFinalConclusionSeo(industry: string): Promise<PageSeoDetails | undefined> {
  const finalConclusion = await readFinalConclusionFromFile(industry);
  if (!finalConclusion) return undefined;

  return await generateSeoDetailsForSection(industry, 'Final Conclusion', finalConclusion);
}

// Generate SEO details for all sections and save them progressively
export async function generateAndSaveAllSeoDetails(industry: string, tariffReport: IndustryTariffReport): Promise<TariffReportSeoDetails> {
  const seoDetails: TariffReportSeoDetails = {};

  // Generate and save SEO details for report cover
  if (tariffReport.reportCover) {
    console.log('Generating SEO details for Report Cover...');
    seoDetails.reportCoverSeoDetails = await generateReportCoverSeo(industry);
    await savePartialSeoDetails(industry, seoDetails);
  }

  // Generate and save SEO details for executive summary
  if (tariffReport.executiveSummary) {
    console.log('Generating SEO details for Executive Summary...');
    seoDetails.executiveSummarySeoDetails = await generateExecutiveSummarySeo(industry);
    await savePartialSeoDetails(industry, seoDetails);
  }

  // Generate and save SEO details for tariff updates
  if (tariffReport.tariffUpdates) {
    console.log('Generating SEO details for Tariff Updates...');
    seoDetails.tariffUpdatesSeoDetails = await generateTariffUpdatesSeo(industry);
    await savePartialSeoDetails(industry, seoDetails);
  }

  // Generate and save SEO details for understand industry
  if (tariffReport.understandIndustry) {
    console.log('Generating SEO details for Understand Industry...');
    seoDetails.understandIndustrySeoDetails = await generateUnderstandIndustrySeo(industry);
    await savePartialSeoDetails(industry, seoDetails);
  }

  // Generate and save SEO details for industry areas
  if (tariffReport.industryAreasSections) {
    console.log('Generating SEO details for Industry Areas...');
    seoDetails.industryAreasSeoDetails = await generateIndustryAreasSeo(industry);
    await savePartialSeoDetails(industry, seoDetails);
  }

  // Generate and save SEO details for evaluate industry areas
  if (tariffReport.evaluateIndustryAreas && tariffReport.evaluateIndustryAreas.length > 0) {
    console.log('Generating SEO details for Evaluate Industry Areas...');
    seoDetails.evaluateIndustryAreasSeoDetails = await generateEvaluateIndustryAreasSeo(industry, tariffReport.evaluateIndustryAreas);
    await savePartialSeoDetails(industry, seoDetails);
  }

  // Generate and save SEO details for final conclusion
  if (tariffReport.finalConclusion) {
    console.log('Generating SEO details for Final Conclusion...');
    seoDetails.finalConclusionSeoDetails = await generateFinalConclusionSeo(industry);
    await savePartialSeoDetails(industry, seoDetails);
  }

  return seoDetails;
}

// Helper function to save partial SEO details
async function savePartialSeoDetails(industry: string, partialSeoDetails: TariffReportSeoDetails): Promise<void> {
  await writeJsonFileForSeoDetails(industry, partialSeoDetails);
}
