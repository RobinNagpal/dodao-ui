import { startTariffSectionGeneration } from '@/scripts/industry-tariff-reports/tariff-generation-runner';
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

// Shared handler used by every `/api/industry-tariff-reports/chapters/[chapterSlug]/generate-*` route.
// All section-generator functions take the chapter slug — keep route handlers to a single line by
// wrapping the slug + body parsing + final read here.
export function chapterGenerateRoute(
  generate: (slug: string, body: unknown) => Promise<void>
): (req: NextRequest, ctx: { params: Promise<{ chapterSlug: string }> }) => Promise<IndustryTariffReport> {
  return async (req, { params }) => {
    const { chapterSlug } = await params;
    if (!chapterSlug) throw new Error('chapterSlug is required');

    const body = await parseBody(req);
    await generate(chapterSlug, body);
    return readIndustryTariffReportBySlug(chapterSlug);
  };
}

// Response of the async generate routes — the section was kicked off in the
// background; progress is tracked on `section_status` (read via the
// `section-status` route / the admin table's Refresh button).
export interface ChapterGenerateStartedResponse {
  status: 'started';
  section: ChapterReportField;
}

// Async variant of `chapterGenerateRoute`: instead of awaiting the (multi-minute)
// section generator and returning the full report, it kicks the generator off in
// the background via `startTariffSectionGeneration` and returns immediately. This
// keeps the request well under the CloudFront origin timeout that was 504-ing the
// heavier sections (e.g. understand-industry). `section` is the JSONB column the
// generator populates and the key its status is tracked under.
export function chapterAsyncGenerateRoute(
  section: ChapterReportField,
  generate: (slug: string, body: unknown) => Promise<void>,
): (req: NextRequest, ctx: { params: Promise<{ chapterSlug: string }> }) => Promise<ChapterGenerateStartedResponse> {
  return async (req, { params }) => {
    const { chapterSlug } = await params;
    if (!chapterSlug) throw new Error('chapterSlug is required');

    const body = await parseBody(req);
    await startTariffSectionGeneration(chapterSlug, section, () => generate(chapterSlug, body));
    return { status: 'started', section };
  };
}
