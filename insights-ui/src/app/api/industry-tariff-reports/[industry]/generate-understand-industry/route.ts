import { withAdminOnly } from '@/app/api/helpers/withLoggedInAdmin';
import { IndustryGenerateResponse, industryGenerateRoute } from '@/app/api/industry-tariff-reports/[industry]/industry-generate-handler';
import { getAndWriteUnderstandIndustryJson } from '@/scripts/industry-tariff-reports/04-understand-industry';

export const POST = withAdminOnly<IndustryGenerateResponse>(industryGenerateRoute('understandIndustry', (slug) => getAndWriteUnderstandIndustryJson(slug)));
