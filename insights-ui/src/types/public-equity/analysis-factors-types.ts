import { InvestorKey, InvestorTypes, ManagementTeamAlignmentVerdict, StabilityResilienceVerdict, TickerAnalysisCategory } from '@/types/ticker-typesv1';
import { TickerV1GenerationRequest } from '@prisma/client';
import { TopCompaniesToConsider } from '../prismaTypes';

export interface AnalysisFactorDefinition {
  factorAnalysisKey: string;
  factorAnalysisTitle: string;
  factorAnalysisDescription: string;
  factorAnalysisMetrics?: string;
}

export interface CategoryAnalysisFactors {
  categoryKey: TickerAnalysisCategory;
  factors: AnalysisFactorDefinition[];
}

export interface UpsertAnalysisFactorsRequest {
  industryKey: string;
  subIndustryKey: string;
  categories: CategoryAnalysisFactors[];
}

export interface CompetitionAnalysis {
  companyName: string;
  companySymbol?: string;
  exchangeSymbol?: string;
  exchangeName?: string;
  detailedComparison?: string;
}

export type CompetitionAnalysisArray = CompetitionAnalysis[];

/** Shape of a generated competition report (used when importing/saving a report JSON). */
export interface CompetitionAnalysisResponse {
  summary: string;
  overallAnalysisDetails: string;
  competitionAnalysisArray: Array<{
    companyName: string;
    companySymbol?: string;
    exchangeSymbol?: string;
    exchangeName?: string;
    detailedComparison: string;
  }>;
}

/** Shape of a generated final-summary report (used when importing/saving a report JSON). */
export interface FinalSummaryResponse {
  finalSummary: string;
  metaDescription: string;
  aboutReport: string;
}

export interface TickerAnalysisResponse {
  success: boolean;
  invocationId: string;
}

export interface AnalysisRequest {
  investorKey?: InvestorTypes;
}

export interface LLMFactorAnalysisResponse {
  overallSummary: string;
  overallAnalysisDetails: string;
  factors: Array<{
    factorAnalysisKey: string;
    oneLineExplanation: string;
    detailedExplanation: string;
    result: 'Pass' | 'Fail';
  }>;
}

export interface LLMManagementTeamResponse {
  summary: string;
  detailedAnalysis: string;
  alignmentVerdict: ManagementTeamAlignmentVerdict;
}

/**
 * One market-drop scenario of the stability report. The market drop is the
 * broad-market move (S&P 500 style); the industry and the stock can fall by
 * more or by less — an industry already near a cyclical bottom often gives up
 * much less than the market, a richly-valued cyclical much more.
 *
 * `sectorImpact` and `companyImpact` are the two paragraphs the detail page
 * renders for this scenario, in that order.
 */
export interface MarketDropScenario {
  /** Broad-market drawdown assumed for this scenario: 5, 15 or 30 (percent). */
  marketDropPercent: number;
  /** Expected drawdown of the company's industry / sub-industry, in percent. */
  expectedSectorDropPercent: number;
  /** First paragraph of the scenario: what the drop does to the industry and sub-industry (markdown). */
  sectorImpact: string;
  /** Expected drawdown of this stock, in percent. */
  expectedStockDropPercent: number;
  /** Expected price of the stock in this scenario, in the report's currency. */
  expectedPrice: number;
  /** Second paragraph of the scenario: what the drop does to this company (markdown). */
  companyImpact: string;
}

export type MarketDropScenarioArray = MarketDropScenario[];

export interface LLMStabilityResponse {
  /** Short report (2 paragraphs) shown on the main stock page. */
  summary: string;
  /** Overall part of the long report (2 paragraphs) shown on the detail page. */
  detailedAnalysis: string;
  resilienceVerdict: StabilityResilienceVerdict;
  /** Price the expected prices were computed from. */
  referencePrice: number;
  /** ISO 8601 timestamp for when `referencePrice` was captured. */
  referencePriceAsOf?: string;
  currency: string;
  /** Exactly three entries: market drops of 5%, 15% and 30%. */
  dropScenarios: MarketDropScenario[];
}

export interface LLMInvestorAnalysisResponse {
  summary: string;
  verdict: string;
  willInvest: boolean;
  topCompaniesToConsider: TopCompaniesToConsider[];
}

export interface TickerV1 {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  industryKey: string;
  subIndustryKey: string;
  websiteUrl?: string;
  summary?: string;
}

// Extend the Prisma type to add optional ticker relation for python backend use
export interface TickerV1GenerationRequestWithTicker extends TickerV1GenerationRequest {
  ticker?: {
    symbol: string;
  };
}
