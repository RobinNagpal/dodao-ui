import { prisma } from '@/prisma';
import type { TariffReportSeoDetails } from '@/scripts/industry-tariff-reports/tariff-types';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

export interface ChapterSeoResponse {
  seoDetails: TariffReportSeoDetails | null;
}

async function getHandler(req: NextRequest, { params }: { params: Promise<{ chapterSlug: string }> }): Promise<ChapterSeoResponse> {
  const { chapterSlug } = await params;
  const row = await prisma.tariffChapterReport.findUnique({
    where: { spaceId_slug: { spaceId: KoalaGainsSpaceId, slug: chapterSlug } },
    select: { seoDetails: true },
  });
  return { seoDetails: (row?.seoDetails as TariffReportSeoDetails | null) ?? null };
}

export const GET = withErrorHandlingV2<ChapterSeoResponse>(getHandler);
