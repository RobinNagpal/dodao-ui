import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import {
  Commodity,
  CommodityAnalysisCategoryFactorResult,
  CommodityCachedScore,
  CommodityCategoryAnalysisResult,
  CommodityKeyFactsReport,
} from '@prisma/client';

export interface CommodityWithAllData extends Commodity {
  keyFactsReport: CommodityKeyFactsReport | null;
  cachedScore: CommodityCachedScore | null;
  categoryAnalysisResults: (CommodityCategoryAnalysisResult & { factorResults: CommodityAnalysisCategoryFactorResult[] })[];
}

export async function fetchCommodityBySlug(slug: string): Promise<Commodity> {
  return prisma.commodity.findFirstOrThrow({
    where: { spaceId: KoalaGainsSpaceId, slug },
  });
}

export async function fetchCommodityWithAllData(slug: string): Promise<CommodityWithAllData> {
  return prisma.commodity.findFirstOrThrow({
    where: { spaceId: KoalaGainsSpaceId, slug },
    include: {
      keyFactsReport: true,
      cachedScore: true,
      categoryAnalysisResults: {
        include: { factorResults: true },
      },
    },
  });
}
