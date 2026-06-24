import { chapterAsyncGenerateRoute, ChapterGenerateStartedResponse } from '@/app/api/industry-tariff-reports/chapters/[chapterSlug]/chapter-generate-handler';
import { getExecutiveSummaryAndSaveToFile } from '@/scripts/industry-tariff-reports/02-executive-summary';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

export const POST = withErrorHandlingV2<ChapterGenerateStartedResponse>(
  chapterAsyncGenerateRoute('executiveSummary', (slug) => getExecutiveSummaryAndSaveToFile(slug)),
);
