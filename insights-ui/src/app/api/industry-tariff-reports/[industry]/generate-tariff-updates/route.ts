import { IndustryGenerateResponse, industryGenerateRoute } from '@/app/api/industry-tariff-reports/[industry]/industry-generate-handler';
import { getTariffUpdatesForIndustryAndSaveToFile } from '@/scripts/industry-tariff-reports/03-industry-tariffs';
import { getTodayDateAsMonthDDYYYYFormat } from '@/util/get-date';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

interface GenerateTariffUpdatesRequest {
  date?: string;
  countryName?: string;
}

export const POST = withErrorHandlingV2<IndustryGenerateResponse>(
  industryGenerateRoute('tariffUpdates', (slug, body) => {
    const { date, countryName } = (body as GenerateTariffUpdatesRequest) ?? {};
    return getTariffUpdatesForIndustryAndSaveToFile(slug, date ?? getTodayDateAsMonthDDYYYYFormat(), countryName);
  })
);
