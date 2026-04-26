import { withAdminOrToken } from '@/app/api/helpers/withAdminOrToken';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { ReportType } from '@/types/ticker-typesv1';
import { getOldestStocksByReportType, OldestReportRow, SUPPORTED_OLDEST_REPORT_TYPES } from '@/utils/oldest-reports-utils';
import { NextRequest } from 'next/server';

export interface OldestStocksByReportTypeResponse {
  reportType: ReportType;
  limit: number;
  items: OldestReportRow[];
}

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 100;

function parseLimit(raw: string | null): number {
  if (!raw) return DEFAULT_LIMIT;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid limit "${raw}" — must be a positive integer.`);
  }
  return Math.min(parsed, MAX_LIMIT);
}

function parseReportType(raw: string | null): ReportType {
  if (!raw) {
    throw new Error(`Missing required query param "reportType". Supported values: ${SUPPORTED_OLDEST_REPORT_TYPES.join(', ')}`);
  }
  const matched = SUPPORTED_OLDEST_REPORT_TYPES.find((t) => t === raw);
  if (!matched) {
    throw new Error(`Unsupported reportType "${raw}". Supported values: ${SUPPORTED_OLDEST_REPORT_TYPES.join(', ')}`);
  }
  return matched;
}

async function getHandler(
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload | null,
  { params }: { params: Promise<{ spaceId: string }> }
): Promise<OldestStocksByReportTypeResponse> {
  const { spaceId } = await params;
  const { searchParams } = req.nextUrl;
  const reportType = parseReportType(searchParams.get('reportType'));
  const limit = parseLimit(searchParams.get('limit'));

  const items = await getOldestStocksByReportType(spaceId, reportType, limit);
  return { reportType, limit, items };
}

export const GET = withAdminOrToken<OldestStocksByReportTypeResponse>(getHandler);
