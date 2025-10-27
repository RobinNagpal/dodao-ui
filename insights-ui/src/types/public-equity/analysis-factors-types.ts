import { TickerAnalysisCategory } from '@/types/ticker-typesv1';
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

export interface TickerAnalysisResponse {
  success: boolean;
  invocationId: string;
}

export interface AnalysisRequest {
  investorKey?: string;
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

export interface LLMFutureRiskResponse {
  summary: string;
  detailedAnalysis: string;
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
