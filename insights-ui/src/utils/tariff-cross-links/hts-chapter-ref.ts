import 'server-only';
import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { chapterDetailHref } from '@/utils/tariff-calculator/chapter-slug';
import { chapterCoverHref } from '@/utils/tariff-reports/chapter-route-helpers';
import { Prisma } from '@prisma/client';
import { unstable_cache } from 'next/cache';

export interface HtsChapterRef {
  chapterNumber: number;
  sectionNumber: number;
  chapterTitle: string;
  href: string;
}

const WEEK_IN_SECONDS = 60 * 60 * 24 * 7;
const HTS_CHAPTER_REFS_TAG = 'hts-chapter-refs';

async function fetchHtsChapterByNumber(chapterNumber: number): Promise<HtsChapterRef | null> {
  const chapter = await prisma.tariffChapter.findUnique({
    where: { spaceId_number: { spaceId: KoalaGainsSpaceId, number: chapterNumber } },
    select: { number: true, title: true, section: { select: { number: true } } },
  });
  if (!chapter) return null;
  return {
    chapterNumber: chapter.number,
    sectionNumber: chapter.section.number,
    chapterTitle: chapter.title,
    href: chapterDetailHref(chapter.section.number, chapter.number, chapter.title),
  };
}

async function fetchHtsChapterByIndustryId(industryId: string): Promise<HtsChapterRef | null> {
  const row = await prisma.tariffChapterReport.findFirst({
    where: { spaceId: KoalaGainsSpaceId, oldUrl: industryId },
    select: { chapter: { select: { number: true, title: true, section: { select: { number: true } } } } },
  });
  if (!row?.chapter) return null;
  return {
    chapterNumber: row.chapter.number,
    sectionNumber: row.chapter.section.number,
    chapterTitle: row.chapter.title,
    href: chapterDetailHref(row.chapter.section.number, row.chapter.number, row.chapter.title),
  };
}

export const getHtsChapterRefByNumber = unstable_cache(fetchHtsChapterByNumber, ['hts-chapter-ref-by-number'], {
  revalidate: WEEK_IN_SECONDS,
  tags: [HTS_CHAPTER_REFS_TAG],
});

export const getHtsChapterRefByIndustryId = unstable_cache(fetchHtsChapterByIndustryId, ['hts-chapter-ref-by-industry'], {
  revalidate: WEEK_IN_SECONDS,
  tags: [HTS_CHAPTER_REFS_TAG],
});

export interface TariffReportRef {
  href: string;
  chapterTitle: string;
  chapterNumber: number;
  isIndustryUrl: boolean;
}

const SEEDED_REPORT_FILTER = { introduction: { not: Prisma.DbNull } } as const;

async function fetchTariffReportRefByChapterNumber(chapterNumber: number): Promise<TariffReportRef | null> {
  const row = await prisma.tariffChapterReport.findFirst({
    where: { spaceId: KoalaGainsSpaceId, chapter: { number: chapterNumber }, ...SEEDED_REPORT_FILTER },
    select: { slug: true, oldUrl: true, chapter: { select: { number: true, title: true } } },
  });
  if (!row) return null;
  return {
    href: row.oldUrl ? `/industry-tariff-report/${row.oldUrl}` : chapterCoverHref(row.slug),
    chapterTitle: row.chapter.title,
    chapterNumber: row.chapter.number,
    isIndustryUrl: Boolean(row.oldUrl),
  };
}

export const getTariffReportRefByChapterNumber = unstable_cache(fetchTariffReportRefByChapterNumber, ['tariff-report-ref-by-chapter-number'], {
  revalidate: WEEK_IN_SECONDS,
  tags: [HTS_CHAPTER_REFS_TAG],
});
