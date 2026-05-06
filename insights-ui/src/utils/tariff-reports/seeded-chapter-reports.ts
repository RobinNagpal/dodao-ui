import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { Prisma } from '@prisma/client';

export interface SeededChapterReport {
  chapterNumber: number;
  slug: string;
  oldUrl: string | null;
  updatedAt: Date;
}

// A row counts as "seeded" when its cover (introduction) JSON has been written. Slug-only rows
// inserted for chapters with no industry mapping carry a NULL introduction and are excluded.
const SEEDED_FILTER = { introduction: { not: Prisma.DbNull } } as const;

export async function getSeededChapterReports(): Promise<SeededChapterReport[]> {
  const rows = await prisma.tariffChapterReport.findMany({
    where: { spaceId: KoalaGainsSpaceId, ...SEEDED_FILTER },
    select: { slug: true, oldUrl: true, updatedAt: true, chapter: { select: { number: true } } },
  });
  return rows
    .map((r) => ({ chapterNumber: r.chapter.number, slug: r.slug, oldUrl: r.oldUrl, updatedAt: r.updatedAt }))
    .sort((a, b) => a.chapterNumber - b.chapterNumber);
}

export async function getSeededLastModifiedByOldUrl(): Promise<Record<string, string>> {
  const rows = await prisma.tariffChapterReport.findMany({
    where: { spaceId: KoalaGainsSpaceId, oldUrl: { not: null }, ...SEEDED_FILTER },
    select: { oldUrl: true, updatedAt: true },
  });
  return Object.fromEntries(rows.filter((r) => r.oldUrl).map((r) => [r.oldUrl as string, r.updatedAt.toISOString()]));
}

export async function getSeededLastModifiedForOldUrl(oldUrl: string): Promise<string | null> {
  const row = await prisma.tariffChapterReport.findUnique({
    where: { spaceId_oldUrl: { spaceId: KoalaGainsSpaceId, oldUrl } },
    select: { updatedAt: true, introduction: true },
  });
  if (!row || row.introduction === null) return null;
  return row.updatedAt.toISOString();
}
