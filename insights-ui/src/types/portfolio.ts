import {
  Portfolio as PrismaPortfolio,
  PortfolioTicker as PrismaPortfolioTicker,
  TickerV1,
  TickerV1CachedScore,
  UserTickerTag,
  UserTickerList,
} from '@prisma/client';
import { PortfolioManagerType } from './portfolio-manager';

export interface CreatePortfolioManagerProfileRequest {
  headline: string;
  summary: string;
  detailedDescription: string;
  country: string;
  managerType: PortfolioManagerType;
  isPublic?: boolean;
  profileImageUrl?: string;
}

export interface UpdatePortfolioManagerProfileRequest {
  headline?: string;
  summary?: string;
  detailedDescription?: string;
  country?: string;
  managerType?: PortfolioManagerType;
  isPublic?: boolean;
  profileImageUrl?: string;
}

export interface Portfolio extends PrismaPortfolio {
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

export interface PortfolioTicker extends PrismaPortfolioTicker {
  ticker?: TickerV1 & {
    cachedScoreEntry?: TickerV1CachedScore | null;
  };
  tags?: UserTickerTag[];
  lists?: UserTickerList[];
  competitorsConsidered?: TickerV1[];
  betterAlternatives?: TickerV1[];
}

export interface CreatePortfolioTickerRequest {
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
