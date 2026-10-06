import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { parseHtsChapterNumberParam } from '@/utils/tariff-reports/tariff-input-validation';
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

async function getHandler(_req: NextRequest, dynamic: { params: Promise<{ number: string }> }): Promise<TariffChapterDetail | null> {
  // Malformed chapter numbers (scanner probes) → prefixed 404 before any DB work.
  const chapterNumber = parseHtsChapterNumberParam((await dynamic.params).number);

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
