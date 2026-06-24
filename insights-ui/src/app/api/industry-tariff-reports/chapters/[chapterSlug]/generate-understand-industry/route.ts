import { chapterAsyncGenerateRoute, ChapterGenerateStartedResponse } from '@/app/api/industry-tariff-reports/chapters/[chapterSlug]/chapter-generate-handler';
import { getAndWriteUnderstandIndustryJson } from '@/scripts/industry-tariff-reports/04-understand-industry';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

export const POST = withErrorHandlingV2<ChapterGenerateStartedResponse>(
  chapterAsyncGenerateRoute('understandIndustry', (slug) => getAndWriteUnderstandIndustryJson(slug)),
);
