import { chapterGenerateRoute, ChapterGenerateResponse } from '@/app/api/industry-tariff-reports/chapters/[chapterSlug]/chapter-generate-handler';
import { getAndWriteIndustryAreaSectionToJsonFile } from '@/scripts/industry-tariff-reports/05-industry-areas';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

export const POST = withErrorHandlingV2<ChapterGenerateResponse>(
  chapterGenerateRoute('industryAreasSections', (slug) => getAndWriteIndustryAreaSectionToJsonFile(slug))
);
