import { withAdminOrToken } from '@/app/api/helpers/withAdminOrToken';
import { prisma } from '@/prisma';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { EtfReportType } from '@/types/etf/etf-analysis-types';
import { calculateEtfPendingSteps } from '@/utils/etf-analysis-reports/etf-report-steps-statuses';
import { EtfGenerationRequest } from '@prisma/client';
import { NextRequest } from 'next/server';

export interface EtfGenerationRequestByIdsResponseRow extends EtfGenerationRequest {
  etf: { symbol: string; exchange: string; name: string };
  pendingSteps: EtfReportType[];
}

export interface EtfGenerationRequestsByIdsResponse {
  requests: EtfGenerationRequestByIdsResponseRow[];
  missingIds: string[];
}

async function getHandler(
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload | null,
  { params }: { params: Promise<{ spaceId: string }> }
): Promise<EtfGenerationRequestsByIdsResponse> {
  const { spaceId } = await params;
  const idsParam = req.nextUrl.searchParams.get('ids') ?? '';
  const ids = idsParam
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (ids.length === 0) {
    return { requests: [], missingIds: [] };
  }

  const rows = await prisma.etfGenerationRequest.findMany({
    where: { spaceId, id: { in: ids } },
    include: { etf: { select: { symbol: true, exchange: true, name: true } } },
  });

  const foundIds = new Set(rows.map((r) => r.id));
  const missingIds = ids.filter((id) => !foundIds.has(id));

  return {
    requests: rows.map((r) => ({ ...r, pendingSteps: calculateEtfPendingSteps(r) })),
    missingIds,
  };
}

export const GET = withAdminOrToken<EtfGenerationRequestsByIdsResponse>(getHandler);
