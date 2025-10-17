import { CompetitionAnalysisArray as CompetitionAnalysisArrayType } from '@/types/public-equity/analysis-factors-types';

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

// Balance Sheet Types
export interface BalanceAnnualPeriod {
  fiscalYear: string;
  periodEnd?: string;
  values: Record<string, string | number | null>;
}

export interface BalanceQuarterlyPeriod {
  fiscalQuarter: string;
  periodEnd?: string;
  values: Record<string, string | number | null>;
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
export interface IncomeAnnualPeriod {
  fiscalYear: string;
  periodEnd?: string;
  values: Record<string, string | number | null>;
}

export interface IncomeQuarterlyPeriod {
  fiscalQuarter: string;
  periodEnd?: string;
  values: Record<string, string | number | null>;
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
export interface CashFlowAnnualPeriod {
  fiscalYear: string;
  periodEnd?: string;
  values: Record<string, string | number | null>;
}

export interface CashFlowQuarterlyPeriod {
  fiscalQuarter: string;
  periodEnd?: string;
  values: Record<string, string | number | null>;
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
export interface RatiosAnnualPeriod {
  fiscalYear: string;
  periodEnd?: string;
  values: Record<string, string | number | null>;
}

export interface RatiosQuarterlyPeriod {
  fiscalQuarter: string;
  periodEnd?: string;
  values: Record<string, string | number | null>;
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
    type CompetitionAnalysisArray = CompetitionAnalysisArrayType;
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
