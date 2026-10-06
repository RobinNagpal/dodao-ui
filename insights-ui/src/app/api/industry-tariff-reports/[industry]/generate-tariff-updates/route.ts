import { withAdminOnly } from '@/app/api/helpers/withLoggedInAdmin';
import { IndustryGenerateResponse, industryGenerateRoute } from '@/app/api/industry-tariff-reports/[industry]/industry-generate-handler';
import { getTariffUpdatesForIndustryAndSaveToFile } from '@/scripts/industry-tariff-reports/03-industry-tariffs';
import { getTodayDateAsMonthDDYYYYFormat } from '@/util/get-date';

interface GenerateTariffUpdatesRequest {
  date?: string;
  countryName?: string;
}

export const POST = withAdminOnly<IndustryGenerateResponse>(
  industryGenerateRoute('tariffUpdates', (slug, body) => {
    const { date, countryName } = (body as GenerateTariffUpdatesRequest) ?? {};
    return getTariffUpdatesForIndustryAndSaveToFile(slug, date ?? getTodayDateAsMonthDDYYYYFormat(), countryName);
  })
);
