import { chapterAsyncGenerateRoute, ChapterGenerateStartedResponse } from '@/app/api/industry-tariff-reports/chapters/[chapterSlug]/chapter-generate-handler';
import { getFinalConclusionAndSaveToFile } from '@/scripts/industry-tariff-reports/07-final-conclusion';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

export const POST = withErrorHandlingV2<ChapterGenerateStartedResponse>(
  chapterAsyncGenerateRoute('conclusion', (slug) => getFinalConclusionAndSaveToFile(slug)),
);
