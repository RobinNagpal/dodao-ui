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
import { IndustryTariffReport, PageSeoDetails, TariffReportSeoDetails } from '@/scripts/industry-tariff-reports/tariff-types';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

const VALID_SECTIONS = [
  'all',
  'reportCover',
  'executiveSummary',
  'tariffUpdates',
  'understandIndustry',
  'industryAreas',
  'evaluateIndustryAreas',
  'finalConclusion',
];

async function postHandler(req: NextRequest, { params }: { params: Promise<{ industry: string }> }): Promise<IndustryTariffReport> {
  const { industry } = await params;

  if (!industry) {
    throw new Error('Industry is required');
  }

  // Get the section parameter from the request
  const { searchParams } = new URL(req.url);
  const section = searchParams.get('section') || 'all';

  if (!VALID_SECTIONS.includes(section)) {
    throw new Error(`Invalid section: ${section}. Valid sections are: ${VALID_SECTIONS.join(', ')}`);
  }

  const tariffReport = await getIndustryTariffReport(industry);

  // Load existing SEO details if available
  let existingSeoDetails: TariffReportSeoDetails = (await readSeoDetailsFromFile(industry)) || {};

  console.log(`Generating SEO info for ${section === 'all' ? 'all sections' : section}...`);

  // Generate SEO details based on the requested section
  if (section === 'all') {
    // Generate SEO details for all sections
    existingSeoDetails = await generateAndSaveAllSeoDetails(industry, tariffReport);
  } else {
    // Generate SEO details for a specific section
    let seoDetails: PageSeoDetails | PageSeoDetails[] | undefined;

    switch (section) {
      case 'reportCover':
        seoDetails = await generateReportCoverSeo(industry);
        if (seoDetails) existingSeoDetails.reportCoverSeoDetails = seoDetails;
        break;
      case 'executiveSummary':
        seoDetails = await generateExecutiveSummarySeo(industry);
        if (seoDetails) existingSeoDetails.executiveSummarySeoDetails = seoDetails;
        break;
      case 'tariffUpdates':
        seoDetails = await generateTariffUpdatesSeo(industry);
        if (seoDetails) existingSeoDetails.tariffUpdatesSeoDetails = seoDetails;
        break;
      case 'understandIndustry':
        seoDetails = await generateUnderstandIndustrySeo(industry);
        if (seoDetails) existingSeoDetails.understandIndustrySeoDetails = seoDetails;
        break;
      case 'industryAreas':
        seoDetails = await generateIndustryAreasSeo(industry);
        if (seoDetails) existingSeoDetails.industryAreasSeoDetails = seoDetails;
        break;
      case 'evaluateIndustryAreas':
        if (tariffReport.evaluateIndustryAreas && tariffReport.evaluateIndustryAreas.length > 0) {
          seoDetails = await generateEvaluateIndustryAreasSeo(industry, tariffReport.evaluateIndustryAreas);
          if (seoDetails) existingSeoDetails.evaluateIndustryAreasSeoDetails = seoDetails as PageSeoDetails[];
        }
        break;
      case 'finalConclusion':
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
