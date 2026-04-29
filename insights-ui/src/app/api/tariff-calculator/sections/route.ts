import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { withLoggedInAdmin } from '../../helpers/withLoggedInAdmin';

// HTSUS sections (I..XXII) and their chapters. The GET response is the
// shape consumed by the public /hts-codes index page; POST is an admin-only
// idempotent upsert that mirrors the section/chapter list at hts.usitc.gov.

export interface TariffSectionListItem {
  id: string;
  number: number;
  romanNumeral: string;
  title: string;
  chapters: { id: string; number: number; title: string }[];
}

export interface UpsertTariffSectionsResponse {
  sections: { number: number; action: 'created' | 'updated'; chapters: { number: number; action: 'created' | 'updated' }[] }[];
  totalSections: number;
  totalChapters: number;
}

export interface UpsertTariffSectionsRequest {
  sections: SectionInput[];
}

interface ChapterInput {
  number: number;
  title: string;
}

interface SectionInput {
  number: number;
  romanNumeral: string;
  title: string;
  notes?: string;
  chapters: ChapterInput[];
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateChapter(raw: unknown, sectionNumber: number, idx: number): ChapterInput {
  if (!isObject(raw)) throw new Error(`section ${sectionNumber} chapters[${idx}] must be an object`);
  const { number, title } = raw;
  if (typeof number !== 'number' || !Number.isInteger(number) || number < 1 || number > 99) {
    throw new Error(`section ${sectionNumber} chapters[${idx}].number must be an integer between 1 and 99`);
  }
  if (typeof title !== 'string' || title.trim().length === 0) {
    throw new Error(`section ${sectionNumber} chapters[${idx}].title must be a non-empty string`);
  }
  return { number, title: title.trim() };
}

function validateSection(raw: unknown, idx: number): SectionInput {
  if (!isObject(raw)) throw new Error(`sections[${idx}] must be an object`);
  const { number, romanNumeral, title, notes, chapters } = raw;
  if (typeof number !== 'number' || !Number.isInteger(number) || number < 1 || number > 22) {
    throw new Error(`sections[${idx}].number must be an integer between 1 and 22`);
  }
  if (typeof romanNumeral !== 'string' || !/^[IVX]+$/.test(romanNumeral.trim())) {
    throw new Error(`sections[${idx}].romanNumeral must be uppercase Roman numerals (I, II, ..., XXII)`);
  }
  if (typeof title !== 'string' || title.trim().length === 0) {
    throw new Error(`sections[${idx}].title must be a non-empty string`);
  }
  if (notes !== undefined && notes !== null && typeof notes !== 'string') {
    throw new Error(`sections[${idx}].notes must be a string when provided`);
  }
  if (!Array.isArray(chapters) || chapters.length === 0) {
    throw new Error(`sections[${idx}].chapters must be a non-empty array`);
  }
  return {
    number,
    romanNumeral: romanNumeral.trim(),
    title: title.trim(),
    notes: typeof notes === 'string' ? notes : undefined,
    chapters: chapters.map((c, ci) => validateChapter(c, number, ci)),
  };
}

function validateUpsertBody(raw: unknown): UpsertTariffSectionsRequest {
  if (!isObject(raw)) throw new Error('Request body must be an object');
  const { sections } = raw;
  if (!Array.isArray(sections) || sections.length === 0) {
    throw new Error('sections must be a non-empty array');
  }
  return { sections: sections.map((s, i) => validateSection(s, i)) };
}

async function getHandler(): Promise<TariffSectionListItem[]> {
  const sections = await prisma.tariffSection.findMany({
    where: { spaceId: KoalaGainsSpaceId },
    orderBy: { number: 'asc' },
    select: {
      id: true,
      number: true,
      romanNumeral: true,
      title: true,
      chapters: {
        orderBy: { number: 'asc' },
        select: { id: true, number: true, title: true },
      },
    },
  });
  return sections;
}

async function postHandler(request: NextRequest, _userContext: KoalaGainsJwtTokenPayload): Promise<UpsertTariffSectionsResponse> {
  const body = validateUpsertBody(await request.json());

  // Catch duplicate chapter numbers across the whole payload up-front so
  // we don't half-write before failing on a unique-constraint violation.
  const seenChapterNumbers = new Set<number>();
  for (const section of body.sections) {
    for (const chapter of section.chapters) {
      if (seenChapterNumbers.has(chapter.number)) {
        throw new Error(`Duplicate chapter number ${chapter.number} in payload`);
      }
      seenChapterNumbers.add(chapter.number);
    }
  }

  const results: UpsertTariffSectionsResponse['sections'] = [];
  let totalChapters = 0;

  for (const sectionInput of body.sections) {
    const existingSection = await prisma.tariffSection.findUnique({
      where: { spaceId_number: { spaceId: KoalaGainsSpaceId, number: sectionInput.number } },
    });
    const section = existingSection
      ? await prisma.tariffSection.update({
          where: { id: existingSection.id },
          data: { romanNumeral: sectionInput.romanNumeral, title: sectionInput.title, notes: sectionInput.notes ?? existingSection.notes },
        })
      : await prisma.tariffSection.create({
          data: {
            spaceId: KoalaGainsSpaceId,
            number: sectionInput.number,
            romanNumeral: sectionInput.romanNumeral,
            title: sectionInput.title,
            notes: sectionInput.notes,
          },
        });

    const chapterResults: { number: number; action: 'created' | 'updated' }[] = [];
    for (const chapterInput of sectionInput.chapters) {
      const existingChapter = await prisma.tariffChapter.findUnique({
        where: { spaceId_number: { spaceId: KoalaGainsSpaceId, number: chapterInput.number } },
      });
      if (existingChapter) {
        await prisma.tariffChapter.update({
          where: { id: existingChapter.id },
          data: { title: chapterInput.title, sectionId: section.id },
        });
        chapterResults.push({ number: chapterInput.number, action: 'updated' });
      } else {
        await prisma.tariffChapter.create({
          data: {
            spaceId: KoalaGainsSpaceId,
            number: chapterInput.number,
            title: chapterInput.title,
            sectionId: section.id,
          },
        });
        chapterResults.push({ number: chapterInput.number, action: 'created' });
      }
      totalChapters++;
    }

    results.push({ number: section.number, action: existingSection ? 'updated' : 'created', chapters: chapterResults });
  }

  return {
    sections: results,
    totalSections: results.length,
    totalChapters,
  };
}

export const GET = withErrorHandlingV2<TariffSectionListItem[]>(getHandler);
export const POST = withLoggedInAdmin<UpsertTariffSectionsResponse>(postHandler);
