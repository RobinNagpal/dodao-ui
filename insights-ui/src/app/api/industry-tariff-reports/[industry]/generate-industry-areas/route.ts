import { withAdminOnly } from '@/app/api/helpers/withLoggedInAdmin';
import { IndustryGenerateResponse, industryGenerateRoute } from '@/app/api/industry-tariff-reports/[industry]/industry-generate-handler';
import { getAndWriteIndustryAreaSectionToJsonFile } from '@/scripts/industry-tariff-reports/05-industry-areas';

export const POST = withAdminOnly<IndustryGenerateResponse>(
  industryGenerateRoute('industryAreasSections', (slug) => getAndWriteIndustryAreaSectionToJsonFile(slug))
);
