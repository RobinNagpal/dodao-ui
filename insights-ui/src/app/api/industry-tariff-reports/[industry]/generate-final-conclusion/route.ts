import { IndustryGenerateResponse, industryGenerateRoute } from '@/app/api/industry-tariff-reports/[industry]/industry-generate-handler';
import { getFinalConclusionAndSaveToFile } from '@/scripts/industry-tariff-reports/07-final-conclusion';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

export const POST = withErrorHandlingV2<IndustryGenerateResponse>(industryGenerateRoute('conclusion', (slug) => getFinalConclusionAndSaveToFile(slug)));
