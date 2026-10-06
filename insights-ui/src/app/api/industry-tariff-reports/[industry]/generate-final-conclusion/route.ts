import { withAdminOnly } from '@/app/api/helpers/withLoggedInAdmin';
import { IndustryGenerateResponse, industryGenerateRoute } from '@/app/api/industry-tariff-reports/[industry]/industry-generate-handler';
import { getFinalConclusionAndSaveToFile } from '@/scripts/industry-tariff-reports/07-final-conclusion';

export const POST = withAdminOnly<IndustryGenerateResponse>(industryGenerateRoute('conclusion', (slug) => getFinalConclusionAndSaveToFile(slug)));
