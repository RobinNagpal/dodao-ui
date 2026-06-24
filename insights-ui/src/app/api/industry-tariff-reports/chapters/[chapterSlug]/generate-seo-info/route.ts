import { chapterGenerateRoute, ChapterGenerateResponse } from '@/app/api/industry-tariff-reports/chapters/[chapterSlug]/chapter-generate-handler';
import {
  generateAndSaveAllSeoDetails,
  generateExecutiveSummarySeo,
  generateFinalConclusionSeo,
  generateIndustryAreasSeo,
  generateReportCoverSeo,
  generateTariffEngineeringSeo,
  generateTariffUpdatesSeo,
  generateUnderstandIndustrySeo,
} from '@/scripts/industry-tariff-reports/08-report-seo-info';
import { readSeoDetails, writeSeoDetails } from '@/scripts/industry-tariff-reports/tariff-report-repository';
import { PageSeoDetails, ReportType, TariffReportSeoDetails } from '@/scripts/industry-tariff-reports/tariff-types';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

const VALID_SECTION_VALUES = Object.values(ReportType);

async function regenerateOneSection(slug: string, section: ReportType, existing: TariffReportSeoDetails): Promise<void> {
  let seo: PageSeoDetails | undefined;
  switch (section) {
    case ReportType.REPORT_COVER:
      seo = await generateReportCoverSeo(slug);
      if (seo) existing.reportCoverSeoDetails = seo;
      break;
    case ReportType.EXECUTIVE_SUMMARY:
      seo = await generateExecutiveSummarySeo(slug);
      if (seo) existing.executiveSummarySeoDetails = seo;
      break;
    case ReportType.TARIFF_UPDATES:
      seo = await generateTariffUpdatesSeo(slug);
      if (seo) existing.tariffUpdatesSeoDetails = seo;
      break;
    case ReportType.UNDERSTAND_INDUSTRY:
      seo = await generateUnderstandIndustrySeo(slug);
      if (seo) existing.understandIndustrySeoDetails = seo;
      break;
    case ReportType.INDUSTRY_AREA_SECTION:
      seo = await generateIndustryAreasSeo(slug);
      if (seo) existing.industryAreasSeoDetails = seo;
      break;
    case ReportType.FINAL_CONCLUSION:
      seo = await generateFinalConclusionSeo(slug);
      if (seo) existing.finalConclusionSeoDetails = seo;
      break;
    case ReportType.TARIFF_ENGINEERING:
      seo = await generateTariffEngineeringSeo(slug);
      if (seo) existing.tariffEngineeringSeoDetails = seo;
      break;
  }
  await writeSeoDetails(slug, existing);
}

export const POST = withErrorHandlingV2<ChapterGenerateResponse>(
  chapterGenerateRoute('seoDetails', async (slug, body) => {
    const sectionParam = ((body as { section?: string } | null)?.section as ReportType | undefined) ?? ReportType.ALL;
    if (!VALID_SECTION_VALUES.includes(sectionParam)) {
      throw new Error(`Invalid section: ${sectionParam}. Valid sections are: ${VALID_SECTION_VALUES.join(', ')}`);
    }

    if (sectionParam === ReportType.ALL) {
      await generateAndSaveAllSeoDetails(slug);
      return;
    }

    const existing: TariffReportSeoDetails = (await readSeoDetails(slug)) ?? {};
    await regenerateOneSection(slug, sectionParam, existing);
  })
);
