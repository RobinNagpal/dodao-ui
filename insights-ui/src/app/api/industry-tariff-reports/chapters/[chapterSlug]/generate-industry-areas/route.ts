import { withAdminOnly } from '@/app/api/helpers/withLoggedInAdmin';
import { chapterGenerateRoute, ChapterGenerateResponse } from '@/app/api/industry-tariff-reports/chapters/[chapterSlug]/chapter-generate-handler';
import { getAndWriteIndustryAreaSectionToJsonFile } from '@/scripts/industry-tariff-reports/05-industry-areas';

export const POST = withAdminOnly<ChapterGenerateResponse>(
  chapterGenerateRoute('industryAreasSections', (slug) => getAndWriteIndustryAreaSectionToJsonFile(slug))
);
