import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { NextRequest } from 'next/server';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { EtfStockAnalyzerInfo } from '@prisma/client';

export interface EtfAnalyzerInfoOptionalWrapper {
  analyzerInfo: EtfStockAnalyzerInfo | null;
}

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

async function getHandler(
  req: NextRequest,
  { params }: { params: Promise<{ spaceId: string; exchange: string; etf: string }> }
): Promise<EtfAnalyzerInfoOptionalWrapper> {
  const { spaceId, exchange, etf } = await params;
  const e = exchange?.toUpperCase()?.trim();
  const t = etf?.toUpperCase()?.trim();

  if (!t || !e) {
    return { analyzerInfo: null };
  }

  try {
    // Find the ETF in database
    const etfRecord = await prisma.etf.findFirstOrThrow({
      where: {
        spaceId: spaceId || KoalaGainsSpaceId,
        symbol: t,
        exchange: e,
      },
      include: {
        stockAnalyzerInfo: true,
      },
    });

    // Return analyzer info (can be null), serializing BigInt fields
    return { analyzerInfo: serializeBigIntFields(etfRecord.stockAnalyzerInfo) };
  } catch (error) {
    console.error(`Error fetching ETF analyzer info for ${t}:`, error);
    return { analyzerInfo: null };
  }
}

export const GET = withErrorHandlingV2<EtfAnalyzerInfoOptionalWrapper>(getHandler);
