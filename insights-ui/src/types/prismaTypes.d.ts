export interface StockFundamentalsSummary {
  marketCap?: number;
  revenueTtm?: number;
  netIncomeTtm?: number;
  sharesOut?: number;
  epsTtm?: number;
  peRatio?: number;
  forwardPE?: number;
  dividend?: {
    amount?: number;
    yield?: number;
    exDividendDate?: string;
    payoutFrequency?: string;
    payoutRatioPct?: number;
    dividendGrowth1Y?: number;
  };
  exDividendDate?: string;
  volume?: number;
  averageVolume?: number;
  open?: number;
  previousClose?: number;
  daysRange?: {
    low?: number;
    high?: number;
  };
  week52Range?: {
    low?: number;
    high?: number;
  };
  beta?: number;
  rsi?: number;
  earningsDate?: string;
}

export interface DividendMeta {
  currency?: string;
}

export interface DividendSummary {
  annualDividend?: number;
  yieldPct?: number;
  exDividendDate?: string;
  payoutFrequency?: string;
  payoutRatioPct?: number;
  dividendGrowth1Y?: number;
  currency?: string;
}

export interface DividendHistoryRow {
  exDividendDate?: string;
  amount?: number;
  currency?: string;
  recordDate?: string;
  payDate?: string;
}

export interface DividendsData {
  meta: DividendMeta;
  summary: DividendSummary;
  history: DividendHistoryRow[];
}

// Generic financial statement types to reduce redundancy
export interface FinancialMeta {
  currency?: string;
  unit?: string;
  fiscalYearNote?: string;
}

export interface FinancialAnnualPeriod {
  fiscalYear: string;
  periodEnd?: string;
  values: Record<string, number | null>;
}

export interface FinancialQuarterlyPeriod {
  fiscalQuarter: string;
  periodEnd?: string;
  values: Record<string, number | null>;
}

// Specific financial statement data types
export interface IncomeAnnualData {
  meta: FinancialMeta;
  periods: FinancialAnnualPeriod[];
}

export interface IncomeQuarterlyData {
  meta: FinancialMeta;
  periods: FinancialQuarterlyPeriod[];
}

export interface BalanceSheetAnnualData {
  meta: FinancialMeta;
  periods: FinancialAnnualPeriod[];
}

export interface BalanceSheetQuarterlyData {
  meta: FinancialMeta;
  periods: FinancialQuarterlyPeriod[];
}

export interface CashFlowAnnualData {
  meta: FinancialMeta;
  periods: FinancialAnnualPeriod[];
}

export interface CashFlowQuarterlyData {
  meta: FinancialMeta;
  periods: FinancialQuarterlyPeriod[];
}

export interface RatiosAnnualData {
  meta: FinancialMeta;
  periods: FinancialAnnualPeriod[];
}

export interface RatiosQuarterlyData {
  meta: FinancialMeta;
  periods: FinancialQuarterlyPeriod[];
}

declare global {
  namespace PrismaJson {
    // Stock analyzer scraper types
    type StockFundamentalsSummary = StockFundamentalsSummary;
    type FinancialStatementData = Record<string, any>;
    type DividendsData = DividendsData;
    type IncomeAnnualData = IncomeAnnualData;
    type IncomeQuarterlyData = IncomeQuarterlyData;
    type BalanceSheetAnnualData = BalanceSheetAnnualData;
    type BalanceSheetQuarterlyData = BalanceSheetQuarterlyData;
    type CashFlowAnnualData = CashFlowAnnualData;
    type CashFlowQuarterlyData = CashFlowQuarterlyData;
    type RatiosAnnualData = RatiosAnnualData;
    type RatiosQuarterlyData = RatiosQuarterlyData;
  }
}
