import { readSectionStatuses } from '@/scripts/industry-tariff-reports/tariff-report-repository';
import type { TariffSectionStatusMap } from '@/scripts/industry-tariff-reports/tariff-types';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

export interface SectionStatusResponse {
  sectionStatus: TariffSectionStatusMap;
}

// Lightweight status endpoint for the admin "Generate all" flow in BACKGROUND
// mode (USE_LAMBDA_FOR_TARIFF_LLM_RESPONSE=true — see `chapterGenerateRoute`).
// The admin table's Refresh button re-reads this to see each section's
// Completed/Failed state (the column also records InProgress + the error
// message for debugging).
export const GET = withErrorHandlingV2<SectionStatusResponse>(async (_req: NextRequest, { params }: { params: Promise<{ chapterSlug: string }> }) => {
  const { chapterSlug } = await params;
  if (!chapterSlug) throw new Error('chapterSlug is required');

  const sectionStatus = await readSectionStatuses(chapterSlug);
  return { sectionStatus };
});
