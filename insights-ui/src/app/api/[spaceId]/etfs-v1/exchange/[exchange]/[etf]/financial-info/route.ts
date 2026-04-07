import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { NextRequest } from 'next/server';
import { getEtfWhereClause } from '@/app/api/[spaceId]/etfs-v1/etfApiUtils';

type Num = number | null;

export interface EtfFinancialInfoOptionalWrapper {
  financialInfo: EtfFinancialInfoResponse | null;
}

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

async function getHandler(
  req: NextRequest,
  { params }: { params: Promise<{ spaceId: string; exchange: string; etf: string }> }
): Promise<EtfFinancialInfoOptionalWrapper> {
  const { spaceId, exchange, etf } = await params;
  const whereClause = getEtfWhereClause({ spaceId, exchange, etf });
  if (!whereClause.symbol || !whereClause.exchange) {
    return { financialInfo: null };
  }

  try {
    // Find the ETF in database
    const etfRecord = await prisma.etf.findFirstOrThrow({
      where: {
        ...whereClause,
      },
      include: {
        financialInfo: true,
      },
    });

    // Check if financial info exists
    if (!etfRecord.financialInfo) {
      console.error(`No financial info available for ETF ${whereClause.symbol}`);
      return { financialInfo: null };
    }

    // Convert to response format
    const financialInfo: EtfFinancialInfoResponse = {
      symbol: etfRecord.symbol,
      aum: etfRecord.financialInfo.aum,
      expenseRatio: etfRecord.financialInfo.expenseRatio,
      pe: etfRecord.financialInfo.pe,
      sharesOut: etfRecord.financialInfo.sharesOut,
      dividendTtm: etfRecord.financialInfo.dividendTtm,
      dividendYield: etfRecord.financialInfo.dividendYield,
      payoutFrequency: etfRecord.financialInfo.payoutFrequency,
      payoutRatio: etfRecord.financialInfo.payoutRatio,
      volume: etfRecord.financialInfo.volume,
      yearHigh: etfRecord.financialInfo.yearHigh,
      yearLow: etfRecord.financialInfo.yearLow,
      beta: etfRecord.financialInfo.beta,
      holdings: etfRecord.financialInfo.holdings,
    };

    return { financialInfo };
  } catch (error) {
    console.error(`Error fetching ETF financial info for ${whereClause.symbol}:`, error);
    return { financialInfo: null };
  }
}

export const GET = withErrorHandlingV2<EtfFinancialInfoOptionalWrapper>(getHandler);
