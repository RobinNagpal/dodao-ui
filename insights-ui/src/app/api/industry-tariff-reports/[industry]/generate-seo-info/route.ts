import {
  generateAndSaveAllSeoDetails,
  generateEvaluateIndustryAreasSeo,
  generateExecutiveSummarySeo,
  generateFinalConclusionSeo,
  generateIndustryAreasSeo,
  generateReportCoverSeo,
  generateTariffUpdatesSeo,
  generateUnderstandIndustrySeo,
} from '@/scripts/industry-tariff-reports/08-report-seo-info';
import { getIndustryTariffReport } from '@/scripts/industry-tariff-reports/industry-tariff-report-utils';
import { readSeoDetailsFromFile, writeJsonFileForSeoDetails } from '@/scripts/industry-tariff-reports/tariff-report-read-write';
import { IndustryTariffReport, PageSeoDetails, ReportType, TariffReportSeoDetails } from '@/scripts/industry-tariff-reports/tariff-types';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

// Valid sections are all enum values from ReportType
const VALID_SECTION_VALUES = Object.values(ReportType);

async function postHandler(req: NextRequest, { params }: { params: Promise<{ industry: string }> }): Promise<IndustryTariffReport> {
  const { industry } = await params;

  if (!industry) {
    throw new Error('Industry is required');
  }

  // Get the section parameter from the request
  const { searchParams } = new URL(req.url);
  const sectionParam = searchParams.get('section') || ReportType.ALL;

  // Validate that the section parameter is a valid ReportType
  if (!VALID_SECTION_VALUES.includes(sectionParam as ReportType)) {
    throw new Error(`Invalid section: ${sectionParam}. Valid sections are: ${VALID_SECTION_VALUES.join(', ')}`);
  }

  // Cast the validated section parameter to ReportType
  const section = sectionParam as ReportType;

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
      case ReportType.UNDERSTAND_INDUSTRY:
        seoDetails = await generateUnderstandIndustrySeo(industry);
        if (seoDetails) existingSeoDetails.understandIndustrySeoDetails = seoDetails;
        break;
      case ReportType.INDUSTRY_AREA_SECTION:
        seoDetails = await generateIndustryAreasSeo(industry);
        if (seoDetails) existingSeoDetails.industryAreasSeoDetails = seoDetails;
        break;
      case ReportType.EVALUATE_INDUSTRY_AREA:
        if (tariffReport.evaluateIndustryAreas && tariffReport.evaluateIndustryAreas.length > 0) {
          seoDetails = await generateEvaluateIndustryAreasSeo(industry, tariffReport.evaluateIndustryAreas);
          if (seoDetails) existingSeoDetails.evaluateIndustryAreasSeoDetails = seoDetails as PageSeoDetails[];
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
