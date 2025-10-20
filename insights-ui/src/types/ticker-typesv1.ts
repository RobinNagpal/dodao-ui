import { VsCompetition } from '@/app/stocks/[exchange]/[ticker]/page';
import { CompetitorTicker, TickerV1FullReportResponse } from '@/utils/ticker-v1-model-utils';
import { TickerV1, TickerAnalysisCategory, TickerV1Industry, TickerV1SubIndustry } from '@prisma/client';

export interface TickerWithIndustryNames extends TickerV1 {
  industryName: string;
  subIndustryName: string;
}

export interface FilteredTicker extends TickerWithIndustryNames {
  categoryScores: {
    [key in TickerAnalysisCategory]?: number;
  };
  totalScore: number;
}

export interface IndustryTickersResponse {
  tickers: TickerV1FullReportResponse[];
  count: number;
}

// Basic ticker info for ticker management
export interface BasicTickerInfo {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  cachedScore: number | null;
  websiteUrl: string | null;
  stockAnalyzeUrl: string;
}

export interface BasicTickersResponse {
  tickers: BasicTickerInfo[];
  count: number;
}

// Analysis status for create reports
export interface AnalysisStatus {
  businessAndMoat: boolean;
  financialAnalysis: boolean;
  pastPerformance: boolean;
  futureGrowth: boolean;
  fairValue: boolean;
  competition: boolean;
  investorAnalysis: {
    WARREN_BUFFETT: boolean;
    CHARLIE_MUNGER: boolean;
    BILL_ACKMAN: boolean;
  };
  futureRisk: boolean;
  finalSummary: boolean;
  cachedScore: boolean;
}

export interface ReportTickerInfo {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  cachedScore: number | null;
  updatedAt: Date;
  analysisStatus: AnalysisStatus;
  isMissingAllAnalysis: boolean; // All analysis sections are empty
  isPartial: boolean; // Some analysis sections are complete
  // Additional fields needed for compatibility with ReportGenerator
  spaceId: string;
  industryKey: string;
  subIndustryKey: string;
  createdAt: Date;
  websiteUrl: string | null;
  summary: string | null;
}

export interface ReportTickersResponse {
  tickers: ReportTickerInfo[];
  count: number;
  missingCount: number;
  partialCount: number;
  completeCount: number;
}

// Helper interface to make ReportTickerInfo compatible with TickerReportV1
export interface ReportTickerAsTickerReport {
  ticker: ReportTickerInfo;
  analysisStatus: AnalysisStatus;
}

export type CompetitionResponse = {
  vsCompetition: VsCompetition | null;
  competitorTickers: CompetitorTicker[];
};

export interface IndustryWithSubIndustries extends TickerV1Industry {
  subIndustries: TickerV1SubIndustry[];
}

export interface IndustryWithSubIndustries extends TickerV1Industry {
  subIndustries: TickerV1SubIndustry[];
}

/**
 * Adds computed ticker counts for both industry and sub-industry rows.
 */
export interface SubIndustryWithCount extends TickerV1SubIndustry {
  tickerCount: number;
}

export interface IndustryWithSubIndustriesAndCounts extends TickerV1Industry {
  subIndustries: SubIndustryWithCount[];
  /** Sum of all tickers in this industry's sub-industries */
  tickerCount: number;
}
