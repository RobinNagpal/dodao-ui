import { withAdminOrToken } from '@/app/api/helpers/withAdminOrToken';
import { prisma } from '@/prisma';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { ReportType } from '@/types/ticker-typesv1';
import { calculatePendingSteps } from '@/utils/analysis-reports/report-steps-statuses';
import { TickerV1GenerationRequest } from '@prisma/client';
import { NextRequest } from 'next/server';

export interface TickerGenerationRequestByIdsResponseRow extends TickerV1GenerationRequest {
  ticker: { symbol: string; exchange: string; name: string };
  pendingSteps: ReportType[];
}

export interface TickerGenerationRequestsByIdsResponse {
  requests: TickerGenerationRequestByIdsResponseRow[];
  missingIds: string[];
}

async function getHandler(
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload | null,
  { params }: { params: Promise<{ spaceId: string }> }
): Promise<TickerGenerationRequestsByIdsResponse> {
  const { spaceId } = await params;
  const idsParam = req.nextUrl.searchParams.get('ids') ?? '';
  const ids = idsParam
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (ids.length === 0) {
    return { requests: [], missingIds: [] };
  }

  const rows = await prisma.tickerV1GenerationRequest.findMany({
    where: { spaceId, id: { in: ids } },
    include: { ticker: { select: { symbol: true, exchange: true, name: true } } },
  });

  const foundIds = new Set(rows.map((r) => r.id));
  const missingIds = ids.filter((id) => !foundIds.has(id));

  return {
    requests: rows.map((r) => ({ ...r, pendingSteps: calculatePendingSteps(r) })),
    missingIds,
  };
}

export const GET = withAdminOrToken<TickerGenerationRequestsByIdsResponse>(getHandler);
