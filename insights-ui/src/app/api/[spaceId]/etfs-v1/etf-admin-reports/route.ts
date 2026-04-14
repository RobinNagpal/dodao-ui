import { withLoggedInAdmin } from '@/app/api/helpers/withLoggedInAdmin';
import { prisma } from '@/prisma';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { AllExchanges, EXCHANGES, isExchange } from '@/utils/countryExchangeUtils';
import { NextRequest } from 'next/server';

export interface EtfReportRow {
  id: string;
  symbol: string;
  name: string;
  exchange: AllExchanges;
  hasFinancialInfo: boolean;
  hasStockAnalyzerInfo: boolean;
  hasMorAnalyzerInfo: boolean;
  hasMorRiskInfo: boolean;
  hasMorPeopleInfo: boolean;
  hasMorPortfolioInfo: boolean;
  performanceAnalysisCount: number;
  costEfficiencyAnalysisCount: number;
  riskAnalysisCount: number;
}

export interface EtfReportsResponse {
  etfs: EtfReportRow[];
  totalCount: number;
  page: number;
  limit: number;
  availableExchanges: AllExchanges[];
}

export type MissingFilter = '' | 'stockAnalyze' | 'mor' | 'analysis';

function normalizeUpperTrim(value: string | null | undefined): string {
  return (value ?? '').toUpperCase().trim();
}

function buildSearchWhere(qRaw: string | null): any {
  const q = (qRaw ?? '').trim();
  if (!q) return null;

  // Best-effort "smart" search:
  // - Split into tokens so "vanguard growth" matches both words (AND)
  // - Each token matches symbol OR name (OR)
  const tokens = q
    .split(/\s+/g)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 10);

  if (!tokens.length) return null;

  return {
    AND: tokens.map((token) => ({
      OR: [{ symbol: { contains: token, mode: 'insensitive' } }, { name: { contains: token, mode: 'insensitive' } }],
    })),
  };
}

function toMissingFilter(v: string | null): MissingFilter {
  const normalized = (v ?? '').trim();
  if (normalized === 'stockAnalyze') return 'stockAnalyze';
  if (normalized === 'mor') return 'mor';
  if (normalized === 'analysis') return 'analysis';
  return '';
}

const getHandler = async (
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload,
  { params }: { params: Promise<{ spaceId: string }> }
): Promise<EtfReportsResponse> => {
  const { spaceId } = await params;
  const { searchParams } = new URL(req.url);

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '100', 10)));

  const exchangeRaw = normalizeUpperTrim(searchParams.get('exchange'));
  const exchange: AllExchanges | '' = exchangeRaw && isExchange(exchangeRaw) ? exchangeRaw : '';
  const q = searchParams.get('q');
  const missing = toMissingFilter(searchParams.get('missing'));

  const searchWhere = buildSearchWhere(q);

  const missingWhere: any =
    missing === 'stockAnalyze'
      ? {
          OR: [{ financialInfo: { is: null } }, { stockAnalyzerInfo: { is: null } }],
        }
      : missing === 'mor'
      ? {
          OR: [{ morAnalyzerInfo: { is: null } }, { morRiskInfo: { is: null } }, { morPeopleInfo: { is: null } }, { morPortfolioInfo: { is: null } }],
        }
      : missing === 'analysis'
      ? {
          categoryAnalysisResults: { none: {} },
        }
      : null;

  const where: any = {
    spaceId,
    ...(exchange ? { exchange } : {}),
    ...(searchWhere ? searchWhere : {}),
    ...(missingWhere ? missingWhere : {}),
  };

  const [etfs, totalCount, distinctExchanges] = await Promise.all([
    prisma.etf.findMany({
      where,
      select: {
        id: true,
        symbol: true,
        name: true,
        exchange: true,
        financialInfo: { select: { id: true } },
        stockAnalyzerInfo: { select: { id: true } },
        morAnalyzerInfo: { select: { id: true } },
        morRiskInfo: { select: { id: true } },
        morPeopleInfo: { select: { id: true } },
        morPortfolioInfo: { select: { id: true } },
        analysisCategoryFactorResults: {
          select: { categoryKey: true },
        },
      },
      orderBy: [{ symbol: 'asc' }, { exchange: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.etf.count({ where }),
    prisma.etf.findMany({
      where: { spaceId },
      select: { exchange: true },
      distinct: ['exchange'],
      orderBy: [{ exchange: 'asc' }],
    }),
  ]);

  const supportedEtfs = etfs.filter((e) => isExchange(e.exchange));
  const availableExchanges: AllExchanges[] = distinctExchanges.map((e) => normalizeUpperTrim(e.exchange)).filter((ex): ex is AllExchanges => isExchange(ex));

  return {
    etfs: supportedEtfs.map((e) => {
      const factorResults = e.analysisCategoryFactorResults || [];
      return {
        id: e.id,
        symbol: e.symbol,
        name: e.name,
        exchange: e.exchange as AllExchanges,
        hasFinancialInfo: !!e.financialInfo,
        hasStockAnalyzerInfo: !!e.stockAnalyzerInfo,
        hasMorAnalyzerInfo: !!e.morAnalyzerInfo,
        hasMorRiskInfo: !!e.morRiskInfo,
        hasMorPeopleInfo: !!e.morPeopleInfo,
        hasMorPortfolioInfo: !!e.morPortfolioInfo,
        performanceAnalysisCount: factorResults.filter((r) => r.categoryKey === 'PerformanceAndReturns').length,
        costEfficiencyAnalysisCount: factorResults.filter((r) => r.categoryKey === 'CostEfficiencyAndTeam').length,
        riskAnalysisCount: factorResults.filter((r) => r.categoryKey === 'RiskAnalysis').length,
      };
    }),
    // totalCount comes from the DB query; UI can still show a correct pager even if we
    // filter out unsupported exchanges client-side.
    totalCount,
    page,
    limit,
    availableExchanges: availableExchanges.length ? availableExchanges : [...EXCHANGES],
  };
};

export const GET = withLoggedInAdmin<EtfReportsResponse>(getHandler);
