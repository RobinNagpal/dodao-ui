/**
 * Per-ETF response payload types. The dedicated `/etfs-v1/exchange/<E>/<T>/<...>`
 * REST endpoints these used to live on were retired in favour of the
 * consolidated `/full-render` route, so the types now live in their own file
 * — owned by the UI rather than by any single API route.
 */
type Num = number | null;

export interface EtfFinancialInfoResponse {
  symbol: string;
  aum: string | null;
  expenseRatio: Num;
  pe: Num;
  sharesOut: string | null;
  dividendTtm: Num;
  dividendYield: Num;
  payoutFrequency: string | null;
  payoutRatio: Num;
  volume: Num;
  yearHigh: Num;
  yearLow: Num;
  beta: Num;
  holdings: number | null;
}

export interface EtfScoresResponse {
  performanceAndReturnsScore: number;
  costEfficiencyAndTeamScore: number;
  riskAnalysisScore: number;
  futurePerformanceOutlookScore: number | null;
  finalScore: number;
}

export interface SimilarEtf {
  id: string;
  symbol: string;
  exchange: string;
  name: string;
  // Financial detail fields — same set we surface on the ETF detail page header.
  aum: string | null;
  expenseRatio: number | null;
  pe: number | null;
  sharesOut: string | null;
  dividendTtm: number | null;
  dividendYield: number | null;
  payoutFrequency: string | null;
  payoutRatio: number | null;
  volume: number | null;
  yearHigh: number | null;
  yearLow: number | null;
  beta: number | null;
  holdings: number | null;
}
