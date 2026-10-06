import { withAdminOnly } from '@/app/api/helpers/withLoggedInAdmin';
import { chapterGenerateRoute, ChapterGenerateResponse } from '@/app/api/industry-tariff-reports/chapters/[chapterSlug]/chapter-generate-handler';
import { getExecutiveSummaryAndSaveToFile } from '@/scripts/industry-tariff-reports/02-executive-summary';

export const POST = withAdminOnly<ChapterGenerateResponse>(chapterGenerateRoute('executiveSummary', (slug) => getExecutiveSummaryAndSaveToFile(slug)));
