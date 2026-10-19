import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { getTickerFinancialInfo } from '@/utils/ticker-v1-page-data';

type Num = number | null;

export interface FinancialInfoOptionalWrapper {
  financialInfo: FinancialInfoResponse | null;
}

export interface FinancialInfoResponse {
  symbol: string;
  currency: string | null;
  price: Num;
  dayHigh: Num;
  dayLow: Num;
  yearHigh: Num;
  yearLow: Num;
  marketCap: string | null; // Keep as formatted string (e.g., "633.80B")
  epsDilutedTTM: Num;
  pe: Num;
  avgVolume3M: Num;
  dayVolume: Num;
  annualDividend: Num;
  dividendYield: Num;
  totalRevenue: string | null; // Keep as formatted string (e.g., "461.60B")
  netIncome: string | null; // Keep as formatted string (e.g., "81.02B")
  forwardPE: Num;
  beta: Num;
}

async function getHandler(
  req: NextRequest,
  { params }: { params: Promise<{ spaceId: string; exchange: string; ticker: string }> }
): Promise<FinancialInfoOptionalWrapper> {
  const { spaceId, exchange, ticker } = await params;
  return getTickerFinancialInfo(spaceId, exchange, ticker);
}

export const GET = withErrorHandlingV2<FinancialInfoOptionalWrapper>(getHandler);
