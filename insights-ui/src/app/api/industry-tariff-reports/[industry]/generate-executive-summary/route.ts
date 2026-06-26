import { IndustryGenerateResponse, industryGenerateRoute } from '@/app/api/industry-tariff-reports/[industry]/industry-generate-handler';
import { getExecutiveSummaryAndSaveToFile } from '@/scripts/industry-tariff-reports/02-executive-summary';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

export const POST = withErrorHandlingV2<IndustryGenerateResponse>(industryGenerateRoute('executiveSummary', (slug) => getExecutiveSummaryAndSaveToFile(slug)));
