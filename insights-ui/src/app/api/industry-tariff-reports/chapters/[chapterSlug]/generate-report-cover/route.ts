import { withAdminOnly } from '@/app/api/helpers/withLoggedInAdmin';
import { chapterGenerateRoute, ChapterGenerateResponse } from '@/app/api/industry-tariff-reports/chapters/[chapterSlug]/chapter-generate-handler';
import { getReportCoverAndSaveToFile } from '@/scripts/industry-tariff-reports/01-industry-cover';

export const POST = withAdminOnly<ChapterGenerateResponse>(chapterGenerateRoute('introduction', (slug) => getReportCoverAndSaveToFile(slug)));
