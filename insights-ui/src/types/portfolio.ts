export interface CreatePortfolioManagerProfileRequest {
  headline: string;
  summary: string;
  detailedDescription: string;
}

export interface UpdatePortfolioManagerProfileRequest {
  headline?: string;
  summary?: string;
  detailedDescription?: string;
}

export interface Portfolio {
  id: string;
  portfolioManagerProfileId: string;
  name: string;
  summary: string;
  detailedDescription: string;
  spaceId: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string | null;
  portfolioTickers?: PortfolioTicker[];
}

export interface CreatePortfolioRequest {
  name: string;
  summary: string;
  detailedDescription: string;
}

export interface UpdatePortfolioRequest {
  name?: string;
  summary?: string;
  detailedDescription?: string;
}

export interface PortfolioTicker {
  id: string;
  portfolioId: string;
  tickerId: string;
  allocation: number;
  detailedDescription: string | null;
  competitors: string[];
  alternatives: string[];
  spaceId: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string | null;
  ticker?: {
    id: string;
    name: string;
    symbol: string;
    exchange: string;
    industryKey: string;
    subIndustryKey: string;
    websiteUrl?: string | null;
    summary?: string | null;
    cachedScoreEntry?: {
      finalScore: number;
    } | null;
  };
  tags?: any[]; // UserTickerTag types
  lists?: any[]; // UserTickerList types
  competitorsConsidered?: Array<{
    id: string;
    name: string;
    symbol: string;
    exchange: string;
    industryKey: string;
    subIndustryKey: string;
    websiteUrl?: string | null;
    summary?: string | null;
  }>;
  betterAlternatives?: Array<{
    id: string;
    name: string;
    symbol: string;
    exchange: string;
    industryKey: string;
    subIndustryKey: string;
    websiteUrl?: string | null;
    summary?: string | null;
  }>;
}

export interface CreatePortfolioTickerRequest {
  portfolioId: string;
  tickerId: string;
  allocation: number;
  detailedDescription?: string;
  competitors?: string[];
  alternatives?: string[];
  tagIds?: string[];
  listIds?: string[];
}

export interface UpdatePortfolioTickerRequest {
  allocation?: number;
  detailedDescription?: string;
  competitors?: string[];
  alternatives?: string[];
  tagIds?: string[];
  listIds?: string[];
}
