import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { EtfAnalysisCategory } from '@/types/etf/etf-analysis-types';

export interface EtfCategoryFactorResultResponse {
  factorKey: string;
  oneLineExplanation: string;
  detailedExplanation: string;
  result: string;
}

export interface EtfCategoryResultResponse {
  categoryKey: string;
  summary: string;
  overallAnalysisDetails: string;
  factorResults: EtfCategoryFactorResultResponse[];
  updatedAt: string;
}

export interface EtfCategoryStockAnalyzerInfo {
  category: string | null;
  assetClass: string | null;
  issuer: string | null;
  indexName: string | null;
}

export interface EtfCategoryEtfInfo {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  createdAt: string;
  updatedAt: string;
  stockAnalyzerInfo: EtfCategoryStockAnalyzerInfo | null;
}

export interface EtfCategoryDataResponse {
  categoryResult: EtfCategoryResultResponse | null;
  etf: EtfCategoryEtfInfo | null;
}

/**
 * Mirror of `fetchPerformanceCategoryByExchange` for ETFs: bundles the ETF
 * record (minus heavy `financialInfo`) with the ONE category result the page
 * needs, in a single Prisma round-trip pair filtered by `categoryKey`. Replaces
 * the wasteful `/analysis` + `/route` pair the category subpages used to call.
 */
export async function fetchEtfCategoryByExchange(
  spaceId: string,
  etf: string,
  exchange: string,
  categoryKey: EtfAnalysisCategory
): Promise<EtfCategoryDataResponse> {
  const etfRecord = await prisma.etf.findFirst({
    where: {
      spaceId: spaceId || KoalaGainsSpaceId,
      symbol: etf.toUpperCase(),
      exchange: exchange.toUpperCase(),
    },
    include: { stockAnalyzerInfo: true },
  });

  if (!etfRecord) {
    return { categoryResult: null, etf: null };
  }

  const categoryRow = await prisma.etfCategoryAnalysisResult.findFirst({
    where: { etfId: etfRecord.id, categoryKey, spaceId: spaceId || KoalaGainsSpaceId },
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

  return {
    categoryResult: categoryRow
      ? {
          categoryKey: categoryRow.categoryKey,
          summary: categoryRow.summary,
          overallAnalysisDetails: categoryRow.overallAnalysisDetails,
          factorResults: categoryRow.factorResults,
          updatedAt: categoryRow.updatedAt.toISOString(),
        }
      : null,
    etf: {
      id: etfRecord.id,
      name: etfRecord.name,
      symbol: etfRecord.symbol,
      exchange: etfRecord.exchange,
      createdAt: etfRecord.createdAt.toISOString(),
      updatedAt: etfRecord.updatedAt.toISOString(),
      stockAnalyzerInfo: etfRecord.stockAnalyzerInfo
        ? {
            category: etfRecord.stockAnalyzerInfo.category ?? null,
            assetClass: etfRecord.stockAnalyzerInfo.assetClass ?? null,
            issuer: etfRecord.stockAnalyzerInfo.issuer ?? null,
            indexName: etfRecord.stockAnalyzerInfo.indexName ?? null,
          }
        : null,
    },
  };
}
