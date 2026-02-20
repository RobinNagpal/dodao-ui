import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { NextRequest } from 'next/server';
import { IncomeQuarterlyData, IncomeAnnualData, BaseFinancialPeriod } from '@/types/prismaTypes';
import { ensureStockAnalyzerDataIsFresh } from '@/utils/stock-analyzer-scraper-utils';

export type ChartMetricType = 'revenue' | 'grossMargin' | 'ebit' | 'freeCashFlow' | 'eps' | 'sharesOutstanding';

export interface QuarterlyDataPoint {
  quarter: string;
  value: number | null;
}

export interface QuarterlyChartDataResponse {
  meta: {
    currency: string | null;
    unit: string | null;
    fiscalYearNote: string | null;
  };
  availableMetrics: ChartMetricType[];
  data: Record<ChartMetricType, QuarterlyDataPoint[]>;
  dataFrequency: 'quarterly' | 'annual';
}

export interface QuarterlyChartDataWrapper {
  chartData: QuarterlyChartDataResponse | null;
}

function extractMetricValue(period: BaseFinancialPeriod, metric: ChartMetricType): number | null {
  const values = period.values;
  if (!values) return null;

  switch (metric) {
    case 'revenue':
      return extractNumericValue(values.revenue) ?? extractNumericValue(values.totalRevenue);
    case 'grossMargin':
      return extractNumericValue(values.grossMargin);
    case 'ebit':
      return extractNumericValue(values.ebit);
    case 'freeCashFlow':
      return extractNumericValue(values.freeCashFlow);
    case 'eps':
      return extractNumericValue(values.eps);
    case 'sharesOutstanding':
      return extractNumericValue(values.sharesOutstanding) ?? extractNumericValue(values.basicSharesOutstanding);
    default:
      return null;
  }
}

function extractNumericValue(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[,%]/g, '').trim();
    const num = parseFloat(cleaned);
    return Number.isFinite(num) ? num : null;
  }
  return null;
}

function checkMetricAvailability(periods: BaseFinancialPeriod[], metric: ChartMetricType): boolean {
  return periods.some((period) => extractMetricValue(period, metric) !== null);
}

function buildChartResponse(
  periods: BaseFinancialPeriod[],
  periodLabels: string[],
  meta: { currency?: string; unit?: string; fiscalYearNote?: string },
  dataFrequency: 'quarterly' | 'annual'
): QuarterlyChartDataResponse | null {
  const allMetrics: ChartMetricType[] = ['revenue', 'grossMargin', 'ebit', 'freeCashFlow', 'eps', 'sharesOutstanding'];
  const availableMetrics = allMetrics.filter((metric) => checkMetricAvailability(periods, metric));

  if (availableMetrics.length === 0) {
    return null;
  }

  const data: Record<ChartMetricType, QuarterlyDataPoint[]> = {} as Record<ChartMetricType, QuarterlyDataPoint[]>;
  for (const metric of allMetrics) {
    data[metric] = periods.map((period, idx) => ({
      quarter: periodLabels[idx],
      value: extractMetricValue(period, metric),
    }));
  }

  return {
    meta: {
      currency: meta.currency || null,
      unit: meta.unit || null,
      fiscalYearNote: meta.fiscalYearNote || null,
    },
    availableMetrics,
    data,
    dataFrequency,
  };
}

async function getHandler(
  req: NextRequest,
  { params }: { params: Promise<{ spaceId: string; exchange: string; ticker: string }> }
): Promise<QuarterlyChartDataWrapper> {
  const { spaceId, exchange, ticker } = await params;
  const e = exchange?.toUpperCase()?.trim();
  const t = ticker?.toUpperCase()?.trim();

  if (!t || !e) {
    return { chartData: null };
  }

  try {
    const tickerRecord = await prisma.tickerV1.findFirstOrThrow({
      where: {
        spaceId,
        symbol: t,
        exchange: e,
      },
      include: {
        stockAnalyzerScrapperInfo: true,
      },
    });

    const scraperInfo = await ensureStockAnalyzerDataIsFresh(tickerRecord);

    // Try quarterly data first
    const incomeQuarterlyData = scraperInfo.incomeStatementQuarter as IncomeQuarterlyData | null;
    if (incomeQuarterlyData?.periods && incomeQuarterlyData.periods.length > 0) {
      const sortedPeriods = [...incomeQuarterlyData.periods].sort((a, b) => {
        const parseQuarter = (q: string) => {
          const match = q.match(/Q(\d)\s+(\d{4})/);
          if (!match) return 0;
          return parseInt(match[2]) * 4 + parseInt(match[1]);
        };
        return parseQuarter(a.fiscalQuarter) - parseQuarter(b.fiscalQuarter);
      });
      const labels = sortedPeriods.map((p) => p.fiscalQuarter);
      const chartData = buildChartResponse(sortedPeriods, labels, incomeQuarterlyData.meta || {}, 'quarterly');
      if (chartData) {
        return { chartData };
      }
    }

    // Fall back to annual data
    const incomeAnnualData = scraperInfo.incomeStatementAnnual as IncomeAnnualData | null;
    if (incomeAnnualData?.periods && incomeAnnualData.periods.length > 0) {
      const sortedPeriods = [...incomeAnnualData.periods].sort((a, b) => a.fiscalYear.localeCompare(b.fiscalYear));
      const labels = sortedPeriods.map((p) => p.fiscalYear);
      const chartData = buildChartResponse(sortedPeriods, labels, incomeAnnualData.meta || {}, 'annual');
      if (chartData) {
        return { chartData };
      }
    }

    return { chartData: null };
  } catch (error) {
    console.error(`Error fetching quarterly chart data for ${t}:`, error);
    return { chartData: null };
  }
}

export const GET = withErrorHandlingV2<QuarterlyChartDataWrapper>(getHandler);
