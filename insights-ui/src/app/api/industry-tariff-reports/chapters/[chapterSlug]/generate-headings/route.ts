import { withAdminOnly } from '@/app/api/helpers/withLoggedInAdmin';
import { chapterGenerateRoute, ChapterGenerateResponse } from '@/app/api/industry-tariff-reports/chapters/[chapterSlug]/chapter-generate-handler';
import { getAndWriteIndustryHeadings } from '@/scripts/industry-tariff-reports/00-industry-main-headings';

export const POST = withAdminOnly<ChapterGenerateResponse>(chapterGenerateRoute('industryAreas', (slug) => getAndWriteIndustryHeadings(slug)));
