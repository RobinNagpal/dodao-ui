import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';

// Chapter detail used by /hts-codes/us/[chapter]/[slug] — returns the
// chapter + its parent section + every HTSUS row in CSV order. Returns
// null when the chapter number is invalid or no row exists for it; the
// page renders notFound() in that case.

export type TariffChapterRow = Prisma.HtsCodeGetPayload<{
  select: {
    id: true;
    htsNumber: true;
    htsCode10: true;
    indent: true;
    description: true;
    unitOfQuantity: true;
    generalRateOfDuty: true;
    specialRateOfDuty: true;
    column2RateOfDuty: true;
    quotaQuantity: true;
    additionalDuties: true;
  };
}>;

type ChapterWithSection = Prisma.TariffChapterGetPayload<{
  select: {
    id: true;
    number: true;
    title: true;
    notes: true;
    additionalUsNotes: true;
    section: { select: { number: true; romanNumeral: true; title: true } };
  };
}>;

export type TariffChapterDetail = ChapterWithSection & { rows: TariffChapterRow[] };

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
    select: {
      id: true,
      number: true,
      title: true,
      notes: true,
      additionalUsNotes: true,
      section: { select: { number: true, romanNumeral: true, title: true } },
    },
  });
  if (!chapter) return null;

  const rows = await prisma.htsCode.findMany({
    where: { chapterId: chapter.id },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      htsNumber: true,
      htsCode10: true,
      indent: true,
      description: true,
      unitOfQuantity: true,
      generalRateOfDuty: true,
      specialRateOfDuty: true,
      column2RateOfDuty: true,
      quotaQuantity: true,
      additionalDuties: true,
    },
  });

  return { ...chapter, rows };
}

export const GET = withErrorHandlingV2<TariffChapterDetail | null>(getHandler);
