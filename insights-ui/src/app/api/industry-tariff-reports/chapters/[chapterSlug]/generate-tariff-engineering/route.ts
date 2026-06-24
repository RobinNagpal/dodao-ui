import { chapterAsyncGenerateRoute, ChapterGenerateStartedResponse } from '@/app/api/industry-tariff-reports/chapters/[chapterSlug]/chapter-generate-handler';
import { getAndWriteTariffEngineeringJson } from '@/scripts/industry-tariff-reports/06-tariff-engineering';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

export const POST = withErrorHandlingV2<ChapterGenerateStartedResponse>(
  chapterAsyncGenerateRoute('tariffEngineering', (slug) => getAndWriteTariffEngineeringJson(slug)),
);
