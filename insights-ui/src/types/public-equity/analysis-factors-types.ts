import { TickerAnalysisCategory } from '@/lib/mappingsV1';

export interface AnalysisFactorDefinition {
  factorAnalysisKey: string;
  factorAnalysisTitle: string;
  factorAnalysisDescription: string;
}

export interface CategoryAnalysisFactors {
  categoryKey: TickerAnalysisCategory;
  factors: AnalysisFactorDefinition[];
}

export interface GetAnalysisFactorsResponse {
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
