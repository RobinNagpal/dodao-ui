import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Etf, EtfFinancialInfo, EtfStockAnalyzerInfo } from '@prisma/client';
import { NextRequest } from 'next/server';

export type EtfWithRelations = Etf & {
  financialInfo: EtfFinancialInfo | null;
  stockAnalyzerInfo: EtfStockAnalyzerInfo | null;
};

export interface EtfFastResponse extends EtfWithRelations {}

// Helper function to convert BigInt values to strings for JSON serialization
function serializeBigIntFields(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'bigint') {
    return obj.toString();
  }

  // Preserve Date objects
  if (obj instanceof Date) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeBigIntFields);
  }

  if (typeof obj === 'object') {
    const serialized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeBigIntFields(value);
    }
    return serialized;
  }

  return obj;
}

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; etf: string; exchange: string }> }): Promise<EtfFastResponse | null> {
  const { spaceId, etf, exchange } = await context.params;
  const allowNull = req.nextUrl.searchParams.get('allowNull') === 'true';

  // Get ETF from DB with all related data
  const whereClause = {
    spaceId: spaceId || KoalaGainsSpaceId,
    symbol: etf.toUpperCase(),
    exchange: exchange.toUpperCase(),
  };

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
