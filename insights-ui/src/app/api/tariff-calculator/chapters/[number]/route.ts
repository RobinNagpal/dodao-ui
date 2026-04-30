import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { HtsCode } from '@prisma/client';
import { NextRequest } from 'next/server';

export interface TariffChapterDetail {
  id: string;
  number: number;
  title: string;
  notes: string | null;
  additionalUsNotes: string | null;
  section: {
    number: number;
    romanNumeral: string;
    title: string;
  };
  rows: HtsCode[];
}

function parseChapterNumber(raw: string): number | null {
  if (!/^\d{1,2}$/.test(raw)) return null;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1 || n > 99) return null;
  return n;
}

async function getHandler(_req: NextRequest, dynamic: { params: Promise<{ number: string }> }): Promise<TariffChapterDetail | null> {
  const { number: rawNumber } = await dynamic.params;
  const chapterNumber = parseChapterNumber(rawNumber);
  if (chapterNumber === null) return null;

  const chapter = await prisma.tariffChapter.findUnique({
    where: { spaceId_number: { spaceId: KoalaGainsSpaceId, number: chapterNumber } },
    include: { section: { select: { number: true, romanNumeral: true, title: true } } },
  });
  if (!chapter) return null;

  const rows = await prisma.htsCode.findMany({
    where: { chapterId: chapter.id },
    orderBy: { sortOrder: 'asc' },
  });

  return {
    id: chapter.id,
    number: chapter.number,
    title: chapter.title,
    notes: chapter.notes,
    additionalUsNotes: chapter.additionalUsNotes,
    section: chapter.section,
    rows,
  };
}

export const GET = withErrorHandlingV2<TariffChapterDetail | null>(getHandler);
