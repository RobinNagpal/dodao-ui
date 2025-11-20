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
  updatedBy?: string;
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
  detailedDescription?: string;
  competitors: string[];
  alternatives: string[];
  spaceId: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
  ticker?: any; // TickerV1 type
  tags?: any[]; // UserTickerTag types
  lists?: any[]; // UserTickerList types
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
