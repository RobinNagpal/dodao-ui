import { prisma } from '@/prisma';
import { extractCaptureRatioForPeriod, extractRiskLevelForPeriod, MOR_PERIODS, MorFieldKind, MorPeriodKey } from '@/utils/etf-filter-utils';
import {
  computeCategoricalStats,
  computeNumericStats,
  isNumericMorField,
  MOR_STATS_FIELDS,
  MorFieldStats,
  MorStatsByFieldByPeriod,
  MorStatsByPeriod,
} from '@/utils/etf-mor-stats-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

export interface MorStatsAllResponse {
  scope: 'all';
  totalEtfsWithMorRisk: number;
  stats: MorStatsByFieldByPeriod;
}

export interface MorStatsByFieldResponse {
  scope: 'field';
  field: MorFieldKind;
  totalEtfsWithMorRisk: number;
  stats: MorStatsByPeriod;
}

export interface MorStatsByFieldPeriodResponse {
  scope: 'field+period';
  field: MorFieldKind;
  period: MorPeriodKey;
  totalEtfsWithMorRisk: number;
  stats: MorFieldStats;
}

export type MorStatsResponse = MorStatsAllResponse | MorStatsByFieldResponse | MorStatsByFieldPeriodResponse;

function isValidField(v: string | null): v is MorFieldKind {
  return v === 'upside' || v === 'downside' || v === 'risk';
}

function isValidPeriod(v: string | null): v is MorPeriodKey {
  return v === '3-Yr' || v === '5-Yr' || v === '10-Yr';
}

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<MorStatsResponse> {
  const { spaceId } = await context.params;
  const { searchParams } = new URL(req.url);
  const fieldParam = searchParams.get('field');
  const periodParam = searchParams.get('period');

  if (fieldParam !== null && !isValidField(fieldParam)) {
    throw new Error(`Invalid field "${fieldParam}". Must be one of: upside, downside, risk`);
  }
  if (periodParam !== null && !isValidPeriod(periodParam)) {
    throw new Error(`Invalid period "${periodParam}". Must be one of: 3-Yr, 5-Yr, 10-Yr`);
  }

  const rows = await prisma.etfMorRiskInfo.findMany({
    where: { etf: { spaceId } },
    select: { riskPeriods: true },
  });

  const totalEtfsWithMorRisk = rows.length;

  const computeStatsFor = (field: MorFieldKind, period: MorPeriodKey): MorFieldStats => {
    if (isNumericMorField(field)) {
      const rowLabel = field;
      const values: Array<number | null> = rows.map((r) => extractCaptureRatioForPeriod(r.riskPeriods, period, rowLabel));
      return computeNumericStats(values, field, period);
    }
    const values: Array<string | null> = rows.map((r) => extractRiskLevelForPeriod(r.riskPeriods, period));
    return computeCategoricalStats(values, field, period);
  };

  if (fieldParam && periodParam) {
    return {
      scope: 'field+period',
      field: fieldParam,
      period: periodParam,
      totalEtfsWithMorRisk,
      stats: computeStatsFor(fieldParam, periodParam),
    };
  }

  if (fieldParam) {
    const byPeriod = {} as MorStatsByPeriod;
    for (const p of MOR_PERIODS) byPeriod[p] = computeStatsFor(fieldParam, p);
    return {
      scope: 'field',
      field: fieldParam,
      totalEtfsWithMorRisk,
      stats: byPeriod,
    };
  }

  const all = {} as MorStatsByFieldByPeriod;
  for (const f of MOR_STATS_FIELDS) {
    const byPeriod = {} as MorStatsByPeriod;
    for (const p of MOR_PERIODS) byPeriod[p] = computeStatsFor(f, p);
    all[f] = byPeriod;
  }
  return {
    scope: 'all',
    totalEtfsWithMorRisk,
    stats: all,
  };
}

export const GET = withErrorHandlingV2<MorStatsResponse>(getHandler);
