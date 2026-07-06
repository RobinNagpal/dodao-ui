import { withAdminOrToken } from '@/app/api/helpers/withAdminOrToken';
import { prisma } from '@/prisma';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { CommodityAnalysisCategory } from '@/types/commodity/commodity-analysis-types';
import { NextRequest } from 'next/server';

export interface CommodityAdminReportRow {
  id: string;
  slug: string;
  name: string;
  commodityGroup: string;
  exchange: string | null;
  priceSymbol: string | null;
  unit: string | null;
  currency: string;
  hasKeyFacts: boolean;
  hasFinalSummary: boolean;
  categories: Record<CommodityAnalysisCategory, boolean>;
  finalScore: number | null;
  updatedAt: string;
}

export interface CommodityAdminReportsResponse {
  commodities: CommodityAdminReportRow[];
  totalCount: number;
}

async function getHandler(
  _req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload | null,
  { params }: { params: Promise<{ spaceId: string }> }
): Promise<CommodityAdminReportsResponse> {
  const { spaceId } = await params;

  const commodities = await prisma.commodity.findMany({
    where: { spaceId },
    orderBy: [{ commodityGroup: 'asc' }, { name: 'asc' }],
    include: {
      keyFactsReport: { select: { id: true } },
      cachedScore: { select: { finalScore: true } },
      categoryAnalysisResults: { select: { categoryKey: true } },
    },
  });

  const rows: CommodityAdminReportRow[] = commodities.map((c) => {
    const generatedCategories = new Set(c.categoryAnalysisResults.map((r) => r.categoryKey));
    return {
      id: c.id,
      slug: c.slug,
      name: c.name,
      commodityGroup: c.commodityGroup,
      exchange: c.exchange,
      priceSymbol: c.priceSymbol,
      unit: c.unit,
      currency: c.currency,
      hasKeyFacts: Boolean(c.keyFactsReport),
      hasFinalSummary: Boolean(c.summary && c.summary.trim().length > 0),
      categories: {
        [CommodityAnalysisCategory.SupplyAndDemand]: generatedCategories.has(CommodityAnalysisCategory.SupplyAndDemand),
        [CommodityAnalysisCategory.PriceAndValue]: generatedCategories.has(CommodityAnalysisCategory.PriceAndValue),
        [CommodityAnalysisCategory.VolatilityAndRisk]: generatedCategories.has(CommodityAnalysisCategory.VolatilityAndRisk),
        [CommodityAnalysisCategory.FutureOutlook]: generatedCategories.has(CommodityAnalysisCategory.FutureOutlook),
      },
      finalScore: c.cachedScore?.finalScore ?? null,
      updatedAt: c.updatedAt.toISOString(),
    };
  });

  return { commodities: rows, totalCount: rows.length };
}

export const GET = withAdminOrToken<CommodityAdminReportsResponse>(getHandler);
