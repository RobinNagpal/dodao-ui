import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Prisma } from '@prisma/client';

export interface TariffReportListingItem {
  slug: string;
  oldUrl: string | null;
  updatedAt: string;
  chapter: {
    number: number;
    title: string;
  };
}

const SEEDED_FILTER = { introduction: { not: Prisma.DbNull } } as const;

async function getHandler(): Promise<TariffReportListingItem[]> {
  const rows = await prisma.tariffChapterReport.findMany({
    where: { spaceId: KoalaGainsSpaceId, ...SEEDED_FILTER },
    select: { slug: true, oldUrl: true, updatedAt: true, chapter: { select: { number: true, title: true } } },
    orderBy: { chapter: { number: 'asc' } },
  });

  return rows.map((row) => ({
    slug: row.slug,
    oldUrl: row.oldUrl,
    updatedAt: row.updatedAt.toISOString(),
    chapter: row.chapter,
  }));
}

export const GET = withErrorHandlingV2<TariffReportListingItem[]>(getHandler);
