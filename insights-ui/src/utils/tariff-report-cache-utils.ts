import { revalidateTag } from 'next/cache';

/** Cache tag helpers for per-tariff-report revalidation */
const TARIFF_REPORT_TAG_PREFIX = 'tariff_report:' as const;

export const tariffReportTag = (industryId: string): `${typeof TARIFF_REPORT_TAG_PREFIX}${string}` =>
  `${TARIFF_REPORT_TAG_PREFIX}${industryId.toUpperCase()}`;

export const tariffReportSectionTag = (industryId: string, section: string): `${typeof TARIFF_REPORT_TAG_PREFIX}${string}` =>
  `${TARIFF_REPORT_TAG_PREFIX}${industryId.toUpperCase()}_${section.toUpperCase()}`;

// Main revalidation functions
export const revalidateTariffReport = (industryId: string) => revalidateTag(tariffReportTag(industryId));

export const revalidateTariffReportSection = (industryId: string, section: string) => 
  revalidateTag(tariffReportSectionTag(industryId, section));

// Section-specific revalidation helpers
export const revalidateReportCover = (industryId: string) => 
  revalidateTariffReportSection(industryId, 'report_cover');

export const revalidateExecutiveSummary = (industryId: string) => 
  revalidateTariffReportSection(industryId, 'executive_summary');

export const revalidateTariffUpdates = (industryId: string) => 
  revalidateTariffReportSection(industryId, 'tariff_updates');

export const revalidateAllCountriesTariffUpdates = (industryId: string) => 
  revalidateTariffReportSection(industryId, 'all_countries_tariff_updates');

export const revalidateUnderstandIndustry = (industryId: string) => 
  revalidateTariffReportSection(industryId, 'understand_industry');

export const revalidateIndustryAreas = (industryId: string) => 
  revalidateTariffReportSection(industryId, 'industry_areas');

export const revalidateEvaluateIndustryAreas = (industryId: string) => 
  revalidateTariffReportSection(industryId, 'evaluate_industry_areas');

export const revalidateFinalConclusion = (industryId: string) => 
  revalidateTariffReportSection(industryId, 'final_conclusion');

export const revalidateHeadings = (industryId: string) => 
  revalidateTariffReportSection(industryId, 'headings');

