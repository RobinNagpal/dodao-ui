import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { getTickerQuarterlyChartData } from '@/utils/ticker-v1-page-data';

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

async function getHandler(
  req: NextRequest,
  { params }: { params: Promise<{ spaceId: string; exchange: string; ticker: string }> }
): Promise<QuarterlyChartDataWrapper> {
  const { spaceId, exchange, ticker } = await params;
  return getTickerQuarterlyChartData(spaceId, exchange, ticker);
}

export const GET = withErrorHandlingV2<QuarterlyChartDataWrapper>(getHandler);
