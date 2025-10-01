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

// 06-evaluate-industry-areas.ts
export type ChartUrls = { chartCode: string; chartUrl: string }[]; // always 0+ images (usually 1‑2)
interface CompanyProduct {
  productName: string;
  productDescription: string;
  percentageOfRevenue: string;
  competitors: string[];
}

interface PerformanceMetrics {
  revenueGrowth: string;
  costOfRevenue: string;
  profitabilityGrowth: string;
  rocGrowth: string;
}

export interface NewChallenger {
  companyName: string;
  companyDescription: string;
  companyWebsite: string;
  companyTicker: string;
  products: CompanyProduct[];
  aboutManagement: string;
  uniqueAdvantage: string;
  pastPerformance: PerformanceMetrics;
  futureGrowth: PerformanceMetrics;
  competitors: string;
  impactOfTariffs: string;
  chartUrls?: ChartUrls;
}

export interface EstablishedPlayer {
  companyName: string;
  companyDescription: string;
  companyWebsite: string;
  companyTicker: string;
  products: CompanyProduct[];
  aboutManagement: string;
  uniqueAdvantage: string;
  pastPerformance: PerformanceMetrics;
  futureGrowth: PerformanceMetrics;
  competitors: string;
  impactOfTariffs: string;
  chartUrls?: ChartUrls;
}

interface NewChallengersArray {
  newChallengers: NewChallenger[];
}

export interface EstablishedPlayersArray {
  establishedPlayers: EstablishedPlayer[];
}

export interface HeadwindsAndTailwinds {
  headwinds: string[];
  tailwinds: string[];
  headwindChartUrls?: ChartUrls;
  tailwindChartUrls?: ChartUrls;
}

export interface PositiveTariffImpactOnCompanyType {
  companyType: string;
  impact: string;
  reasoning: string;
  chartUrls?: ChartUrls;
}

export interface NegativeTariffImpactOnCompanyType {
  companyType: string;
  impact: string;
  reasoning: string;
  chartUrls?: ChartUrls;
}

export interface NewChallengerRef {
  companyName: string;
  companyTicker: string;
}

export interface EstablishedPlayerRef {
  companyName: string;
  companyTicker: string;
}

export interface EvaluateIndustryArea {
  title: string;
  aboutParagraphs: string;
  establishedPlayersRefs: EstablishedPlayerRef[];
  establishedPlayerDetails: EstablishedPlayer[];
  newChallengersRefs: NewChallengerRef[];
  newChallengersDetails: NewChallenger[];
  headwindsAndTailwinds: HeadwindsAndTailwinds;
  positiveTariffImpactOnCompanyType: PositiveTariffImpactOnCompanyType[];
  negativeTariffImpactOnCompanyType: NegativeTariffImpactOnCompanyType[];
  tariffImpactSummary: string;
  tariffImpactSummaryChartUrls?: ChartUrls;
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

// A small utility type because we use it a lot
export interface FinalConclusion {
  title: string;
  conclusionBrief: string;
  positiveImpacts: PositiveImpacts;
  negativeImpacts: NegativeImpacts;
  finalStatements: string;
}

// Tariff updates for a specific industry

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
  evaluateIndustryAreasSeoDetails?: Record<string, PageSeoDetails>;
  finalConclusionSeoDetails?: PageSeoDetails;
}

export interface IndustryTariffReport {
  industryAreas?: IndustryAreasWrapper;
  reportCover?: ReportCover;
  executiveSummary?: ExecutiveSummary;
  tariffUpdates?: TariffUpdatesForIndustry;
  understandIndustry?: UnderstandIndustry;
  industryAreasSections?: IndustryAreaSection;
  evaluateIndustryAreas?: EvaluateIndustryArea[];
  finalConclusion?: FinalConclusion;
  reportSeoDetails?: TariffReportSeoDetails;
}

export enum EvaluateIndustryContent {
  ALL = 'ALL',
  ESTABLISHED_PLAYERS = 'ESTABLISHED_PLAYERS',
  ESTABLISHED_PLAYER = 'ESTABLISHED_PLAYER',
  ESTABLISHED_PLAYERS_TICKERS_ONLY = 'ESTABLISHED_PLAYERS_TICKERS_ONLY',
  NEW_CHALLENGERS = 'NEW_CHALLENGERS',
  NEW_CHALLENGER = 'NEW_CHALLENGER',
  NEW_CHALLENGERS_TICKERS_ONLY = 'NEW_CHALLENGERS_TICKERS_ONLY',
  HEADWINDS_AND_TAILWINDS = 'HEADWINDS_AND_TAILWINDS',
  TARIFF_IMPACT_BY_COMPANY_TYPE = 'TARIFF_IMPACT_BY_COMPANY_TYPE',
  TARIFF_IMPACT_SUMMARY = 'TARIFF_IMPACT_SUMMARY',
}

export enum ChartEntityType {
  NEW_CHALLENGER = 'NEW_CHALLENGER',
  ESTABLISHED_PLAYER = 'ESTABLISHED_PLAYER',
  HEADWINDS = 'HEADWINDS',
  TAILWINDS = 'TAILWINDS',
  POSITIVE_IMPACT = 'POSITIVE_IMPACT',
  NEGATIVE_IMPACT = 'NEGATIVE_IMPACT',
  SUMMARY = 'SUMMARY',
}

/**
 * Types of report sections supported by this script.
 */
export enum ReportType {
  HEADINGS = 'HEADINGS',
  UNDERSTAND_INDUSTRY = 'UNDERSTAND_INDUSTRY',
  TARIFF_UPDATES = 'TARIFF_UPDATES',
  INDUSTRY_AREA_SECTION = 'INDUSTRY_AREA_SECTION',
  EVALUATE_INDUSTRY_AREA = 'EVALUATE_INDUSTRY_AREA',
  EXECUTIVE_SUMMARY = 'EXECUTIVE_SUMMARY',
  REPORT_COVER = 'REPORT_COVER',
  FINAL_CONCLUSION = 'FINAL_CONCLUSION',
  ALL = 'ALL',
}
