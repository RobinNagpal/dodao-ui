import { chapterGenerateRoute, ChapterGenerateResponse } from '@/app/api/industry-tariff-reports/chapters/[chapterSlug]/chapter-generate-handler';
import { getReportCoverAndSaveToFile } from '@/scripts/industry-tariff-reports/01-industry-cover';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

export const POST = withErrorHandlingV2<ChapterGenerateResponse>(chapterGenerateRoute('introduction', (slug) => getReportCoverAndSaveToFile(slug)));
