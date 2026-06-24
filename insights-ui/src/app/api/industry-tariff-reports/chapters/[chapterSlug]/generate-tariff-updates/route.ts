import { chapterGenerateRoute } from '@/app/api/industry-tariff-reports/chapters/[chapterSlug]/chapter-generate-handler';
import { getTariffUpdatesForIndustryAndSaveToFile } from '@/scripts/industry-tariff-reports/03-industry-tariffs';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { getTodayDateAsMonthDDYYYYFormat } from '@/util/get-date';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

// Tariff updates fan out to 6 grounded LLM calls (top-5 countries lookup + one
// per-country tariff query). The default Vercel timeout (60s) is well under the
// realistic worst-case latency, and a mid-flight timeout previously left us with
// nothing persisted. Raise to the Pro-plan max so the chain has room to finish.
interface GenerateTariffUpdatesBody {
  date?: string;
  countryName?: string;
}

export const POST = withErrorHandlingV2<IndustryTariffReport>(
  chapterGenerateRoute(async (slug, body) => {
    const { date, countryName } = (body as GenerateTariffUpdatesBody) ?? {};
    await getTariffUpdatesForIndustryAndSaveToFile(slug, date ?? getTodayDateAsMonthDDYYYYFormat(), countryName);
  }),
);
