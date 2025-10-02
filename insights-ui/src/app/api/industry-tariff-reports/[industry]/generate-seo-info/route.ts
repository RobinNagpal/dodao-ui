import {
  generateAllCountriesTariffUpdatesSeo,
  generateAndSaveAllSeoDetails,
  generateEvaluateIndustryAreasSeo,
  generateExecutiveSummarySeo,
  generateFinalConclusionSeo,
  generateIndustryAreasSeo,
  generateReportCoverSeo,
  generateSingleEvaluateIndustryAreaSeo,
  generateTariffUpdatesSeo,
  generateUnderstandIndustrySeo,
} from '@/scripts/industry-tariff-reports/08-report-seo-info';
import { getIndustryTariffReport } from '@/scripts/industry-tariff-reports/industry-tariff-report-utils';
import { TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';
import { readIndustryHeadingsFromFile, readSeoDetailsFromFile, writeJsonFileForSeoDetails } from '@/scripts/industry-tariff-reports/tariff-report-read-write';
import { IndustryTariffReport, PageSeoDetails, ReportType, TariffReportSeoDetails } from '@/scripts/industry-tariff-reports/tariff-types';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

// Valid sections are all enum values from ReportType
const VALID_SECTION_VALUES = Object.values(ReportType);

async function postHandler(req: NextRequest, { params }: { params: Promise<{ industry: TariffIndustryId }> }): Promise<IndustryTariffReport> {
  const { industry } = await params;

  if (!industry) {
    throw new Error('Industry is required');
  }

  // Get the parameters from the request body
  const requestBody = await req.json();
  const sectionParam = requestBody.section || ReportType.ALL;

  // Get heading and subheading indices if provided
  const headingIndexParam = requestBody.headingIndex;
  const subHeadingIndexParam = requestBody.subHeadingIndex;

  const headingIndex = headingIndexParam !== undefined ? parseInt(headingIndexParam.toString(), 10) : undefined;
  const subHeadingIndex = subHeadingIndexParam !== undefined ? parseInt(subHeadingIndexParam.toString(), 10) : undefined;

  // Validate that the section parameter is a valid ReportType
  if (!VALID_SECTION_VALUES.includes(sectionParam as ReportType)) {
    throw new Error(`Invalid section: ${sectionParam}. Valid sections are: ${VALID_SECTION_VALUES.join(', ')}`);
  }

  // Cast the validated section parameter to ReportType
  const section = sectionParam as ReportType;

  // Validate heading and subheading indices if section is EVALUATE_INDUSTRY_AREA and indices are provided
  if (
    section === ReportType.EVALUATE_INDUSTRY_AREA &&
    ((headingIndex !== undefined && subHeadingIndex === undefined) || (headingIndex === undefined && subHeadingIndex !== undefined))
  ) {
    throw new Error('Both headingIndex and subHeadingIndex must be provided together for evaluating a specific industry area');
  }

  // If heading/subheading indices are provided, validate they exist
  if (headingIndex !== undefined && subHeadingIndex !== undefined) {
    const headings = await readIndustryHeadingsFromFile(industry);
    if (!headings) {
      throw new Error(`Headings not found for industry: ${industry}`);
    }

    if (!headings.areas[headingIndex]) {
      throw new Error(`Heading with index ${headingIndex} not found`);
    }

    if (!headings.areas[headingIndex].subAreas[subHeadingIndex]) {
      throw new Error(`SubHeading with index ${subHeadingIndex} not found for heading ${headingIndex}`);
    }
  }

  const tariffReport = await getIndustryTariffReport(industry);

  // Load existing SEO details if available
  let existingSeoDetails: TariffReportSeoDetails = (await readSeoDetailsFromFile(industry)) || {};

  console.log(`Generating SEO info for ${section === ReportType.ALL ? 'all sections' : section}...`);

  // Generate SEO details based on the requested section
  if (section === ReportType.ALL) {
    // Generate SEO details for all sections
    existingSeoDetails = await generateAndSaveAllSeoDetails(industry, tariffReport);
  } else {
    // Generate SEO details for a specific section
    let seoDetails: PageSeoDetails | PageSeoDetails[] | undefined;

    switch (section) {
      case ReportType.REPORT_COVER:
        seoDetails = await generateReportCoverSeo(industry);
        if (seoDetails) existingSeoDetails.reportCoverSeoDetails = seoDetails;
        break;
      case ReportType.EXECUTIVE_SUMMARY:
        seoDetails = await generateExecutiveSummarySeo(industry);
        if (seoDetails) existingSeoDetails.executiveSummarySeoDetails = seoDetails;
        break;
      case ReportType.TARIFF_UPDATES:
        seoDetails = await generateTariffUpdatesSeo(industry);
        if (seoDetails) existingSeoDetails.tariffUpdatesSeoDetails = seoDetails;
        break;
      case ReportType.ALL_COUNTRIES_TARIFF_UPDATES:
        seoDetails = await generateAllCountriesTariffUpdatesSeo(industry);
        if (seoDetails) existingSeoDetails.allCountriesTariffUpdatesSeoDetails = seoDetails;
        break;
      case ReportType.UNDERSTAND_INDUSTRY:
        seoDetails = await generateUnderstandIndustrySeo(industry);
        if (seoDetails) existingSeoDetails.understandIndustrySeoDetails = seoDetails;
        break;
      case ReportType.INDUSTRY_AREA_SECTION:
        seoDetails = await generateIndustryAreasSeo(industry);
        if (seoDetails) existingSeoDetails.industryAreasSeoDetails = seoDetails;
        break;
      case ReportType.EVALUATE_INDUSTRY_AREA:
        if (headingIndex !== undefined && subHeadingIndex !== undefined) {
          // Generate SEO for a specific evaluate industry area
          console.log(`Generating SEO for specific evaluate industry area at heading ${headingIndex}, subHeading ${subHeadingIndex}`);
          const singleAreaSeoDetails = await generateSingleEvaluateIndustryAreaSeo(industry, headingIndex, subHeadingIndex);

          if (singleAreaSeoDetails) {
            // Initialize map if it doesn't exist
            if (!existingSeoDetails.evaluateIndustryAreasSeoDetails) {
              existingSeoDetails.evaluateIndustryAreasSeoDetails = {};
            }

            // Create the map key using headingIndex-subHeadingIndex format
            const key = `${headingIndex}-${subHeadingIndex}`;

            // Get the area name to add to logs
            const headings = await readIndustryHeadingsFromFile(industry);
            const areaName = headings?.areas[headingIndex]?.subAreas[subHeadingIndex] || '';
            console.log(`Generated SEO details for area: ${areaName} with key: ${key}`);

            // Store the SEO details using the key
            existingSeoDetails.evaluateIndustryAreasSeoDetails[key] = singleAreaSeoDetails;
          }
        } else if (tariffReport.evaluateIndustryAreas && tariffReport.evaluateIndustryAreas.length > 0) {
          // Generate SEO details for all evaluate industry areas
          const areaSeoDetails = await generateEvaluateIndustryAreasSeo(industry, tariffReport.evaluateIndustryAreas);
          if (areaSeoDetails) {
            // Initialize map if it doesn't exist
            if (!existingSeoDetails.evaluateIndustryAreasSeoDetails) {
              existingSeoDetails.evaluateIndustryAreasSeoDetails = {};
            }

            // Merge the generated SEO details with existing ones
            existingSeoDetails.evaluateIndustryAreasSeoDetails = {
              ...existingSeoDetails.evaluateIndustryAreasSeoDetails,
              ...areaSeoDetails,
            };
          }
        }
        break;
      case ReportType.FINAL_CONCLUSION:
        seoDetails = await generateFinalConclusionSeo(industry);
        if (seoDetails) existingSeoDetails.finalConclusionSeoDetails = seoDetails;
        break;
    }

    // Save the updated SEO details
    await writeJsonFileForSeoDetails(industry, existingSeoDetails);
  }

  // Get the updated tariff report with the new SEO details
  const updatedTariffReport = await getIndustryTariffReport(industry);
  updatedTariffReport.reportSeoDetails = existingSeoDetails;

  return updatedTariffReport;
}

export const POST = withErrorHandlingV2<IndustryTariffReport>(postHandler);
