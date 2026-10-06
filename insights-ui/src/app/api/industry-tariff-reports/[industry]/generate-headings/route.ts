import { withAdminOnly } from '@/app/api/helpers/withLoggedInAdmin';
import { IndustryGenerateResponse, industryGenerateRoute } from '@/app/api/industry-tariff-reports/[industry]/industry-generate-handler';
import { getAndWriteIndustryHeadings } from '@/scripts/industry-tariff-reports/00-industry-main-headings';

export const POST = withAdminOnly<IndustryGenerateResponse>(industryGenerateRoute('industryAreas', (slug) => getAndWriteIndustryHeadings(slug)));
