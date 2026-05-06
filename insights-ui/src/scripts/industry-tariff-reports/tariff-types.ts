// 00-industry-main-headings.ts
interface PublicCompany {
  name: string;
  ticker: string;
}

export interface IndustrySubArea {
  title: string;
  oneLineSummary: string;
  companies: PublicCompany[];
}

export interface IndustryArea {
  title: string;
  oneLineSummary: string;
  subAreas: IndustrySubArea[];
}

export interface IndustryAreasWrapper {
  areas: IndustryArea[];
}

// 01-executive-summary.ts
export interface ExecutiveSummary {
  title: string;
  executiveSummary: string;
}

// 02-introduction.ts
export interface Introduction {
  aboutSector: { title: string; aboutSector: string };
  aboutConsumption: { title: string; aboutConsumption: string };
  pastGrowth: { title: string; aboutGrowth: string };
  futureGrowth: { title: string; aboutGrowth: string };
  usProduction: { title: string; aboutProduction: string };
  countrySpecificImports: Array<{ title: string; aboutImport: string }>;
}

// 03-industry-tariffs.ts
export interface CountrySpecificTariff {
  countryName: string;
  tariffDetails: string;
  existingTradeAmountAndAgreement: string;
  newChanges: string;
  tradeImpactedByNewTariff: string;
  tradeExemptedByNewTariff: string;
  tariffChangesForIndustrySubArea: string[];
}

export interface TariffUpdatesForIndustry {
  countryNames: string[];
  countrySpecificTariffs: CountrySpecificTariff[];
  lastUpdated?: string; // ISO date string when this data was generated
}

// 04-understand-industry.ts
export interface UnderstandIndustry {
  title: string;
  sections: {
    title: string;
    paragraphs: string[];
  }[];
}

// 05-industry-areas.ts
export interface IndustryAreaSection {
  title: string;
  industryAreas: string;
}

// 07-final-conclusion.ts

interface PositiveImpacts {
  title: string;
  positiveImpacts: string;
}

interface NegativeImpacts {
  title: string;
  negativeImpacts: string;
}

export interface FinalConclusion {
  title: string;
  conclusionBrief: string;
  positiveImpacts: PositiveImpacts;
  negativeImpacts: NegativeImpacts;
  finalStatements: string;
}

export interface ReportCover {
  title: string;
  reportCoverContent: string;
}

export interface PageSeoDetails {
  title: string;
  shortDescription: string;
  keywords: string[];
}

export interface TariffReportSeoDetails {
  reportCoverSeoDetails?: PageSeoDetails;
  executiveSummarySeoDetails?: PageSeoDetails;
  tariffUpdatesSeoDetails?: PageSeoDetails;
  understandIndustrySeoDetails?: PageSeoDetails;
  industryAreasSeoDetails?: PageSeoDetails;
  finalConclusionSeoDetails?: PageSeoDetails;
}

export interface IndustryTariffReport {
  industryHeadings?: IndustryAreasWrapper;
  reportCover?: ReportCover;
  executiveSummary?: ExecutiveSummary;
  tariffUpdates?: TariffUpdatesForIndustry;
  understandIndustry?: UnderstandIndustry;
  industryAreasSections?: IndustryAreaSection;
  finalConclusion?: FinalConclusion;
  reportSeoDetails?: TariffReportSeoDetails;
}

/**
 * Types of report sections supported by this script.
 */
export enum ReportType {
  HEADINGS = 'HEADINGS',
  UNDERSTAND_INDUSTRY = 'UNDERSTAND_INDUSTRY',
  TARIFF_UPDATES = 'TARIFF_UPDATES',
  INDUSTRY_AREA_SECTION = 'INDUSTRY_AREA_SECTION',
  EXECUTIVE_SUMMARY = 'EXECUTIVE_SUMMARY',
  REPORT_COVER = 'REPORT_COVER',
  FINAL_CONCLUSION = 'FINAL_CONCLUSION',
  ALL = 'ALL',
}
