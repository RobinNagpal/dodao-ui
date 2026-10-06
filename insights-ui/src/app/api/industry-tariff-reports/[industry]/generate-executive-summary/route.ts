import { withAdminOnly } from '@/app/api/helpers/withLoggedInAdmin';
import { IndustryGenerateResponse, industryGenerateRoute } from '@/app/api/industry-tariff-reports/[industry]/industry-generate-handler';
import { getExecutiveSummaryAndSaveToFile } from '@/scripts/industry-tariff-reports/02-executive-summary';

export const POST = withAdminOnly<IndustryGenerateResponse>(industryGenerateRoute('executiveSummary', (slug) => getExecutiveSummaryAndSaveToFile(slug)));
