import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Etf, EtfFinancialInfo, EtfStockAnalyzerInfo } from '@prisma/client';
import { NextRequest } from 'next/server';
import { getEtfWhereClause, serializeBigIntFields } from '@/app/api/[spaceId]/etfs-v1/etfApiUtils';

export type EtfWithRelations = Etf & {
  financialInfo: EtfFinancialInfo | null;
  stockAnalyzerInfo: EtfStockAnalyzerInfo | null;
};

export interface EtfFastResponse extends EtfWithRelations {}

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; etf: string; exchange: string }> }): Promise<EtfFastResponse | null> {
  const { spaceId, etf, exchange } = await context.params;
  const allowNull = req.nextUrl.searchParams.get('allowNull') === 'true';

  // Get ETF from DB with all related data
  const whereClause = getEtfWhereClause({ spaceId, exchange, etf });

  const etfRecord: EtfWithRelations | null = allowNull
    ? await prisma.etf.findFirst({
        where: whereClause,
        include: {
          financialInfo: true,
          stockAnalyzerInfo: true,
        },
      })
    : await prisma.etf.findFirstOrThrow({
        where: whereClause,
        include: {
          financialInfo: true,
          stockAnalyzerInfo: true,
        },
      });

  // Return null if ETF not found and allowNull is true
  if (!etfRecord) {
    return null;
  }

  // Serialize BigInt fields to avoid JSON serialization errors
  return serializeBigIntFields(etfRecord);
}

export const GET = withErrorHandlingV2<EtfFastResponse | null>(getHandler);
