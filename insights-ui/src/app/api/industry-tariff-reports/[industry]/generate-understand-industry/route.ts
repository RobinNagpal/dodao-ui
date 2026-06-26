import { IndustryGenerateResponse, industryGenerateRoute } from '@/app/api/industry-tariff-reports/[industry]/industry-generate-handler';
import { getAndWriteUnderstandIndustryJson } from '@/scripts/industry-tariff-reports/04-understand-industry';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

export const POST = withErrorHandlingV2<IndustryGenerateResponse>(
  industryGenerateRoute('understandIndustry', (slug) => getAndWriteUnderstandIndustryJson(slug))
);
