import { IndustryGenerateResponse, industryGenerateRoute } from '@/app/api/industry-tariff-reports/[industry]/industry-generate-handler';
import { getReportCoverAndSaveToFile } from '@/scripts/industry-tariff-reports/01-industry-cover';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

export const POST = withErrorHandlingV2<IndustryGenerateResponse>(industryGenerateRoute('introduction', (slug) => getReportCoverAndSaveToFile(slug)));
