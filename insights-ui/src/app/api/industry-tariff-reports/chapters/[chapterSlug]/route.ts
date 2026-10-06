import { getReportContextBySlug, isValidTariffChapterSlug, readIndustryTariffReportBySlug } from '@/scripts/industry-tariff-reports/tariff-report-repository';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import type { ChapterRouteInfo } from '@/utils/tariff-reports/chapter-route-helpers';
import { notFoundError } from '@dodao/web-core/api/errors/notFoundError';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

export interface ChapterTariffReportResponse {
  chapter: ChapterRouteInfo;
  oldUrl: string | null;
  report: IndustryTariffReport;
  // ISO date strings (Date is not JSON-serializable). Consumed by the chapter
  // article footer to render the "Last updated by KoalaGains on …" line.
  createdAt: string;
  updatedAt: string;
}

async function getHandler(_req: NextRequest, { params }: { params: Promise<{ chapterSlug: string }> }): Promise<ChapterTariffReportResponse> {
  const { chapterSlug } = await params;
  // Reject slugs that can't be real chapter slugs (scanner probes) before any DB work.
  // The middleware logs the resulting 404 as a single warn line.
  if (!isValidTariffChapterSlug(chapterSlug)) {
    throw notFoundError(`[tariff] Rejected invalid chapter slug "${chapterSlug.slice(0, 100)}"`);
  }
  const [context, report] = await Promise.all([getReportContextBySlug(chapterSlug), readIndustryTariffReportBySlug(chapterSlug)]);

  return {
    chapter: {
      number: context.chapterNumber,
      title: context.chapterTitle,
      slug: context.slug,
    },
    oldUrl: context.oldUrl,
    report,
    createdAt: context.createdAt.toISOString(),
    updatedAt: context.updatedAt.toISOString(),
  };
}

export const GET = withErrorHandlingV2<ChapterTariffReportResponse>(getHandler);
