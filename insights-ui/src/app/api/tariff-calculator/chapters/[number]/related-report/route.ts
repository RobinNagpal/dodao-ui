import { getTariffReportRefByChapterNumber, type TariffReportRef } from '@/utils/tariff-cross-links/hts-chapter-ref';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

export type { TariffReportRef };

function parseChapterNumber(raw: string): number | null {
  if (!/^\d{1,2}$/.test(raw)) return null;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1 || n > 99) return null;
  return n;
}

async function getHandler(_req: NextRequest, dynamic: { params: Promise<{ number: string }> }): Promise<TariffReportRef | null> {
  const { number: rawNumber } = await dynamic.params;
  const chapterNumber = parseChapterNumber(rawNumber);
  if (chapterNumber === null) return null;
  return getTariffReportRefByChapterNumber(chapterNumber);
}

export const GET = withErrorHandlingV2<TariffReportRef | null>(getHandler);
