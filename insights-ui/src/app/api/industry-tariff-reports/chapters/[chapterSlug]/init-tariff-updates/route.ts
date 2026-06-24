import { getTariffUpdatesForIndustryAndSaveToFile, initTariffUpdatesAndSaveToFile } from '@/scripts/industry-tariff-reports/03-industry-tariffs';
import { isLambdaTariffGenerationEnabled, startTariffSectionGeneration } from '@/scripts/industry-tariff-reports/tariff-generation-runner';
import { getTodayDateAsMonthDDYYYYFormat } from '@/util/get-date';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

export interface InitTariffUpdatesResponse {
  countries: string[];
}

// Entry point for the `tariffUpdates` section.
//
// SYNCHRONOUS mode (USE_LAMBDA_FOR_TARIFF_LLM_RESPONSE unset/false): discover the
// top trading partners and return them so the admin UI can fan out one POST to
// `generate-tariff-updates` per country — chunking keeps each request under the
// origin timeout.
//
// BACKGROUND mode (flag true): run the WHOLE section (all countries) as a single
// background task — there's no HTTP timeout to dodge, so no chunking is needed.
// We return an empty country list so the UI's per-country loop is a no-op; the
// background task does everything and progress lands on `section_status`.
export const POST = withErrorHandlingV2<InitTariffUpdatesResponse>(async (_req: NextRequest, { params }: { params: Promise<{ chapterSlug: string }> }) => {
  const { chapterSlug } = await params;
  if (!chapterSlug) throw new Error('chapterSlug is required');

  if (isLambdaTariffGenerationEnabled()) {
    await startTariffSectionGeneration(chapterSlug, 'tariffUpdates', () =>
      getTariffUpdatesForIndustryAndSaveToFile(chapterSlug, getTodayDateAsMonthDDYYYYFormat())
    );
    return { countries: [] };
  }

  const countries = await initTariffUpdatesAndSaveToFile(chapterSlug);
  return { countries };
});
