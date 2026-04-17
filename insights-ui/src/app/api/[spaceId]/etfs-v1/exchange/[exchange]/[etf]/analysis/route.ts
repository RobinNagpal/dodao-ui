import { prisma } from '@/prisma';
import { getEtfWhereClause, serializeBigIntFields } from '@/app/api/[spaceId]/etfs-v1/etfApiUtils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

export interface EtfFactorResultResponse {
  factorKey: string;
  oneLineExplanation: string;
  detailedExplanation: string;
  result: string;
}

export interface EtfCategoryAnalysisResultResponse {
  categoryKey: string;
  summary: string;
  overallAnalysisDetails: string;
  factorResults: EtfFactorResultResponse[];
}

export interface EtfAnalysisResponse {
  categories: EtfCategoryAnalysisResultResponse[];
}

async function getHandler(_req: NextRequest, context: { params: Promise<{ spaceId: string; exchange: string; etf: string }> }): Promise<EtfAnalysisResponse> {
  const { spaceId, exchange, etf } = await context.params;
  const where = getEtfWhereClause({ spaceId, exchange, etf });

  const etfRecord = await prisma.etf.findFirst({
    where,
    select: { id: true },
  });

  if (!etfRecord) {
    return { categories: [] };
  }

  const results = await prisma.etfCategoryAnalysisResult.findMany({
    where: { etfId: etfRecord.id, spaceId: where.spaceId },
    include: {
      factorResults: {
        select: {
          factorKey: true,
          oneLineExplanation: true,
          detailedExplanation: true,
          result: true,
        },
      },
    },
  });

  return serializeBigIntFields({
    categories: results.map((r) => ({
      categoryKey: r.categoryKey,
      summary: r.summary,
      overallAnalysisDetails: r.overallAnalysisDetails,
      factorResults: r.factorResults,
    })),
  });
}

export const GET = withErrorHandlingV2<EtfAnalysisResponse>(getHandler);
