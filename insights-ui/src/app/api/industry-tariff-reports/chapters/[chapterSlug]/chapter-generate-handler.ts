import { readIndustryTariffReportBySlug } from '@/scripts/industry-tariff-reports/tariff-report-repository';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { NextRequest } from 'next/server';

// Shared handler used by every `/api/industry-tariff-reports/chapters/[chapterSlug]/generate-*` route.
// All section-generator functions take the chapter slug — keep route handlers to a single line by
// wrapping the slug + body parsing + final read here.
export function chapterGenerateRoute(
  generate: (slug: string, body: unknown) => Promise<void>
): (req: NextRequest, ctx: { params: Promise<{ chapterSlug: string }> }) => Promise<IndustryTariffReport> {
  return async (req, { params }) => {
    const { chapterSlug } = await params;
    if (!chapterSlug) throw new Error('chapterSlug is required');

    let body: unknown = {};
    if (req.headers.get('content-length')) {
      try {
        body = await req.json();
      } catch {
        body = {};
      }
    }

    await generate(chapterSlug, body);
    return readIndustryTariffReportBySlug(chapterSlug);
  };
}
