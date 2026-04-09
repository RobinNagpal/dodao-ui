import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { NextRequest } from 'next/server';
import { EtfStockAnalyzerInfo } from '@prisma/client';
import { getEtfWhereClause, serializeBigIntFields } from '@/app/api/[spaceId]/etfs-v1/etfApiUtils';

export interface EtfAnalyzerInfoOptionalWrapper {
  analyzerInfo: EtfStockAnalyzerInfo | null;
}

async function getHandler(
  req: NextRequest,
  { params }: { params: Promise<{ spaceId: string; exchange: string; etf: string }> }
): Promise<EtfAnalyzerInfoOptionalWrapper> {
  const { spaceId, exchange, etf } = await params;
  const whereClause = getEtfWhereClause({ spaceId, exchange, etf });
  if (!whereClause.symbol || !whereClause.exchange) {
    return { analyzerInfo: null };
  }

  const etfRecord = await prisma.etf.findFirstOrThrow({
    where: {
      ...whereClause,
    },
    include: {
      stockAnalyzerInfo: true,
    },
  });

  // Return analyzer info (can be null), serializing BigInt fields
  return { analyzerInfo: serializeBigIntFields(etfRecord.stockAnalyzerInfo) };
}

export const GET = withErrorHandlingV2<EtfAnalyzerInfoOptionalWrapper>(getHandler);
