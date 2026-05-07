import { initTariffUpdatesAndSaveToFile } from '@/scripts/industry-tariff-reports/03-industry-tariffs';
import { getTodayDateAsMonthDDYYYYFormat } from '@/util/get-date';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

export const maxDuration = 300;

interface InitTariffUpdatesBody {
  date?: string;
}

export interface InitTariffUpdatesResponse {
  countries: string[];
}

// Phase 1 of the split tariff-updates flow. The bundled
// `generate-tariff-updates` route runs ~6 grounded LLM calls back-to-back,
// which routinely blows past Vercel's function timeout. The admin UI now
// hits this route first to discover the top-5 trading partners, then fans
// out one POST to `generate-tariff-updates` per country.
export const POST = withErrorHandlingV2<InitTariffUpdatesResponse>(async (req: NextRequest, { params }: { params: Promise<{ chapterSlug: string }> }) => {
  const { chapterSlug } = await params;
  if (!chapterSlug) throw new Error('chapterSlug is required');

  let body: InitTariffUpdatesBody = {};
  if (req.headers.get('content-length')) {
    try {
      body = (await req.json()) as InitTariffUpdatesBody;
    } catch {
      body = {};
    }
  }

  const countries = await initTariffUpdatesAndSaveToFile(chapterSlug, body.date ?? getTodayDateAsMonthDDYYYYFormat());
  return { countries };
});
