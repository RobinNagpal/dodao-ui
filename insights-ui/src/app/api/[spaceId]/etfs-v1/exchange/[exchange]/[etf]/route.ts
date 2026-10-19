import { getEtfFastData } from '@/utils/etf-page-data';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Etf, EtfFinancialInfo, EtfStockAnalyzerInfo } from '@prisma/client';
import { NextRequest } from 'next/server';

export type EtfWithRelations = Etf & {
  financialInfo: EtfFinancialInfo | null;
  stockAnalyzerInfo: EtfStockAnalyzerInfo | null;
};

export interface EtfFastResponse extends EtfWithRelations {}

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; etf: string; exchange: string }> }): Promise<EtfFastResponse | null> {
  const { spaceId, etf, exchange } = await context.params;
  const allowNull = req.nextUrl.searchParams.get('allowNull') === 'true';
  return getEtfFastData(spaceId, exchange, etf, allowNull);
}

export const GET = withErrorHandlingV2<EtfFastResponse | null>(getHandler);
