import { getReportContextBySlug, readIndustryTariffReportBySlug } from '@/scripts/industry-tariff-reports/tariff-report-repository';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import type { ChapterRouteInfo } from '@/utils/tariff-reports/chapter-route-helpers';
import { validateTariffChapterSlug } from '@/utils/tariff-reports/tariff-input-validation';
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
  // Malformed slugs (scanner probes) are rejected before any DB work: a prefixed 404 the middleware
  // logs as a single warn line. A well-formed but unknown slug 404s from getReportContextBySlug.
  const chapterSlug = validateTariffChapterSlug((await params).chapterSlug);
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
