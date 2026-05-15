import { getEtfWhereClause } from '@/app/api/[spaceId]/etfs-v1/etfApiUtils';
import { prisma } from '@/prisma';
import { EtfAnalysisCategory } from '@/types/etf/etf-analysis-types';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

const ANALYSIS_CATEGORY_TO_SLUG: Readonly<Record<string, string>> = {
  [EtfAnalysisCategory.PerformanceAndReturns]: 'performance-returns',
  [EtfAnalysisCategory.CostEfficiencyAndTeam]: 'cost-efficiency-team',
  [EtfAnalysisCategory.RiskAnalysis]: 'risk-analysis',
  [EtfAnalysisCategory.FuturePerformanceOutlook]: 'future-performance-outlook',
};

export interface EtfAvailableSectionsResponse {
  /** Slugs of sibling pages that have publishable content for this ETF. */
  slugs: string[];
}

async function getHandler(
  _req: NextRequest,
  context: { params: Promise<{ spaceId: string; exchange: string; etf: string }> }
): Promise<EtfAvailableSectionsResponse> {
  const { spaceId, exchange, etf } = await context.params;
  const where = getEtfWhereClause({ spaceId, exchange, etf });
  if (!where.symbol || !where.exchange) return { slugs: [] };

  const etfRecord = await prisma.etf.findFirst({
    where,
    select: { id: true },
  });
  if (!etfRecord) return { slugs: [] };

  const [analysisRows, competitionRow, holdingsRow] = await Promise.all([
    prisma.etfCategoryAnalysisResult.findMany({
      where: {
        spaceId: where.spaceId,
        etfId: etfRecord.id,
        summary: { not: '' },
        overallAnalysisDetails: { not: '' },
      },
      select: { categoryKey: true },
    }),
    prisma.etfVsCompetition.findFirst({
      where: { spaceId: where.spaceId, etfId: etfRecord.id, overallAnalysisDetails: { not: '' } },
      select: { id: true },
    }),
    prisma.etfMorPortfolioInfo.findFirst({
      where: { etfId: etfRecord.id },
      select: { id: true },
    }),
  ]);

  const available = new Set<string>();
  for (const row of analysisRows) {
    const slug = ANALYSIS_CATEGORY_TO_SLUG[row.categoryKey as string];
    if (slug) available.add(slug);
  }
  if (competitionRow) available.add('competition');
  if (holdingsRow) available.add('holdings');

  return { slugs: Array.from(available) };
}

export const GET = withErrorHandlingV2<EtfAvailableSectionsResponse>(getHandler);
