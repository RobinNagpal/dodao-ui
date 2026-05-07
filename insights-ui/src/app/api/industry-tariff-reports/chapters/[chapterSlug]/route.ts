import { getReportContextBySlug, readIndustryTariffReportBySlug } from '@/scripts/industry-tariff-reports/tariff-report-repository';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import type { ChapterRouteInfo } from '@/utils/tariff-reports/chapter-route-helpers';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

export interface ChapterTariffReportResponse {
  chapter: ChapterRouteInfo;
  oldUrl: string | null;
  report: IndustryTariffReport;
}

async function getHandler(_req: NextRequest, { params }: { params: Promise<{ chapterSlug: string }> }): Promise<ChapterTariffReportResponse> {
  const { chapterSlug } = await params;
  const [context, report] = await Promise.all([getReportContextBySlug(chapterSlug), readIndustryTariffReportBySlug(chapterSlug)]);

  return {
    chapter: {
      number: context.chapterNumber,
      title: context.chapterTitle,
      slug: context.slug,
    },
    oldUrl: context.oldUrl,
    report,
  };
}

export const GET = withErrorHandlingV2<ChapterTariffReportResponse>(getHandler);
