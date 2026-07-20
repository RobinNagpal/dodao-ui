import type { ChapterGenerateStartedResponse } from '@/app/api/industry-tariff-reports/chapters/[chapterSlug]/chapter-generate-handler';
import { isSyncTariffGenerationEnabled, startTariffSectionGeneration } from '@/scripts/industry-tariff-reports/tariff-generation-runner';
import { findReportSlugByOldUrl, readIndustryTariffReportByOldUrl } from '@/scripts/industry-tariff-reports/tariff-report-repository';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import type { ChapterReportField } from '@/utils/tariff-reports/chapter-generate-sections';
import { NextRequest } from 'next/server';

export async function parseBody(req: NextRequest): Promise<unknown> {
  if (!req.headers.get('content-length')) return {};
  try {
    return await req.json();
  } catch {
    return {};
  }
}

// Either shape, depending on the env flag: the full report (synchronous) or a
// "started" ack (background). Mirrors `ChapterGenerateResponse` on the
// chapter-slug routes.
export type IndustryGenerateResponse = IndustryTariffReport | ChapterGenerateStartedResponse;

// Shared handler for the old-URL `/api/industry-tariff-reports/[industry]/generate-*`
// section routes (the section-action dropdowns on the report pages). Same gate as
// `chapterGenerateRoute`, keyed by the old industry URL instead of the chapter slug:
//   - `GENERATE_TARIFF_SECTIONS_SYNCHRONOUSLY` unset/false (default) → run
//     `generate` in the BACKGROUND and return immediately (no CloudFront 504); the
//     content lands in the DB when the task finishes — refresh to see it.
//   - flag `true` → run `generate` SYNCHRONOUSLY and return the full report (the
//     original behavior — the request waits for the LLM call).
//
// `section` is the JSONB column the generator populates (used for background logging).
export function industryGenerateRoute(
  section: ChapterReportField,
  generate: (slug: string, body: unknown) => Promise<void>
): (req: NextRequest, ctx: { params: Promise<{ industry: string }> }) => Promise<IndustryGenerateResponse> {
  return async (req, { params }) => {
    const { industry } = await params;
    if (!industry) throw new Error('Industry is required');

    const body = await parseBody(req);
    const slug = await findReportSlugByOldUrl(industry);

    if (await isSyncTariffGenerationEnabled()) {
      await generate(slug, body);
      return readIndustryTariffReportByOldUrl(industry);
    }

    startTariffSectionGeneration(slug, section, () => generate(slug, body));
    return { status: 'started', section };
  };
}
