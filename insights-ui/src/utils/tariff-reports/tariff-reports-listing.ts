import 'server-only';
import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { TARIFF_REPORTS_LISTING_TAG } from '@/utils/tariff-report-tags';
import { Prisma } from '@prisma/client';
import { unstable_cache } from 'next/cache';

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
const WEEK_IN_SECONDS = 60 * 60 * 24 * 7;

async function fetchTariffReportsListing(): Promise<TariffReportListingItem[]> {
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

export const getTariffReportsListing = unstable_cache(fetchTariffReportsListing, ['tariff-reports-listing'], {
  revalidate: WEEK_IN_SECONDS,
  tags: [TARIFF_REPORTS_LISTING_TAG],
});
