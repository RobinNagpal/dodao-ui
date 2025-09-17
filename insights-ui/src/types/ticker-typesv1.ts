import { TickerV1ReportResponse } from '@/utils/ticker-v1-model-utils';
import { TickerV1, TickerAnalysisCategory } from '@prisma/client';

export interface TickerWithIndustryNames extends TickerV1 {
  industryName: string;
  subIndustryName: string;
}

export interface FilteredTicker {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  industryKey: string;
  subIndustryKey: string;
  industryName: string;
  subIndustryName: string;
  websiteUrl?: string | null;
  summary?: string | null;
  cachedScore: number;
  spaceId: string;
  categoryScores: {
    [key in TickerAnalysisCategory]?: number;
  };
  totalScore: number;
}

export interface IndustryTickersResponse {
  tickers: TickerV1ReportResponse[];
  count: number;
}
