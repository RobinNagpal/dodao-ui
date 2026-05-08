// 00-industry-main-headings.ts
export interface IndustrySubArea {
  title: string;
  oneLineSummary: string;
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

// 06-tariff-engineering.ts
export interface TariffEngineeringClassificationLever {
  leverTitle: string;
  currentClassification: string;
  engineeredClassification: string;
  basisForReclassification: string;
  dutyDelta: string;
}

export interface TariffEngineeringStrategy {
  title: string;
  technique: string;
  applicabilityToChapter: string;
  potentialDutyImpact: string;
  implementationSteps: string[];
  risksAndCaveats: string;
  precedent: string;
}

export interface TariffEngineering {
  title: string;
  overview: string;
  classificationLevers: TariffEngineeringClassificationLever[];
  strategies: TariffEngineeringStrategy[];
  countryOfOriginPlaybook: string;
  valuationOpportunities: string;
  ftzAndDrawback: string;
  complianceGuardrails: string;
  bottomLine: string;
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
  tariffEngineeringSeoDetails?: PageSeoDetails;
}

export interface IndustryTariffReport {
  industryAreas?: IndustryAreasWrapper;
  reportCover?: ReportCover;
  executiveSummary?: ExecutiveSummary;
  tariffUpdates?: TariffUpdatesForIndustry;
  understandIndustry?: UnderstandIndustry;
  industryAreasSections?: IndustryAreaSection;
  finalConclusion?: FinalConclusion;
  tariffEngineering?: TariffEngineering;
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
  TARIFF_ENGINEERING = 'TARIFF_ENGINEERING',
  ALL = 'ALL',
}
