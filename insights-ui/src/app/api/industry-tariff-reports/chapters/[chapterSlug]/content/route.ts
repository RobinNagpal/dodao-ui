import { withLoggedInAdmin } from '@/app/api/helpers/withLoggedInAdmin';
import {
  readIndustryTariffReportBySlug,
  writeExecutiveSummary,
  writeFinalConclusion,
  writeIndustryAreaSection,
  writeReportCover,
  writeTariffEngineering,
  writeTariffUpdates,
  writeUnderstandIndustry,
} from '@/scripts/industry-tariff-reports/tariff-report-repository';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import type { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { invalidateCloudFrontPaths } from '@/utils/cloudfront-cache-utils';
import { CHAPTER_EDIT_FIELDS, type EditableReportContent, type EditableReportField } from '@/utils/tariff-reports/chapter-edit-fields';
import { chapterCoverHref, chapterSectionHref } from '@/utils/tariff-reports/chapter-route-helpers';
import { validateTariffChapterSlug } from '@/utils/tariff-reports/tariff-input-validation';
import { badRequestError } from '@dodao/web-core/api/errors/badRequestError';
import { NextRequest } from 'next/server';

export interface UpdateChapterContentRequest {
  // 'overview' or a chapter section slug — limits which fields this request may overwrite.
  page: string;
  content: EditableReportContent;
}

const WRITERS: { [K in EditableReportField]: (slug: string, value: NonNullable<EditableReportContent[K]>) => Promise<void> } = {
  reportCover: writeReportCover,
  executiveSummary: writeExecutiveSummary,
  tariffUpdates: writeTariffUpdates,
  understandIndustry: writeUnderstandIndustry,
  industryAreasSections: writeIndustryAreaSection,
  finalConclusion: writeFinalConclusion,
  tariffEngineering: writeTariffEngineering,
};

// Admin hand-edit of a chapter page's content. Each writer revalidates the chapter's Next.js cache
// tags; the edge is purged here for just the edited page (plus the cover, which also renders a
// tariff-updates summary) so the change is visible immediately without a wildcard purge.
async function putHandler(
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload,
  { params }: { params: Promise<{ chapterSlug: string }> }
): Promise<IndustryTariffReport> {
  const chapterSlug = validateTariffChapterSlug((await params).chapterSlug);
  const { page, content } = (await req.json()) as UpdateChapterContentRequest;
  const fields = CHAPTER_EDIT_FIELDS[page];
  if (!fields) throw badRequestError(`Unknown chapter page ${JSON.stringify(String(page).slice(0, 100))}`);

  for (const field of fields) {
    const value = content?.[field];
    if (value) await (WRITERS[field] as (slug: string, v: typeof value) => Promise<void>)(chapterSlug, value);
  }

  const coverPath = chapterCoverHref(chapterSlug);
  invalidateCloudFrontPaths(
    page === 'overview' ? [coverPath] : page === 'tariff-updates' ? [chapterSectionHref(chapterSlug, page), coverPath] : [chapterSectionHref(chapterSlug, page)]
  );

  return readIndustryTariffReportBySlug(chapterSlug);
}

export const PUT = withLoggedInAdmin<IndustryTariffReport>(putHandler);
