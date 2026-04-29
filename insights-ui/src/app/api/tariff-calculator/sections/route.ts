import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withLoggedInAdmin } from '../../helpers/withLoggedInAdmin';

// Idempotent upsert of HTSUS sections (1..22 / I..XXII) and the chapters
// that belong to each. Source of truth is the public list at
// https://hts.usitc.gov/. The body shape mirrors that page: each section
// row contains its arabic number, roman numeral, title, and the chapter
// rows nested under it. Re-running the route with the same payload is a
// no-op for unchanged rows; titles can be edited and will overwrite.

const chapterInputSchema = z.object({
  number: z.number().int().min(1).max(99),
  title: z.string().trim().min(1),
});

const sectionInputSchema = z.object({
  number: z.number().int().min(1).max(22),
  romanNumeral: z
    .string()
    .trim()
    .regex(/^[IVX]+$/, 'romanNumeral must be uppercase Roman numerals (I, II, ..., XXII)'),
  title: z.string().trim().min(1),
  notes: z.string().optional(),
  chapters: z.array(chapterInputSchema).min(1),
});

const upsertBodySchema = z.object({
  sections: z.array(sectionInputSchema).min(1),
});

export type UpsertTariffSectionsRequest = z.infer<typeof upsertBodySchema>;

export interface UpsertTariffSectionsResponse {
  sections: { number: number; action: 'created' | 'updated'; chapters: { number: number; action: 'created' | 'updated' }[] }[];
  totalSections: number;
  totalChapters: number;
}

async function postHandler(request: NextRequest, _userContext: KoalaGainsJwtTokenPayload): Promise<UpsertTariffSectionsResponse> {
  const body = upsertBodySchema.parse(await request.json());

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

export const POST = withLoggedInAdmin<UpsertTariffSectionsResponse>(postHandler);
