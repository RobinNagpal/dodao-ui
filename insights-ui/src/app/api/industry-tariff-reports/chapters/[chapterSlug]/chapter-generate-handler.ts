import { isSyncTariffGenerationEnabled, startTariffSectionGeneration } from '@/scripts/industry-tariff-reports/tariff-generation-runner';
import { readIndustryTariffReportBySlug } from '@/scripts/industry-tariff-reports/tariff-report-repository';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import type { ChapterReportField } from '@/utils/tariff-reports/chapter-generate-sections';
import { NextRequest } from 'next/server';

async function parseBody(req: NextRequest): Promise<unknown> {
  if (!req.headers.get('content-length')) return {};
  try {
    return await req.json();
  } catch {
    return {};
  }
}

// Returned when the section was kicked off in the BACKGROUND (env flag on); the
// generated content lands in the DB when the task finishes (the admin table's
// Refresh button re-reads it).
export interface ChapterGenerateStartedResponse {
  status: 'started';
  section: ChapterReportField;
}

// Either shape, depending on the env flag: the full report (synchronous) or a
// "started" ack (background).
export type ChapterGenerateResponse = IndustryTariffReport | ChapterGenerateStartedResponse;

// Shared handler used by every `/api/industry-tariff-reports/chapters/[chapterSlug]/generate-*` route.
//
// `GENERATE_TARIFF_SECTIONS_SYNCHRONOUSLY` gates HOW the section is generated:
//   - flag OFF/unset → run `generate` in the BACKGROUND (return immediately, no
//                504); the content lands in the DB when the task finishes —
//                admin refreshes to see it. This is the default.
//   - flag ON  → run `generate` SYNCHRONOUSLY and return the full report — the
//                original behavior (the request waits for the LLM call).
//
// `section` is the JSONB column the generator populates.
export function chapterGenerateRoute(
  section: ChapterReportField,
  generate: (slug: string, body: unknown) => Promise<void>
): (req: NextRequest, ctx: { params: Promise<{ chapterSlug: string }> }) => Promise<ChapterGenerateResponse> {
  return async (req, { params }) => {
    const { chapterSlug } = await params;
    if (!chapterSlug) throw new Error('chapterSlug is required');

    const body = await parseBody(req);

    if (isSyncTariffGenerationEnabled()) {
      await generate(chapterSlug, body);
      return readIndustryTariffReportBySlug(chapterSlug);
    }

    startTariffSectionGeneration(chapterSlug, section, () => generate(chapterSlug, body));
    return { status: 'started', section };
  };
}
