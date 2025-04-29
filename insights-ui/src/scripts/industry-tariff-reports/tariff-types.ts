export interface TariffReportIndustry {
  name: string;
  companiesToIgnore: string[];
  asOfDate: string;
}

// 00-industry-main-headings.ts
interface PublicCompany {
  name: string;
  ticker: string;
}

export interface IndustrySubAreas {
  title: string;
  oneLineSummary: string;
  companies: PublicCompany[];
}

export interface IndustryAreas {
  title: string;
  oneLineSummary: string;
  subAreas: IndustrySubAreas[];
}

export interface IndustryAreasWrapper {
  areas: IndustryAreas[];
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
}

export interface TariffUpdatesForIndustry {
  countrySpecificTariffs: CountrySpecificTariff[];
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

export interface EvaluateIndustryArea {
  title: string;
  aboutParagraphs: string;
  newChallengersRefs: NewChallengerRef[];
  newChallengersDetails: NewChallenger[];
  establishedPlayers: EstablishedPlayer[];
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

export interface IndustryTariffReport {
  industryAreaHeadings?: IndustryAreasWrapper;
  executiveSummary?: ExecutiveSummary;
  introduction?: Introduction;
  tariffUpdates?: TariffUpdatesForIndustry;
  understandIndustry?: UnderstandIndustry;
  industryAreas?: IndustryAreaSection;
  evaluateIndustryAreas?: EvaluateIndustryArea[];
  finalConclusion?: FinalConclusion;
}

export interface NewChallengerRef {
  companyName: string;
  companyTicker: string;
}

export enum EvaluateIndustryContent {
  ALL = 'ALL',
  ESTABLISHED_PLAYERS = 'ESTABLISHED_PLAYERS',
  NEW_CHALLENGERS = 'NEW_CHALLENGERS',
  NEW_CHALLENGER = 'NEW_CHALLENGER',
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
