import { CompetitionAnalysis as CompetitionAnalysisType } from '@/types/public-equity/analysis-factors-types';

export interface StockFundamentalsSummary {
  marketCap?: string;
  revenueTtm?: string;
  netIncomeTtm?: string;
  sharesOut?: string;
  epsTtm?: number;
  peRatio?: number;
  forwardPE?: number;
  dividend?: {
    amount?: number;
    yieldPct?: string;
  };
  exDividendDate?: Date;
  volume?: number;
  averageVolume?: number;
  open?: number;
  previousClose?: number;
  daysRange?: {
    low: number;
    high: number;
  };
  week52Range?: {
    low: number;
    high: number;
  };
  beta?: number;
  rsi?: number;
  earningsDate?: Date;
}

export interface DividendMeta {
  currency?: string;
}

export interface DividendSummary {
  annualDividend?: number;
  yieldPct?: string;
  exDividendDate?: Date;
  payoutFrequency?: string;
  payoutRatioPct?: string;
  dividendGrowth1Y?: string;
  currency?: string;
}

export interface DividendHistoryRow {
  exDividendDate?: Date;
  amount?: number;
  currency?: string;
  recordDate?: Date;
  payDate?: Date;
}

export interface DividendsData {
  meta: DividendMeta;
  summary: DividendSummary;
  history: DividendHistoryRow[];
}

// Common Financial Meta (used by all statement types)
export interface FinancialMeta {
  currency?: string;
  unit?: string;
  fiscalYearNote?: string;
}

// Base Financial Period Type (common structure)
export interface BaseFinancialPeriod {
  periodEnd?: string;
  values: Record<string, string | number | null>;
}

// Balance Sheet Types
export interface BalanceAnnualPeriod extends BaseFinancialPeriod {
  fiscalYear: string;
}

export interface BalanceQuarterlyPeriod extends BaseFinancialPeriod {
  fiscalQuarter: string;
}

export interface BalanceAnnualData {
  meta: FinancialMeta;
  periods: BalanceAnnualPeriod[];
}

export interface BalanceQuarterlyData {
  meta: FinancialMeta;
  periods: BalanceQuarterlyPeriod[];
}

// Income Statement Types
export interface IncomeAnnualPeriod extends BaseFinancialPeriod {
  fiscalYear: string;
}

export interface IncomeQuarterlyPeriod extends BaseFinancialPeriod {
  fiscalQuarter: string;
}

export interface IncomeAnnualData {
  meta: FinancialMeta;
  periods: IncomeAnnualPeriod[];
}

export interface IncomeQuarterlyData {
  meta: FinancialMeta;
  periods: IncomeQuarterlyPeriod[];
}

// Cash Flow Types
export interface CashFlowAnnualPeriod extends BaseFinancialPeriod {
  fiscalYear: string;
}

export interface CashFlowQuarterlyPeriod extends BaseFinancialPeriod {
  fiscalQuarter: string;
}

export interface CashFlowAnnualData {
  meta: FinancialMeta;
  periods: CashFlowAnnualPeriod[];
}

export interface CashFlowQuarterlyData {
  meta: FinancialMeta;
  periods: CashFlowQuarterlyPeriod[];
}

// Ratios Types
export interface RatiosAnnualPeriod extends BaseFinancialPeriod {
  fiscalYear: string;
}

export interface RatiosQuarterlyPeriod extends BaseFinancialPeriod {
  fiscalQuarter: string;
}

export interface RatiosAnnualData {
  meta: FinancialMeta;
  periods: RatiosAnnualPeriod[];
}

export interface RatiosQuarterlyData {
  meta: FinancialMeta;
  periods: RatiosQuarterlyPeriod[];
}

declare global {
  namespace PrismaJson {
    type CompetitionAnalysis = CompetitionAnalysisType;
    // Stock analyzer scraper types
    type StockFundamentalsSummary = StockFundamentalsSummary;
    type DividendsData = DividendsData;
    type BalanceAnnualData = BalanceAnnualData;
    type BalanceQuarterlyData = BalanceQuarterlyData;
    type IncomeAnnualData = IncomeAnnualData;
    type IncomeQuarterlyData = IncomeQuarterlyData;
    type CashFlowAnnualData = CashFlowAnnualData;
    type CashFlowQuarterlyData = CashFlowQuarterlyData;
    type RatiosAnnualData = RatiosAnnualData;
    type RatiosQuarterlyData = RatiosQuarterlyData;
  }
}
