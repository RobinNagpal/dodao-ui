import { readSectionStatuses } from '@/scripts/industry-tariff-reports/tariff-report-repository';
import type { TariffSectionStatusMap } from '@/scripts/industry-tariff-reports/tariff-types';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

export interface SectionStatusResponse {
  sectionStatus: TariffSectionStatusMap;
}

// Lightweight polling endpoint for the admin "Generate all" flow. Sections are
// generated asynchronously (see `chapterAsyncGenerateRoute`); the UI polls this
// to learn when each section flips to Completed/Failed before firing the next.
export const GET = withErrorHandlingV2<SectionStatusResponse>(async (_req: NextRequest, { params }: { params: Promise<{ chapterSlug: string }> }) => {
  const { chapterSlug } = await params;
  if (!chapterSlug) throw new Error('chapterSlug is required');

  const sectionStatus = await readSectionStatuses(chapterSlug);
  return { sectionStatus };
});
