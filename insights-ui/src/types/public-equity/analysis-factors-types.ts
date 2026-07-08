import { InvestorKey, InvestorTypes, ManagementTeamAlignmentVerdict, TickerAnalysisCategory } from '@/types/ticker-typesv1';
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
