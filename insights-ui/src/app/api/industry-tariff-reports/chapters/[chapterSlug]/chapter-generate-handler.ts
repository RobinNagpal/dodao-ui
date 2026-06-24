import { isLambdaTariffGenerationEnabled, startTariffSectionGeneration } from '@/scripts/industry-tariff-reports/tariff-generation-runner';
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

// Returned when the section was kicked off in the BACKGROUND (env flag on);
// progress is tracked on `section_status` (read via the `section-status` route
// / the admin table's Refresh button).
export interface ChapterGenerateStartedResponse {
  status: 'started';
  section: ChapterReportField;
}

// Either shape, depending on the env flag: the full report (synchronous) or a
// "started" ack (background).
export type ChapterGenerateResponse = IndustryTariffReport | ChapterGenerateStartedResponse;

// Shared handler used by every `/api/industry-tariff-reports/chapters/[chapterSlug]/generate-*` route.
//
// `USE_LAMBDA_FOR_TARIFF_LLM_RESPONSE` gates HOW the section is generated:
//   - flag ON  → run `generate` in the BACKGROUND (return immediately, no 504);
//                progress lands on `section_status`, admin refreshes to see it.
//   - flag OFF → run `generate` SYNCHRONOUSLY and return the full report — the
//                original behavior (the request waits for the LLM call).
//
// `section` is the JSONB column the generator populates and the key its status
// is tracked under in background mode.
export function chapterGenerateRoute(
  section: ChapterReportField,
  generate: (slug: string, body: unknown) => Promise<void>,
): (req: NextRequest, ctx: { params: Promise<{ chapterSlug: string }> }) => Promise<ChapterGenerateResponse> {
  return async (req, { params }) => {
    const { chapterSlug } = await params;
    if (!chapterSlug) throw new Error('chapterSlug is required');

    const body = await parseBody(req);

    if (isLambdaTariffGenerationEnabled()) {
      await startTariffSectionGeneration(chapterSlug, section, () => generate(chapterSlug, body));
      return { status: 'started', section };
    }

    await generate(chapterSlug, body);
    return readIndustryTariffReportBySlug(chapterSlug);
  };
}
