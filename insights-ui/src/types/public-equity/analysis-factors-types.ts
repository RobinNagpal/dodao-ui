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
 * broad-market move (S&P 500 style); the sector and the stock can fall by more
 * or by less — a sector already near a cyclical bottom often gives up much less
 * than the market, a richly-valued cyclical much more.
 */
export interface MarketDropScenario {
  /** Broad-market drawdown assumed for this scenario: 5, 10 or 20 (percent). */
  marketDropPercent: number;
  /** Expected drawdown of the company's sector / sub-industry, in percent. */
  expectedSectorDropPercent: number;
  /** Why the sector moves more or less than the market in this scenario (markdown). */
  sectorImpact: string;
  /** Expected drawdown of this stock, in percent. */
  expectedStockDropPercent: number;
  /** Expected price of the stock in this scenario, in the report's currency. */
  expectedPrice: number;
  /** Why this specific company moves the way it does in this scenario (markdown). */
  companyImpact: string;
}

export type MarketDropScenarioArray = MarketDropScenario[];

export interface LLMStabilityResponse {
  summary: string;
  detailedAnalysis: string;
  resilienceVerdict: StabilityResilienceVerdict;
  /** Price the expected prices were computed from. */
  referencePrice: number;
  currency: string;
  /** Exactly three entries: market drops of 5%, 10% and 20%. */
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
