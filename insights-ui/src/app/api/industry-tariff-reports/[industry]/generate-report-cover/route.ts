import { withAdminOnly } from '@/app/api/helpers/withLoggedInAdmin';
import { IndustryGenerateResponse, industryGenerateRoute } from '@/app/api/industry-tariff-reports/[industry]/industry-generate-handler';
import { getReportCoverAndSaveToFile } from '@/scripts/industry-tariff-reports/01-industry-cover';

export const POST = withAdminOnly<IndustryGenerateResponse>(industryGenerateRoute('introduction', (slug) => getReportCoverAndSaveToFile(slug)));
