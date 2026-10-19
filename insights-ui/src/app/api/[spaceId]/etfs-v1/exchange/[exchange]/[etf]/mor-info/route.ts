import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { getEtfMorInfoData } from '@/utils/etf-page-data';
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
  return getEtfMorInfoData(spaceId, exchange, etf);
}

export const GET = withErrorHandlingV2<EtfMorInfoOptionalWrapper>(getHandler);
