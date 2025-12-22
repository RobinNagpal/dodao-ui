import {
  Portfolio as PrismaPortfolio,
  PortfolioTicker as PrismaPortfolioTicker,
  PortfolioManagerProfile,
  TickerV1,
  TickerV1CachedScore,
  TickerV1Industry,
  UserTickerTag,
  UserTickerList,
  User,
} from '@prisma/client';
import { PortfolioManagerType } from './portfolio-manager';
import { SupportedCountries } from '@/utils/countryExchangeUtils';

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
  portfolioManagerProfile?: PortfolioManagerProfile & {
    user: User;
  };
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

export type PortfolioWithTickers = PrismaPortfolio & {
  portfolioTickers: PortfolioTicker[];
};

export interface IndustryByCountry {
  industry: TickerV1Industry;
  country: SupportedCountries;
  favoriteCount: number;
  notesCount: number;
  totalCount: number;
}

export type PortfolioManagerProfilewithPortfoliosAndUser = PortfolioManagerProfile & {
  user: User;
  portfolios: PortfolioWithTickers[];
  industriesByCountry?: IndustryByCountry[];
};
