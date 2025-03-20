import { getCriteriaByIds } from '@/lib/industryGroupCriteria';
import { prisma } from '@/prisma';
import { IndustryGroupCriteriaDefinition } from '@/types/public-equity/criteria-types';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

const getCriteriaDefinition = async (req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }): Promise<IndustryGroupCriteriaDefinition> => {
  const { tickerKey } = await params;

  const tickerReport = await prisma.ticker.findUnique({ where: { tickerKey }, include: { evaluationsOfLatest10Q: true } });
  if (!tickerReport) {
    throw new Error(`Ticker not found for key: ${tickerKey}`);
  }
  const industryGroupCriteria = await getCriteriaByIds(tickerReport.sectorId, tickerReport.industryGroupId);

  return industryGroupCriteria;
};

export const GET = withErrorHandlingV2<IndustryGroupCriteriaDefinition>(getCriteriaDefinition);
