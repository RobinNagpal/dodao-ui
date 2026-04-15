import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import {
  Etf,
  EtfAnalysisCategoryFactorResult,
  EtfCategoryAnalysisResult,
  EtfFinancialInfo,
  EtfMorAnalyzerInfo,
  EtfMorPeopleInfo,
  EtfMorPortfolioInfo,
  EtfMorRiskInfo,
  EtfStockAnalyzerInfo,
} from '@prisma/client';

export interface EtfWithAllData extends Etf {
  financialInfo: EtfFinancialInfo | null;
  stockAnalyzerInfo: EtfStockAnalyzerInfo | null;
  morAnalyzerInfo: EtfMorAnalyzerInfo | null;
  morRiskInfo: EtfMorRiskInfo | null;
  morPeopleInfo: EtfMorPeopleInfo | null;
  morPortfolioInfo: EtfMorPortfolioInfo | null;
  categoryAnalysisResults: (EtfCategoryAnalysisResult & { factorResults: EtfAnalysisCategoryFactorResult[] })[];
  analysisCategoryFactorResults: EtfAnalysisCategoryFactorResult[];
}

export async function fetchEtfBySymbolAndExchange(symbol: string, exchange: string): Promise<Etf> {
  return await prisma.etf.findFirstOrThrow({
    where: {
      spaceId: KoalaGainsSpaceId,
      symbol: symbol.toUpperCase(),
      exchange: exchange.toUpperCase(),
    },
  });
}

export async function fetchEtfWithAllData(symbol: string, exchange: string): Promise<EtfWithAllData> {
  return await prisma.etf.findFirstOrThrow({
    where: {
      spaceId: KoalaGainsSpaceId,
      symbol: symbol.toUpperCase(),
      exchange: exchange.toUpperCase(),
    },
    include: {
      financialInfo: true,
      stockAnalyzerInfo: true,
      morAnalyzerInfo: true,
      morRiskInfo: true,
      morPeopleInfo: true,
      morPortfolioInfo: true,
      categoryAnalysisResults: {
        include: {
          factorResults: true,
        },
      },
      analysisCategoryFactorResults: true,
    },
  });
}
