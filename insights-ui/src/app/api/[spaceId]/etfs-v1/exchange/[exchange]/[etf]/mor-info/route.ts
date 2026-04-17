import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { NextRequest } from 'next/server';
import { getEtfWhereClause } from '@/app/api/[spaceId]/etfs-v1/etfApiUtils';
import { EtfMorAnalyzerInfo, EtfMorPeopleInfo, EtfMorPortfolioInfo, EtfMorRiskInfo } from '@prisma/client';

export interface EtfMorInfoOptionalWrapper {
  morAnalyzerInfo: EtfMorAnalyzerInfo | null;
  morRiskInfo: EtfMorRiskInfo | null;
  morPeopleInfo: EtfMorPeopleInfo | null;
  morPortfolioInfo: EtfMorPortfolioInfo | null;
}

async function getHandler(
  _req: NextRequest,
  { params }: { params: Promise<{ spaceId: string; exchange: string; etf: string }> }
): Promise<EtfMorInfoOptionalWrapper> {
  const { spaceId, exchange, etf } = await params;
  const whereClause = getEtfWhereClause({ spaceId, exchange, etf });
  if (!whereClause.symbol || !whereClause.exchange) {
    return { morAnalyzerInfo: null, morRiskInfo: null, morPeopleInfo: null, morPortfolioInfo: null };
  }

  const etfRecord = await prisma.etf.findFirstOrThrow({
    where: { ...whereClause },
    include: {
      morAnalyzerInfo: true,
      morRiskInfo: true,
      morPeopleInfo: true,
      morPortfolioInfo: true,
    },
  });

  return {
    morAnalyzerInfo: etfRecord.morAnalyzerInfo,
    morRiskInfo: etfRecord.morRiskInfo,
    morPeopleInfo: etfRecord.morPeopleInfo,
    morPortfolioInfo: etfRecord.morPortfolioInfo,
  };
}

export const GET = withErrorHandlingV2<EtfMorInfoOptionalWrapper>(getHandler);
