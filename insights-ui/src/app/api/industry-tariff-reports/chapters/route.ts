import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { CHAPTER_GENERATE_STEPS, ChapterReportField } from '@/utils/tariff-reports/chapter-generate-sections';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

export interface ChapterReportAdminRow {
  slug: string;
  oldUrl: string | null;
  chapter: { number: number; title: string };
  updatedAt: string;
  // Per-field populated flag — keyed by JSONB column name, matches `ChapterReportField`.
  fields: Record<ChapterReportField, boolean>;
}

export interface ChapterReportAdminListResponse {
  rows: ChapterReportAdminRow[];
}

const CHAPTER_FIELDS = CHAPTER_GENERATE_STEPS.map((s) => s.field);

async function getHandler(): Promise<ChapterReportAdminListResponse> {
  const rows = await prisma.tariffChapterReport.findMany({
    where: { spaceId: KoalaGainsSpaceId },
    select: {
      slug: true,
      oldUrl: true,
      updatedAt: true,
      chapter: { select: { number: true, title: true } },
      industryAreas: true,
      introduction: true,
      executiveSummary: true,
      tariffUpdates: true,
      understandIndustry: true,
      industryAreasSections: true,
      conclusion: true,
      tariffEngineering: true,
      seoDetails: true,
    },
    orderBy: { chapter: { number: 'asc' } },
  });

  const out: ChapterReportAdminRow[] = rows.map((row) => {
    const fields = Object.fromEntries(CHAPTER_FIELDS.map((field) => [field, row[field] != null])) as Record<ChapterReportField, boolean>;
    return {
      slug: row.slug,
      oldUrl: row.oldUrl,
      chapter: row.chapter,
      updatedAt: row.updatedAt.toISOString(),
      fields,
    };
  });

  return { rows: out };
}

export const GET = withErrorHandlingV2<ChapterReportAdminListResponse>(getHandler);
