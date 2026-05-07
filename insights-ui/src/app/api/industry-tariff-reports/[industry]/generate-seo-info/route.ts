import {
  generateAndSaveAllSeoDetails,
  generateExecutiveSummarySeo,
  generateFinalConclusionSeo,
  generateIndustryAreasSeo,
  generateReportCoverSeo,
  generateTariffUpdatesSeo,
  generateUnderstandIndustrySeo,
} from '@/scripts/industry-tariff-reports/08-report-seo-info';
import {
  findReportSlugByOldUrl,
  readIndustryTariffReportByOldUrl,
  readSeoDetails,
  writeSeoDetails,
} from '@/scripts/industry-tariff-reports/tariff-report-repository';
import { IndustryTariffReport, PageSeoDetails, ReportType, TariffReportSeoDetails } from '@/scripts/industry-tariff-reports/tariff-types';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

const VALID_SECTION_VALUES = Object.values(ReportType);

async function postHandler(req: NextRequest, { params }: { params: Promise<{ industry: string }> }): Promise<IndustryTariffReport> {
  const { industry } = await params;
  if (!industry) throw new Error('Industry is required');

  const requestBody = await req.json();
  const sectionParam = requestBody.section || ReportType.ALL;
  if (!VALID_SECTION_VALUES.includes(sectionParam as ReportType)) {
    throw new Error(`Invalid section: ${sectionParam}. Valid sections are: ${VALID_SECTION_VALUES.join(', ')}`);
  }
  const section = sectionParam as ReportType;

  const slug = await findReportSlugByOldUrl(industry);

  console.log(`Generating SEO info for ${section === ReportType.ALL ? 'all sections' : section}...`);

  if (section === ReportType.ALL) {
    await generateAndSaveAllSeoDetails(slug);
  } else {
    const existingSeoDetails: TariffReportSeoDetails = (await readSeoDetails(slug)) ?? {};
    let seoDetails: PageSeoDetails | undefined;

    switch (section) {
      case ReportType.REPORT_COVER:
        seoDetails = await generateReportCoverSeo(slug);
        if (seoDetails) existingSeoDetails.reportCoverSeoDetails = seoDetails;
        break;
      case ReportType.EXECUTIVE_SUMMARY:
        seoDetails = await generateExecutiveSummarySeo(slug);
        if (seoDetails) existingSeoDetails.executiveSummarySeoDetails = seoDetails;
        break;
      case ReportType.TARIFF_UPDATES:
        seoDetails = await generateTariffUpdatesSeo(slug);
        if (seoDetails) existingSeoDetails.tariffUpdatesSeoDetails = seoDetails;
        break;
      case ReportType.UNDERSTAND_INDUSTRY:
        seoDetails = await generateUnderstandIndustrySeo(slug);
        if (seoDetails) existingSeoDetails.understandIndustrySeoDetails = seoDetails;
        break;
      case ReportType.INDUSTRY_AREA_SECTION:
        seoDetails = await generateIndustryAreasSeo(slug);
        if (seoDetails) existingSeoDetails.industryAreasSeoDetails = seoDetails;
        break;
      case ReportType.FINAL_CONCLUSION:
        seoDetails = await generateFinalConclusionSeo(slug);
        if (seoDetails) existingSeoDetails.finalConclusionSeoDetails = seoDetails;
        break;
    }

    await writeSeoDetails(slug, existingSeoDetails);
  }

  return readIndustryTariffReportByOldUrl(industry);
}

export const POST = withErrorHandlingV2<IndustryTariffReport>(postHandler);
