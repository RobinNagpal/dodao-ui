import { getTariffReportRefByChapterNumber, type TariffReportRef } from '@/utils/tariff-cross-links/hts-chapter-ref';
import { parseHtsChapterNumberParam } from '@/utils/tariff-reports/tariff-input-validation';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

export type { TariffReportRef };

async function getHandler(_req: NextRequest, dynamic: { params: Promise<{ number: string }> }): Promise<TariffReportRef | null> {
  // Malformed chapter numbers (scanner probes) → prefixed 404 before any DB work.
  return getTariffReportRefByChapterNumber(parseHtsChapterNumberParam((await dynamic.params).number));
}

export const GET = withErrorHandlingV2<TariffReportRef | null>(getHandler);
